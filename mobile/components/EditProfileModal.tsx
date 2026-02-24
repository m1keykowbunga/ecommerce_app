import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeScreen from "@/components/SafeScreen";
import { userApi } from "@/lib/api";


export type DocumentType = "cedula_ciudadania" | "cedula_extranjeria" | null;
export type Gender = "masculino" | "femenino" | "otro" | null;

export interface ProfileData {
  documentType: DocumentType;
  documentNumber: string;
  gender: Gender;
  dateOfBirth: string | null;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentData: ProfileData;
}

const FOOTER_HEIGHT = 96;

const DOCUMENT_TYPES: { value: NonNullable<DocumentType>; label: string }[] = [
  { value: "cedula_ciudadania", label: "Cédula de Ciudadanía" },
  { value: "cedula_extranjeria", label: "Cédula de Extranjería" }
];

const GENDERS: { value: NonNullable<Gender>; label: string; icon: string }[] = [
  { value: "masculino", label: "Masculino", icon: "male-outline" },
  { value: "femenino", label: "Femenino", icon: "female-outline" },
  { value: "otro", label: "Otro", icon: "transgender-outline" },
];

export function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const date = iso.split("T")[0];
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
}

function applyDateMask(input: string): string {
  const clean = input.replace(/\D/g, "").slice(0, 8);
  if (clean.length <= 2) return clean;
  if (clean.length <= 4) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  return `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`;
}

function displayToISO(display: string): string {
  const parts = display.split("/");
  if (parts.length !== 3 || parts[2].length !== 4) return "";
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function validateForm(form: { documentType: DocumentType; documentNumber: string; gender: Gender; dateOfBirth: string }): string[] {
  const errors: string[] = [];

  if (form.documentType && !form.documentNumber.trim()) {
    errors.push("Si seleccionas un tipo de documento debes ingresar el número.");
  }
  if (form.documentNumber.trim() && !form.documentType) {
    errors.push("Selecciona el tipo de documento.");
  }
  if (form.documentNumber && !/^[0-9]{6,10}$/.test(form.documentNumber.trim())) {
    errors.push("El número de documento debe tener entre 6 y 10 dígitos.");
  }
  if (form.dateOfBirth) {
    const iso = displayToISO(form.dateOfBirth);
    if (!iso) {
      errors.push("Ingresa la fecha en formato DD/MM/AAAA.");
    } else {
      const parsed = new Date(iso);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120);
      const [y, m, d] = iso.split("-").map(Number);
      if (
        isNaN(parsed.getTime()) ||
        parsed.getUTCFullYear() !== y ||
        parsed.getUTCMonth() + 1 !== m ||
        parsed.getUTCDate() !== d
      ) errors.push("Fecha de nacimiento inválida.");
      else if (parsed > today) errors.push("La fecha de nacimiento no puede ser posterior a la fecha actual.");
      else if (parsed < minDate) errors.push("Fecha de nacimiento incorrecta.");
    }
  }

  return errors;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View className="bg-ui-surface/40 rounded-3xl p-5 mb-4">{children}</View>;
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View className="flex-row items-center mb-4">
      <View className="bg-brand-primary/10 rounded-full w-9 h-9 items-center justify-center mr-3">
        <Ionicons name={icon as any} size={18} color="#5B3A29" />
      </View>
      <Text className="text-text-primary font-bold text-base">{title}</Text>
    </View>
  );
}

