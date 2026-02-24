import SafeScreen from "@/components/SafeScreen";
import { Header } from "@/components/Header";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useAddresses } from "@/hooks/useAddresses";
import useCart from "@/hooks/useCart";
import { useApi } from "@/lib/api";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import OrderSummary from "@/components/OrderSummary";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import PaymentMethodModal from "@/components/PaymentMethod";

import * as Sentry from "@sentry/react-native";

interface AppliedCoupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

const calculateDiscount = (subtotal: number, coupon: AppliedCoupon | null): number => {
  if (!coupon) return 0;
  if (coupon.discountType === "percentage") {
    return Math.round((subtotal * coupon.discountValue) / 100);
  }
  return Math.min(coupon.discountValue, subtotal);
};

const CartScreen = () => {
  const api = useApi();
  const {
    cart,
    cartItemCount,
    cartTotal,
    clearCart,
    isError,
    isLoading,
    isRemoving,
    isUpdating,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { addresses } = useAddresses();

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [paymentMethodModalVisible, setPaymentMethodModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const cartItems = cart?.items || [];
  const subtotal = cartTotal;
  const shipping = 10000;
  const discount = calculateDiscount(subtotal, appliedCoupon);
  const total = subtotal + shipping - discount;

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateQuantity({ productId, quantity: newQuantity });
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert("Eliminar Producto", `¿Desea eliminar ${productName} del carrito?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setCouponError(null);
    setCouponLoading(true);

    try {
      const { data } = await api.post("/coupons/validate", { code, subtotal });
      setAppliedCoupon(data.coupon);
      setCouponInput("");
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        "No se pudo validar el cupón. Intenta de nuevo.";
      setCouponError(message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput("");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!addresses || addresses.length === 0) {
      Alert.alert(
        "No tienes direcciones guardadas",
        "Por favor, agrega una dirección de envío en tu perfil antes de realizar el pago",
        [{ text: "OK" }]
      );
      return;
    }

    setAddressModalVisible(true);
  };

  const handleAddressSelected = (address: Address) => {
    setSelectedAddress(address);
    setAddressModalVisible(false);
    setPaymentMethodModalVisible(true);
  };

  const handleCreditCardPayment = async () => {
    if (!selectedAddress) return;

    setPaymentMethodModalVisible(false);

    Sentry.logger.info("Redirigiendo a Plataforma de Pago", {
      itemCount: cartItemCount,
      total: total,
      city: selectedAddress.city,
      couponCode: appliedCoupon?.code ?? null,
      discount,
    });

    try {
      setPaymentLoading(true);

      const { data } = await api.post("/payment/create-intent", {
        cartItems,
        couponCode: appliedCoupon?.code ?? null,
        shippingAddress: {
          fullName: selectedAddress.fullName,
          streetAddress: selectedAddress.streetAddress,
          city: selectedAddress.city,
          phoneNumber: selectedAddress.phoneNumber,
        },
      });

      if (!data.clientSecret) {
        throw new Error("Error al inicializar el pago. Intenta nuevamente.");
      }

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: "Don Palito Junior",
        appearance: {
          colors: {
            primary: "#B06A4A"
          },
        },
        defaultBillingDetails: {
          name: selectedAddress.fullName,
          phone: selectedAddress.phoneNumber,
        },
        allowsDelayedPaymentMethods: false,
      });

      if (initError) {
        Sentry.logger.error("Error al iniciar el pago", {
          errorCode: initError.code,
          errorMessage: initError.message,
          cartTotal: total,
          itemCount: cartItems.length,
        });

        Alert.alert("Error", initError.message);
        setPaymentLoading(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Sentry.logger.error("Pago Cancelado", {
          errorCode: presentError.code,
          errorMessage: presentError.message,
          cartTotal: total,
          itemCount: cartItems.length,
        });

        if (presentError.code !== 'Canceled') {
          Alert.alert("Error en el Pago", presentError.message);
        } else {
          console.log("Usuario canceló el pago");
        }
      } else {
        Sentry.logger.info("Pago Exitoso", {
          total: total,
          itemCount: cartItems.length,
          couponCode: appliedCoupon?.code ?? null,
        });

        Alert.alert("Éxito", "Tu pago se realizó correctamente. Tu orden será procesada.",
          [
            { text: "OK", onPress: () => { } },
          ]);
        clearCart();
        handleRemoveCoupon();
      }
    } catch (error: any) {
      Sentry.logger.error("Pago fallido", {
        error: error instanceof Error ? error.message : "Error desconocido",
        errorDetails: error?.response?.data,
        cartTotal: total,
        itemCount: cartItems.length,
      });

      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Error al procesar el pago. Por favor, intenta de nuevo.";

      Alert.alert("Error", errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleBankTransferPayment = async () => {
    if (!selectedAddress) return;
    setPaymentMethodModalVisible(false);

    try {
      setPaymentLoading(true);

      await api.post("/payment/create-transfer-order", {
        cartItems,
        couponCode: appliedCoupon?.code ?? null,
        shippingAddress: {
          fullName: selectedAddress.fullName,
          streetAddress: selectedAddress.streetAddress,
          city: selectedAddress.city,
          phoneNumber: selectedAddress.phoneNumber,
        },
      });

      clearCart();
      handleRemoveCoupon();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        "Error al procesar el pedido. Por favor, intenta de nuevo.";
      Alert.alert("Error", errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderCouponLabel = () => {
    if (!appliedCoupon) return null;
    if (appliedCoupon.discountType === "percentage") {
      return `${appliedCoupon.code} (-${appliedCoupon.discountValue}%)`;
    }
    return `${appliedCoupon.code} (-$${discount} COP)`;
  };

  if (isLoading && cartItems.length === 0) {
    return <SafeScreen><LoadingState /></SafeScreen>;
  }

  if (isError && cartItems.length === 0) {
    return <SafeScreen><ErrorState /></SafeScreen>;
  }

  return (
    <SafeScreen>
      <Header header="Carrito" />
      {!isLoading && cartItems.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Tu carrito está vacío"
          description="Agrega productos para comenzar"
        />
      ) : (
        <>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 240 }}
          >
            <View className="px-6 gap-2">
              {cartItems.map((item) => (
                <View key={item._id} className="bg-ui-surface/55 rounded-3xl overflow-hidden ">
                  <View className="p-4 flex-row">
                    <View className="relative">
                      <View className="flex-1"
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: 16,
                          overflow: 'hidden',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <Image
                          source={item.product.images[0]}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="contain"
                        />
                      </View>
                      <View className="absolute top-2 right-2 bg-brand-primary rounded-full px-2 py-0.5">
                        <Text className="text-white text-xs font-bold">×{item.quantity}</Text>
                      </View>
                    </View>

                    <View className="flex-1 ml-4 justify-between">
                      <View>
                        <Text
                          className="text-text-primary font-bold text-lg leading-tight"
                          numberOfLines={2}
                        >
                          {item.product.name}
                        </Text>
                        <View className="flex-row items-center mt-2">
                          <Text className="text-brand-accent font-bold text-2xl">
                            ${(item.product.price * item.quantity)} COP
                          </Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-text-secondary text-sm ml-2">
                            ${item.product.price} COP unidad
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center mt-3">
                        <TouchableOpacity
                          className="bg-brand-secondary/40 rounded-full w-9 h-9 items-center justify-center"
                          activeOpacity={0.7}
                          onPress={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                          disabled={isUpdating}
                        >
                          <Ionicons name="remove" size={18} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View className="mx-4 min-w-[32px] items-center">
                          <Text className="text-brand-secondary font-bold text-lg">{item.quantity}</Text>
                        </View>

                        <TouchableOpacity
                          className="bg-brand-secondary/40 rounded-full w-9 h-9 items-center justify-center"
                          activeOpacity={0.7}
                          onPress={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                          disabled={isUpdating}
                        >
                          <Ionicons name="add" size={18} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="ml-auto bg-red-500/10 rounded-full w-9 h-9 items-center justify-center"
                          activeOpacity={0.7}
                          onPress={() => handleRemoveItem(item.product._id, item.product.name)}
                          disabled={isRemoving}
                        >
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      {item.quantity >= item.product.stock && (
                        <Text className="text-orange-500 text-sm mt-2">Seleccionaste la cantidad máxima disponible</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View className="px-6 mt-4">
              <View className="bg-ui-surface/55 rounded-3xl p-4">
                <Text className="text-brand-primary font-bold text-base mb-3">
                  Cupón de Descuento
                </Text>

                {appliedCoupon ? (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="bg-brand-primary/20 rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                        <Ionicons
                          name="pricetag-outline"
                          size={14}
                          color="#B06A4A"
                        />
                        <Text className="text-brand-primary font-bold text-sm">
                          {renderCouponLabel()}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={handleRemoveCoupon}
                      className="bg-red-500/10 rounded-full w-8 h-8 items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <View className="flex-row gap-2">
                      <TextInput
                        className="flex-1 bg-white/10 border border-brand-secondary/30 rounded-xl px-4 py-3 text-text-primary text-sm"
                        placeholder="Ingresa tu cupón"
                        placeholderTextColor="#9CA3AF"
                        value={couponInput}
                        onChangeText={(text) => {
                          setCouponInput(text);
                          if (couponError) setCouponError(null);
                        }}
                        autoCapitalize="characters"
                        returnKeyType="done"
                        onSubmitEditing={handleApplyCoupon}
                        editable={!couponLoading}
                      />
                      <TouchableOpacity
                        className="bg-brand-primary rounded-xl px-4 items-center justify-center"
                        activeOpacity={0.8}
                        onPress={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        style={{ opacity: couponLoading || !couponInput.trim() ? 0.6 : 1 }}
                      >
                        {couponLoading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text className="text-white font-bold text-sm">
                            Aplicar
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    {couponError && (
                      <View className="flex-row items-center mt-2 gap-1">
                        <Ionicons
                          name="alert-circle-outline"
                          size={14}
                          color="#EF4444"
                        />
                        <Text className="text-red-400 text-xs flex-1">
                          {couponError}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            <OrderSummary subtotal={subtotal} shipping={shipping} total={total} discount={discount} couponLabel={renderCouponLabel()} />
          </ScrollView>
          <View
            className="absolute bottom-0 left-0 right-0 bg-brand-secondary/20 backdrop-blur-xl border-t border-brand-secondary/30 pt-4 pb-16 px-6"
          >
            <TouchableOpacity
              className="bg-brand-primary rounded-2xl overflow-hidden"
              activeOpacity={0.9}
              onPress={handleCheckout}
              disabled={paymentLoading}
            >
              <View className="py-5 flex-row items-center justify-center">
                {paymentLoading ? (
                  <ActivityIndicator size="small" color="#5B3A29" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">Continuar</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onProceed={handleAddressSelected}
        isProcessing={false}
      />
      <PaymentMethodModal
        visible={paymentMethodModalVisible}
        onClose={() => setPaymentMethodModalVisible(false)}
        onCreditCardSelected={handleCreditCardPayment}
        onBankTransferSelected={handleBankTransferPayment}
        total={total}
      />
    </SafeScreen>
  );
};

export default CartScreen;

