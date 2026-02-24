import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL ?? "andreaac777@gmail.com";

export default function AccountInactiveScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleClose = async () => {
    await signOut();
    router.replace("/(auth)");
  };

  const handleContactAdmin = () => {
    const subject = encodeURIComponent("Solicitud de reactivación de cuenta");
    const body = encodeURIComponent(
      "Hola, me gustaría solicitar la reactivación de mi cuenta. Por favor contáctenme para continuar el proceso."
    );
    Linking.openURL(`mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-ui-background">
      <View className="flex-row justify-end px-4 pt-6">
        <TouchableOpacity
          onPress={handleClose}
          className="items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#5B3A29" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <View className="bg-red-500/10 rounded-full w-24 h-24 items-center justify-center mb-8">
          <Ionicons name="lock-closed-outline" size={48} color="#EF4444" />
        </View>

        <Text className="text-text-primary text-2xl font-bold text-center mb-3">
          Cuenta Desactivada
        </Text>

        <Text className="text-text-secondary text-base text-center leading-6 mb-2">
          Tu cuenta ha sido desactivada y no puedes acceder en este momento.
        </Text>
        <Text className="text-text-secondary text-base text-center leading-6 mb-10">
          Si deseas recuperarla, escríbenos a{" "}
          <Text className="text-brand-primary font-semibold">{ADMIN_EMAIL}</Text>{" "}
          y con gusto te ayudaremos.
        </Text>

        <TouchableOpacity
          onPress={handleContactAdmin}
          className="bg-brand-primary w-full py-4 rounded-2xl items-center mb-4"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text className="text-white font-bold text-base">Contactar a Soporte</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