const EditProfileModal = ({ visible, onClose, currentData }: EditProfileModalProps) => {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    documentType: currentData.documentType,
    documentNumber: currentData.documentNumber,
    gender: currentData.gender,
    dateOfBirth: currentData.dateOfBirth ? isoToDisplay(currentData.dateOfBirth) : "",
  });

  // Sync form when modal opens with latest data
  const handleOpen = () => {
    setForm({
      documentType: currentData.documentType,
      documentNumber: currentData.documentNumber,
      gender: currentData.gender,
      dateOfBirth: currentData.dateOfBirth ? isoToDisplay(currentData.dateOfBirth) : "",
    });
  };

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      Alert.alert("¡Listo!", "Tu perfil ha sido actualizado correctamente.", [
        { text: "OK", onPress: onClose },
      ]);
    },
    onError: () => {
      Alert.alert("Error", "No se pudo actualizar el perfil. Intenta de nuevo.");
    },
  });

  const handleSave = () => {
    const errors = validateForm(form);
    if (errors.length) {
      Alert.alert("Verifica los datos", errors.join("\n"));
      return;
    }
    saveProfile({
      documentType: form.documentType,
      documentNumber: form.documentNumber.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth ? displayToISO(form.dateOfBirth) : null,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <SafeScreen>
        {/* HEADER */}
        <View className="px-6 pt-5 pb-5 flex-row justify-end">
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={28} color="#5B3A29" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: FOOTER_HEIGHT + insets.bottom + 24, paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <SectionCard>
              <SectionHeader icon="card-outline" title="Documento de Identidad" />

              <Text className="text-text-secondary text-xs mb-3 ml-1">Tipo de documento</Text>
              {DOCUMENT_TYPES.map((doc) => (
                <TouchableOpacity
                  key={doc.value}
                  onPress={() =>
                    setForm((prev) => ({
                      ...prev,
                      documentType: prev.documentType === doc.value ? null : doc.value,
                    }))
                  }
                  activeOpacity={0.7}
                  className={`flex-row items-center px-4 py-3 rounded-2xl mb-2 border ${
                    form.documentType === doc.value
                      ? "bg-brand-primary/10 border-transparent"
                      : "bg-ui-surface/40 border-transparent"
                  }`}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={form.documentType === doc.value ? "#5B3A29" : "#888"}
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    className={`flex-1 text-base font-medium ${
                      form.documentType === doc.value ? "text-brand-secondary" : "text-text-secondary"
                    }`}
                  >
                    {doc.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text className="text-text-secondary text-xs mt-3 mb-2 ml-1">Número de documento</Text>
              <TextInput
                className="bg-ui-surface/50 text-text-primary px-4 py-4 rounded-2xl text-base"
                placeholder="Ej. 1023456789"
                placeholderTextColor="#aaa"
                value={form.documentNumber}
                onChangeText={(t) =>
                  setForm((prev) => ({
                    ...prev,
                    documentNumber: t.replace(/[^0-9]/g, ""),
                  }))
                }
                keyboardType="number-pad"
                maxLength={10}
              />
              <Text className="text-text-secondary text-xs mt-1 ml-1">
                {form.documentNumber.length}/10 dígitos
              </Text>
            </SectionCard>

            {/* ── GÉNERO ── */}
            <SectionCard>
              <SectionHeader icon="person-outline" title="Género" />
              <View className="flex-row gap-2">
                {GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    onPress={() =>
                      setForm((prev) => ({
                        ...prev,
                        gender: prev.gender === g.value ? null : g.value,
                      }))
                    }
                    activeOpacity={0.7}
                    className={`flex-1 items-center py-4 rounded-2xl border ${
                      form.gender === g.value
                        ? "bg-brand-primary/10 border-transparent"
                        : "bg-ui-surface/40 border-transparent"
                    }`}
                  >
                    <Ionicons
                      name={g.icon as any}
                      size={24}
                      color={form.gender === g.value ? "#5B3A29" : "#888"}
                    />
                    <Text
                      className={`text-xs font-semibold mt-2 ${
                        form.gender === g.value ? "text-brand-secondary" : "text-text-secondary"
                      }`}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </SectionCard>

            {/* ── FECHA DE NACIMIENTO ── */}
            <SectionCard>
              <SectionHeader icon="calendar-outline" title="Fecha de Nacimiento" />
              <TextInput
                className="bg-ui-surface/50 text-text-primary px-4 py-4 rounded-2xl text-base"
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#aaa"
                value={form.dateOfBirth}
                onChangeText={(t) =>
                  setForm((prev) => ({ ...prev, dateOfBirth: applyDateMask(t) }))
                }
                keyboardType="number-pad"
                maxLength={10}
              />
              <Text className="text-text-secondary text-xs mt-2 ml-1">
                Ingresa tu fecha de nacimiento en formato día/mes/año
              </Text>
            </SectionCard>

            {/* ── NOTA INFORMATIVA ── */}
            <View className="bg-ui-surface/50 rounded-2xl p-4 flex-row items-start">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#1DB954"
                style={{ marginTop: 1, marginRight: 8 }}
              />
              <Text className="text-text-secondary text-xs flex-1 leading-5">
                Esta información es opcional pero nos ayuda a personalizar tu experiencia de compra.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* SAVE BUTTON */}
        <View
          style={{ height: FOOTER_HEIGHT + insets.bottom, paddingBottom: insets.bottom }}
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-brand-secondary/30 bg-ui-surface/50"
        >
          <TouchableOpacity
            className="bg-brand-primary rounded-2xl py-5"
            activeOpacity={0.9}
            onPress={handleSave}
            disabled={isSaving}
          >
            <View className="flex-row items-center justify-center">
              {isSaving ? (
                <ActivityIndicator size="small" color="#5B3A29" />
              ) : (
                <Text className="text-white font-bold text-lg mr-2">Guardar Cambios</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    </Modal>
  );
};

export default EditProfileModal;
