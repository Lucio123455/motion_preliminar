import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { usersService } from "../services/users";
import { useAuth } from "../context/AuthContext";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SettingRow({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? "›"}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { userId, logout } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (!userId) return;
    usersService.getById(userId).then((u) => setName(u.name));
  }, [userId]);

  async function handleSaveName() {
    if (!name.trim() || !userId) return;
    setSaving(true);
    setStatus("idle");
    try {
      await usersService.update(userId, name.trim());
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Configuración</Text>

      <Section title="Perfil">
        <Text style={styles.label}>Cambiar nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor="#475569"
          value={name}
          onChangeText={(v) => { setName(v); setStatus("idle"); }}
        />
        <TouchableOpacity
          style={[styles.button, status === "success" && styles.buttonSuccess, status === "error" && styles.buttonError]}
          onPress={handleSaveName}
          activeOpacity={0.8}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>
                {status === "success" ? "✓ Guardado" : status === "error" ? "Error al guardar" : "Guardar"}
              </Text>
          }
        </TouchableOpacity>
      </Section>

      <Section title="Cuenta">
        <SettingRow label="Notificaciones" value="Activadas" />
        <SettingRow label="Idioma" value="Español" />
        <SettingRow label="Unidad de peso" value="kg" />
        <SettingRow label="Cerrar sesión" onPress={logout} />
      </Section>

      <Section title="App">
        <SettingRow label="Versión" value="0.1.0" />
        <SettingRow label="Términos y condiciones" />
        <SettingRow label="Política de privacidad" />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 24,
    paddingTop: 64,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 8,
  },
  section: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: "#94a3b8",
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
  },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
  },
  buttonSuccess: {
    backgroundColor: "#22c55e",
  },
  buttonError: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#0f172a",
  },
  rowLabel: {
    fontSize: 15,
    color: "#e2e8f0",
  },
  rowValue: {
    fontSize: 15,
    color: "#64748b",
  },
});
