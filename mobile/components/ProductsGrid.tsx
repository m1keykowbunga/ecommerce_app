import useWishlist from "@/hooks/useWishlist";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import useCart from "@/hooks/useCart";
import { useState } from "react";

interface ProductsGridProps {
    isLoading: boolean;
    isError: boolean;
    products: Product[];
}

const ProductImage = ({ uri }: { uri: string }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <View className="w-full h-40 bg-ui-surface">
            {loading && !error && (
                <View className="absolute inset-0 items-center justify-center bg-gray-100">
                    <ActivityIndicator size="small" color="#5B3A29" />
                </View>
            )}

            {error && (
                <View className="absolute inset-0 items-center justify-center bg-gray-100">
                    <Ionicons name="image-outline" size={32} color="#999" />
                </View>
            )}

            <Image
                source={{ uri }}
                className="w-full h-40"
                resizeMode="contain"
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => { setError(true); setLoading(false); }}
                fadeDuration={200}
            />
        </View>
    );
};

const ProductsGrid = ({ products, isLoading, isError }: ProductsGridProps) => {
    const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();
    const { isAddingToCart, addToCart } = useCart();

    const handleAddToCart = async (productId: string, productName: string) => {
        try {
            await addToCart({ productId, quantity: 1 });
            Alert.alert("Producto agregado al carrito", `${productName}`);
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.error || "No se pudo agregar el producto al carrito");
        }
    };

    const renderProduct = ({ item: product }: { item: Product }) => (
        <TouchableOpacity
            className="bg-ui-surface/55 rounded-3xl overflow-hidden mb-3"
            style={{ width: "48%" }}
            activeOpacity={0.8}
            onPress={() => router.push({
                pathname: "/product/[id]",
                params: { id: product._id }
            })}
        >
            {/* IMAGE */}
            <View className="relative">
                <ProductImage uri={product.images[0]} />
                <TouchableOpacity
                    className="absolute top-3 right-3 bg-brand-secondary/10 backdrop-blur-xl p-2 rounded-full"
                    activeOpacity={0.7}
                    onPress={() => toggleWishlist(product._id)}
                    disabled={isAddingToWishlist || isRemovingFromWishlist}
                >
                    <Ionicons
                        name={isInWishlist(product._id) ? "heart" : "heart-outline"}
                        size={18}
                        color={isInWishlist(product._id) ? "#C34928" : "#5B3A29"}
                    />
                </TouchableOpacity>
            </View>

            <View className="p-3">
                <Text className="text-text-secondary text-xs mb-1">{product.category}</Text>
                <Text className="text-text-primary font-bold text-sm mb-2" numberOfLines={2}>
                    {product.name}
                </Text>

                <View className="flex-row items-center mb-2">
                    <Ionicons name="star" size={12} color="#FFC107" />
                    <Text className="text-text-primary text-xs font-semibold ml-1">
                        {product.averageRating.toFixed(1)}
                    </Text>
                    <Text className="text-text-secondary text-xs ml-1">({product.totalReviews})</Text>
                </View>

                <View className="flex-row items-center justify-between">
                    <Text className="text-brand-accent font-bold text-lg">${product.price} COP</Text>
                    <TouchableOpacity
                        className="bg-brand-secondary/45 rounded-full w-8 h-8 items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() => handleAddToCart(product._id, product.name)}
                        disabled={isAddingToCart}
                    >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View className="py-20 items-center justify-center">
                <ActivityIndicator size="large" color="#5B3A29" />
                <Text className="text-text-secondary mt-4">Cargando productos...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View className="py-20 items-center justify-center">
                <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                <Text className="text-text-primary font-semibold mt-4">Error al cargar los productos</Text>
                <Text className="text-text-secondary text-sm mt-2">Por favor intenta nuevamente</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={NoProductsFound}
        />
    );
}

export default ProductsGrid

function NoProductsFound() {
    return (
        <View className="py-20 items-center justify-center">
            <Ionicons name="search-outline" size={48} color={"#666"} />
            <Text className="text-text-primary font-semibold mt-4">No se encontraron productos</Text>
            <Text className="text-text-secondary text-sm mt-2">Ajusta los filtros para encontrar más productos</Text>
        </View>
    );
}