import { Stack } from "expo-router";
import "../global.css";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import * as Sentry from "@sentry/react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";


Sentry.init({
  dsn: 'https://b37e0e13c1373f59805ce91487069e00@o4510774265905152.ingest.us.sentry.io/4510787013771264',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => Sentry.captureException(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => Sentry.captureException(error),
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 5 * 60,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
    },
  },
});

export default Sentry.wrap(function RootLayout() {
  return (
    <SafeAreaProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
            <Stack screenOptions={{ headerShown: false }} />
          </StripeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  )
});