import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Linking, Alert } from "react-native";

const FOOTER_HEIGHT = 96;

interface PaymentMethodModalProps {
    visible: boolean;
    onClose: () => void;
    onCreditCardSelected: () => void;
    onBankTransferSelected: () => void;
    total: number;
}

const PaymentMethodModal = ({
    visible,
    onClose,
    onCreditCardSelected,
    onBankTransferSelected,
    total,
}: PaymentMethodModalProps) => {
    const [selectedMethod, setSelectedMethod] = useState<"card" | "transfer" | null>(null);

    // Datos bancarios del negocio
    const bankDetails = {
        bankName: "Bancolombia",
        accountType: "Cuenta de Ahorros",
        accountNumber: "123-456789-01",
        accountHolder: "Don Palito Junior S.A.S",
        nit: "900.123.456-7",
        whatsappNumber: "+573207194098"
    };

    const handleProceed = () => {
        if (selectedMethod === "card") {
            onCreditCardSelected();
        } else if (selectedMethod === "transfer") {
            onBankTransferSelected();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-ui-background">
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                >
                    {/* Modal Header */}
                    <View className="flex-row items-center justify-between p-6">
                        <Text className="text-brand-secondary text-2xl font-bold">Método de Pago</Text>
                        <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#5B3A29" />
                        </TouchableOpacity>
                    </View>

                    {/* PAYMENT METHODS LIST */}
                    <ScrollView
                        contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingVertical: 16,
                        paddingBottom: FOOTER_HEIGHT + 16,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Total a Pagar */}
                        <View className="bg-brand-primary/20 rounded-2xl p-4 mb-6">
                            <Text className="text-brand-secondary font-semibold text-sm mb-1">Total a pagar</Text>
                            <Text className="text-brand-accent text-3xl font-bold">${total} COP</Text>
                        </View>

                        <View className="gap-3">
                            {/* Opción 1: Tarjeta de Crédito */}
                            <TouchableOpacity
                                className={`bg-ui-surface/40 rounded-3xl p-4 border-2 ${
                                selectedMethod === "card"
                                    ? "border-brand-accent"
                                    : "border-brand-secondary/30"
                                }`}
                                activeOpacity={0.7}
                                onPress={() => setSelectedMethod("card")}
                            >
                                <View className="flex-row items-start justify-between">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-3">
                                    <View className="w-12 h-12 rounded-full bg-brand-secondary/30 items-center justify-center mr-3">
                                        <Ionicons name="card" size={24} color="#5B3A29" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-brand-secondary font-bold text-lg">
                                        Tarjeta de Crédito
                                        </Text>
                                        <Text className="text-text-secondary text-sm mt-1">
                                        Pago seguro con Stripe
                                        </Text>
                                    </View>
                                    </View>
                                    <View className="flex-row items-center mt-2">
                                    <Ionicons name="shield-checkmark" size={16} color="#1DB954" />
                                    <Text className="text-text-secondary text-sm ml-2">
                                        Transacción encriptada y segura
                                    </Text>
                                    </View>
                                </View>
                                {selectedMethod === "card" && (
                                    <View className="ml-3">
                                    <Ionicons name="checkmark" size={24} color="#C34928" />
                                    </View>
                                )}
                                </View>
                            </TouchableOpacity>

                            {/* Opción 2: Transferencia Bancaria */}
                            <TouchableOpacity
                                className={`bg-ui-surface/40 rounded-3xl p-4 border-2 ${
                                selectedMethod === "transfer"
                                    ? "border-brand-accent"
                                    : "border-brand-secondary/30"
                                }`}
                                activeOpacity={0.7}
                                onPress={() => setSelectedMethod("transfer")}
                            >
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-3">
                                            <View className="w-12 h-12 rounded-full bg-brand-secondary/30 items-center justify-center mr-3">
                                                <Ionicons name="business" size={24} color="#5B3A29" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-brand-secondary font-bold text-lg">
                                                Transferencia Bancaria
                                                </Text>
                                                <Text className="text-text-secondary text-sm mt-1">
                                                Paga directamente a nuestra cuenta
                                                </Text>
                                            </View>
                                        </View>

                                        {selectedMethod === "transfer" && (
                                        <>
                                            {/* Datos Bancarios */}
                                            <View className="bg-brand-secondary/5 rounded-xl p-4 mt-3 mb-4">
                                                <View className="mb-3">
                                                    <Text className="text-text-secondary text-xs mb-1">Banco</Text>
                                                    <Text className="text-text-primary font-semibold">
                                                    {bankDetails.bankName}
                                                    </Text>
                                                </View>

                                                <View className="mb-3">
                                                    <Text className="text-text-secondary text-xs mb-1">Tipo de Cuenta</Text>
                                                    <Text className="text-text-primary font-semibold">
                                                    {bankDetails.accountType}
                                                    </Text>
                                                </View>

                                                <View className="mb-3">
                                                    <Text className="text-text-secondary text-xs mb-1">
                                                    Número de Cuenta
                                                    </Text>
                                                    <Text className="text-brand-accent font-bold text-lg">
                                                    {bankDetails.accountNumber}
                                                    </Text>
                                                </View>

                                                <View className="mb-3">
                                                    <Text className="text-text-secondary text-xs mb-1">Titular</Text>
                                                    <Text className="text-text-primary font-semibold">
                                                    {bankDetails.accountHolder}
                                                    </Text>
                                                </View>

                                                <View>
                                                    <Text className="text-text-secondary text-xs mb-1">NIT</Text>
                                                    <Text className="text-text-primary font-semibold">
                                                    {bankDetails.nit}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Instrucciones */}
                                            <View className="bg-green-500/10 rounded-xl p-3">
                                                <View className="flex-row items-start">
                                                    <Ionicons name="information-circle" size={20} color="#1DB954" />
                                                    <Text className="text-text-primary text-xs ml-2 flex-1">
                                                    Después de realizar la transferencia, envía el comprobante por
                                                    WhatsApp para confirmar tu pedido.
                                                    </Text>
                                                </View>
                                            </View>
                                        </>
                                        )}
                                    </View>
                                    {selectedMethod === "transfer" && (
                                        <View className="ml-3">
                                        <Ionicons name="checkmark" size={24} color="#C34928" />
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* Footer con botón de continuar */}
                    <View
                        style={{ height: FOOTER_HEIGHT }}
                        className="absolute bottom-0 left-0 right-0 p-4 border-t border-brand-secondary/30 bg-ui-surface/50"
                    >
                        <TouchableOpacity
                            className="bg-brand-primary rounded-2xl py-5"
                            activeOpacity={0.9}
                            onPress={handleProceed}
                            disabled={!selectedMethod}
                        >
                            <View className="flex-row items-center justify-center">
                                {selectedMethod === "transfer" ? (
                                <>
                                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                                    <Text className="text-white font-bold text-lg ml-2">
                                    Continuar
                                    </Text>
                                </>
                                ) : (
                                <>
                                    <Text className="text-white font-bold text-lg mr-2">Continuar con el Pago</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                                </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default PaymentMethodModal;
