import { Redirect, Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";


const TabsLayout = () => {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const api = useApi();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;

    api.get("/users/profile")
      .then(() => setIsVerified(true))
      .catch(async (error) => {
        if (error?.response?.data?.code === "ACCOUNT_INACTIVE") {
          await signOut();
          router.replace("/account-inactive");
        } else {
          setIsVerified(true);
        }
      });
  }, [isSignedIn]);

  if (!isLoaded) return null;
  if (isSignedIn && !isVerified) return null;
  if (!isSignedIn) return <Redirect href={"/(auth)"} />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#5B3A29",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarStyle: {
          backgroundColor: "#9A8A80",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 6,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 600,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Carrito",
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;