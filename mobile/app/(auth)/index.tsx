import useSocialAuth from "@/hooks/useSocialAuth";
import { View, Text, Image, ImageBackground, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const AuthScreen = () => {
  const { loadingStrategy, handleSocialAuth } = useSocialAuth();

  return (
    <ImageBackground
      source={require("../../assets/images/palitos.png")}
      resizeMode="cover"
      className="flex-1"
    >
      {/* GRADIENT OVERLAY */}
      <LinearGradient
        colors={[
          "transparent",
          "rgba(255,255,255,0.8)",
          "rgba(255,255,255,0.95)",
        ]}
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <View className="px-8 flex-1 justify-center items-center">
          {/* LOGO */}
          <Image
            source={require("../../assets/images/donpalito.png")}
            className="w-36 h-36 mb-4"
            resizeMode="contain"
          />
          {/* SOCIAL AUTH */}
          <View className="gap-2 mt-3 w-full">
            {/* GOOGLE */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white border border-gray-300 rounded-full px-6 py-3"
              onPress={() => handleSocialAuth("oauth_google")}
              disabled={loadingStrategy !== null}
              accessibilityLabel="Continuar con Google"
              accessibilityRole="button"
              style={{
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                elevation: 2,
              }}
            >
              {loadingStrategy === "oauth_google" ? (
                <ActivityIndicator size="small" color="#5B3A29" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Image
                    source={require("../../assets/images/google.png")}
                    className="w-10 h-10 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="text-text-primary font-medium text-base">
                    Continuar con Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>

          </View>

          <Text className="text-center text-text-muted text-xs leading-4 mt-6 px-2">
            Al iniciar sesión aceptas nuestros{" "}
            <Text className="text-brand-primary font-medium">
              Términos y Condiciones
            </Text>
            {", "}
            <Text className="text-brand-primary font-medium">
              Política de Privacidad
            </Text>
            {" y "}
            <Text className="text-brand-primary font-medium">
              Uso de Cookies
            </Text>
          </Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export default AuthScreen;