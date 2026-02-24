import React from 'react'
import { Text, ScrollView, View, TouchableOpacity, TextInput, Image, Linking } from 'react-native'
import SafeScreen from '@/components/SafeScreen'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import { useMemo } from 'react'
import useProducts from '@/hooks/useProducts'
import ProductsGrid from '@/components/ProductsGrid'

const WHATSAPP_NUMBER = "+573207194098";
const WHATSAPP_MESSAGE = "Hola, me gustaría obtener más información sobre sus productos.";

const CATEGORIES = [
  { name: "All", icon: "grid" as const },
  { name: "Palitos Premium", image: require("@/assets/images/mozzarella_coctelero.png") },
  { name: "Palitos Cocteleros", image: require("@/assets/images/guayaba_coctelero.png") },
  { name: "Dulces", image: require("@/assets/images/oblea.png") },
  { name: "Especiales", image: require("@/assets/images/especiales.png") },
  { name: "Nuevos", image: require("@/assets/images/panocha.png") },
];

const ShopScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: products, isLoading, isError } = useProducts();

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const handleWhatsApp = () => {
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    const webUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

    Linking.canOpenURL(url)
      .then((supported) => Linking.openURL(supported ? url : webUrl))
      .catch(() => Linking.openURL(webUrl));
  };

  return (
    <SafeScreen>
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View className="px-6 pb-4">
            <View className="items-center">
              <Image
                source={require("../../assets/images/donpalito.png")}
                className="w-52 h-52"
                resizeMode="contain"
              />
            </View>
            {/* SEARCH BAR */}
            <View
              className="bg-ui-surface flex-row items-center px-3 py-2 rounded-2xl border border-brand-secondary/20"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <View className="bg-brand-secondary/10 p-3 rounded-full">
                <Ionicons name="search" size={20} color="#5B3A29" />
              </View>

              <TextInput
                placeholder="Buscar productos"
                placeholderTextColor="#999999"
                className="flex-1 ml-3 text-base text-text-primary"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* CATEGORY FILTER */}
          <View className="mb-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.name;
                return (
                  <TouchableOpacity
                    key={category.name}
                    onPress={() => setSelectedCategory(category.name)}
                    className={`mr-4`}
                  >
                    {/* CARD */}
                    <View
                      className={`w-20 h-20 rounded-2xl items-center justify-center bg-white`}
                    >
                      {category.icon ? (
                        <Ionicons
                          name={category.icon}
                          size={34}
                          color={isSelected ? "#C34928" : "#5B3A29"}
                        />
                      ) : (
                        <Image
                          source={category.image}
                          className="w-12 h-12"
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text-primary text-lg font-bold">Productos</Text>
              <Text className="text-text-secondary text-sm">{filteredProducts.length} items</Text>
            </View>

            {/* PRODUCTS GRID */}
            <ProductsGrid products={filteredProducts} isLoading={isLoading} isError={isError} />
          </View>
        </ScrollView>
        <TouchableOpacity
          onPress={handleWhatsApp}
          activeOpacity={0.8}
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            backgroundColor: "#25D366",
            borderRadius: 999,
            width: 56,
            height: 56,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeScreen>
  )
}

export default ShopScreen