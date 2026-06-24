import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { usersService } from "../services/users";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";
type Step = "name" | "pin";

export default function LoginScreen() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pinRef = useRef<TextInput>(null);

  function switchMode(m: Mode) {
    setMode(m);
    setStep("name");
    setName("");
    setPin("");
    setError(null);
  }

  function handleNameNext() {
    if (!name.trim()) return;
    setError(null);
    setStep("pin");
    setTimeout(() => pinRef.current?.focus(), 100);
  }

  async function handlePinSubmit() {
    if (pin.length !== 4) return;
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        const user = await usersService.login(name.trim(), pin);
        await login(user.id);
      } else {
        const user = await usersService.register(name.trim(), pin);
        await login(user.id);
      }
    } catch (e: any) {
      if (mode === "login") {
        setError("Usuario o PIN incorrecto.");
      } else {
        setError("No se pudo crear la cuenta. Intentá de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>💪</Text>
        <Text style={styles.title}>Motion</Text>
        <Text style={styles.subtitle}>Tu gimnasio, tu progreso</Text>

        {/* Selector de modo */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === "login" && styles.toggleBtnActive]}
            onPress={() => switchMode("login")}
          >
            <Text style={[styles.toggleText, mode === "login" && styles.toggleTextActive]}>
              Iniciar sesión
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === "register" && styles.toggleBtnActive]}
            onPress={() => switchMode("register")}
          >
            <Text style={[styles.toggleText, mode === "register" && styles.toggleTextActive]}>
              Crear cuenta
            </Text>
          </TouchableOpacity>
        </View>

        {step === "name" ? (
          <View style={styles.form}>
            <Text style={styles.label}>
              {mode === "login" ? "¿Cuál es tu nombre?" : "¿Cómo te llamás?"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              placeholderTextColor="#475569"
              value={name}
              onChangeText={(v) => { setName(v); setError(null); }}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={handleNameNext}
            />
            <TouchableOpacity
              style={[styles.btn, !name.trim() && styles.btnDisabled]}
              onPress={handleNameNext}
              disabled={!name.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Continuar →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>
              {mode === "login" ? `Bienvenido, ${name} 👋` : `Hola, ${name} 👋`}
            </Text>
            <Text style={styles.sublabel}>
              {mode === "login" ? "Ingresá tu PIN" : "Elegí un PIN de 4 dígitos"}
            </Text>
            <TextInput
              ref={pinRef}
              style={[styles.input, styles.pinInput]}
              placeholder="• • • •"
              placeholderTextColor="#475569"
              value={pin}
              onChangeText={(v) => {
                const digits = v.replace(/\D/g, "").slice(0, 4);
                setPin(digits);
                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handlePinSubmit}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity
              style={[styles.btn, (pin.length !== 4 || loading) && styles.btnDisabled]}
              onPress={handlePinSubmit}
              disabled={pin.length !== 4 || loading}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>
                    {mode === "login" ? "Entrar" : "Crear cuenta"}
                  </Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setStep("name"); setPin(""); setError(null); }}>
              <Text style={styles.back}>← Cambiar nombre</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 24,
  },
  logo: { fontSize: 64 },
  title: { fontSize: 36, fontWeight: "800", color: "#f8fafc", letterSpacing: -1, marginTop: -12 },
  subtitle: { fontSize: 15, color: "#64748b", marginTop: -16 },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 4,
    width: "100%",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: "#3b82f6" },
  toggleText: { color: "#64748b", fontWeight: "600", fontSize: 14 },
  toggleTextActive: { color: "#fff" },
  form: { width: "100%", gap: 12 },
  label: { fontSize: 20, fontWeight: "700", color: "#f8fafc" },
  sublabel: { fontSize: 14, color: "#64748b" },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
  },
  pinInput: { textAlign: "center", letterSpacing: 8, fontSize: 24 },
  btn: {
    backgroundColor: "#3b82f6",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: "#1e40af", opacity: 0.5 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: "#ef4444", fontSize: 14, textAlign: "center" },
  back: { color: "#64748b", fontSize: 14, textAlign: "center" },
});
