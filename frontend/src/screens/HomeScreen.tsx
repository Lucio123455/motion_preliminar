import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { usersService, User } from "../services/users";

const HARDCODED_USER_ID = 1;

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hola, {user?.name} 👋</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  error: {
    fontSize: 16,
    color: "#ef4444",
  },
});
