import { useApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

type NotificationPreferences = {
    emailNotifications?: boolean;
    marketingEmails?: boolean;
};

function useNotificationPreferences() {
    const api = useApi();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["notificationPreferences"],
        queryFn: async () => {
            const { data } = await api.get("/users/profile");
            return data;
        },
    });

    const { mutate: updatePreferences, isPending: isSaving } = useMutation({
        mutationFn: async (preferences: NotificationPreferences) => {
            const { data } = await api.put("/users/notification-preferences", preferences);
            return data;
        },
        onMutate: async (newValues) => {
            await queryClient.cancelQueries({ queryKey: ["notificationPreferences"] });
            const previous = queryClient.getQueryData(["notificationPreferences"]);
            queryClient.setQueryData(["notificationPreferences"], (old: any) => ({
                ...old,
                ...newValues,
            }));
            return { previous };
        },
        onError: (_error, _newValues, context) => {
            queryClient.setQueryData(["notificationPreferences"], context?.previous);
            Alert.alert("Error", "No se pudo guardar la preferencia. Intenta de nuevo.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
        },
    });

    return {
        emailNotifications: data?.emailNotifications ?? true,
        marketingEmails: data?.marketingEmails ?? false, // ✅ añadido
        isLoading,
        isSaving,
        updatePreferences,
    };
}

export default useNotificationPreferences;