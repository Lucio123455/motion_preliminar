import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { usersService, User } from "../services/users";

const HARDCODED_USER_ID = 1;

const MENU_ITEMS = [
  { label: "Mis Rutinas", icon: "📋" },
  { label: "Mis Ejercicios", icon: "🏋️" },
  { label: "Mi Progreso", icon: "📈" },
  { label: "Historial", icon: "📅" },
];

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersService
      .getById(HARDCODED_USER_ID)
      .then(setUser)
      .catch(() => setError("No se pudo conectar con el servidor"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hola, {user?.name} 👋</Text>
      <Text style={styles.subtitle}>¿Qué entrenamos hoy?</Text>

      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.label} style={styles.card} activeOpacity={0.7}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <Text style={styles.cardLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    marginBottom: 32,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  card: {
    width: "46%",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
    textAlign: "center",
  },
  error: {
    fontSize: 16,
    color: "#ef4444",
  },
});
