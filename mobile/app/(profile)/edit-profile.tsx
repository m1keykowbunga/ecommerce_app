import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SafeScreen from "@/components/SafeScreen";
import { userApi } from "@/lib/api";
import EditProfileModal, { isoToDisplay } from "@/components/EditProfileModal";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";

const DOCUMENT_LABELS: Record<string, string> = {
  cedula_ciudadania: "Cédula de Ciudadanía",
  cedula_extranjeria: "Cédula de Extranjería",
  pasaporte: "Pasaporte",
};

const GENDER_LABELS: Record<string, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  otro: "Otro",
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <View className="flex-row items-center py-4 border-b border-ui-surface/60 last:border-b-0">
      <View className="bg-brand-primary/10 rounded-full w-9 h-9 items-center justify-center mr-4">
        <Ionicons name={icon as any} size={18} color="#5B3A29" />
      </View>
      <View className="flex-1">
        <Text className="text-text-secondary text-xs mb-0.5">{label}</Text>
        <Text className="text-text-primary font-semibold text-sm">
          {value || "No especificado"}
        </Text>
      </View>
    </View>
  );
}

const EditProfileScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: userApi.getProfile,
  });

  if (isLoading) {
    return (
      <SafeScreen>
        <Header header="Mi Perfil" />
        <LoadingState message="Cargando perfil..." />
      </SafeScreen>
    );
  }

  if (isError) {
    return (
      <SafeScreen>
        <Header header="Mi Perfil" />
        <ErrorState
          title="No se pudo cargar el perfil"
          description="Por favor, revisa tu conexión e intenta nuevamente"
          onRetry={refetch}
        />
      </SafeScreen>
    );
  }

  const displayDate = profile?.dateOfBirth ? isoToDisplay(profile.dateOfBirth) : null;
  const hasData = profile?.documentType || profile?.gender || profile?.dateOfBirth;

  if (!hasData) {
    return (
      <SafeScreen>
        <Header header="Mi Perfil" />
        <EmptyState
          icon="person-outline"
          title="Perfil sin completar"
          description="Agrega tu documento de identidad, género y fecha de nacimiento"
        >
          <TouchableOpacity
            className="bg-brand-primary rounded-2xl py-4 px-6 items-center"
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-white font-bold text-base">Completar Perfil</Text>
          </TouchableOpacity>
        </EmptyState>

        <EditProfileModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          currentData={{
            documentType: null,
            documentNumber: "",
            gender: null,
            dateOfBirth: null,
          }}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <Header header="Mi Perfil" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── DOCUMENTO DE IDENTIDAD ── */}
        <View className="bg-ui-surface/50 rounded-3xl px-5 pt-2 pb-1 mb-4">
          <View className="pt-4 pb-2">
            <Text className="text-text-primary font-bold text-base">Documento de Identidad</Text>
          </View>
          <InfoRow
            icon="card-outline"
            label="Tipo de documento"
            value={profile?.documentType ? DOCUMENT_LABELS[profile.documentType] : null}
          />
          <InfoRow
            icon="document-text-outline"
            label="Número de documento"
            value={profile?.documentNumber || null}
          />
        </View>

        {/* ── INFORMACIÓN PERSONAL ── */}
        <View className="bg-ui-surface/50 rounded-3xl px-5 pt-2 pb-1 mb-4">
          <View className="pt-4 pb-2">
            <Text className="text-text-primary font-bold text-base">Información Personal</Text>
          </View>
          <InfoRow
            icon="person-outline"
            label="Género"
            value={profile?.gender ? GENDER_LABELS[profile.gender] : null}
          />
          <InfoRow
            icon="calendar-outline"
            label="Fecha de nacimiento"
            value={displayDate}
          />
        </View>

        {/* ── BOTÓN EDITAR ── */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
          className="bg-brand-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 mb-4"
        >
          <Ionicons name="pencil-outline" size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold text-base">Editar Perfil</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL DE EDICIÓN */}
      <EditProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        currentData={{
          documentType: profile?.documentType ?? null,
          documentNumber: profile?.documentNumber ?? "",
          gender: profile?.gender ?? null,
          dateOfBirth: profile?.dateOfBirth ?? null,
        }}
      />
    </SafeScreen>
  );
};

export default EditProfileScreen;
