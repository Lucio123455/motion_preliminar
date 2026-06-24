import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/HomeStack";
import { routinesService, Routine } from "../services/routines";
import CreateRoutineModal from "../components/CreateRoutineModal";
import { useAuth } from "../context/AuthContext";

type NavProp = NativeStackNavigationProp<HomeStackParamList, "Routines">;

export default function RoutinesScreen() {
  const navigation = useNavigation<NavProp>();
  const { userId } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  function deleteRoutine(routine: Routine) {
    Alert.alert(
      "Eliminar rutina",
      `¿Eliminar "${routine.name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () =>
            routinesService
              .remove(routine.id)
              .then(() => setRoutines((prev) => prev.filter((r) => r.id !== routine.id)))
              .catch(() => Alert.alert("Error", "No se pudo eliminar la rutina.")),
        },
      ]
    );
  }

  const fetchRoutines = useCallback(() => {
    setLoading(true);
    routinesService
      .list(userId!)
      .then(setRoutines)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRoutines(); }, [fetchRoutines]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.centered} size="large" color="#3b82f6" />
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={routines.length === 0 && styles.centered}
          ListEmptyComponent={
            <Text style={styles.empty}>No tenés rutinas aún.{"\n"}Tocá + para crear una.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("RoutineDays", { routineId: item.id, routineName: item.name })}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardName}>{item.name}</Text>
                {item.principal && <Text style={styles.badge}>Principal</Text>}
                <TouchableOpacity
                  onPress={() => deleteRoutine(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.deleteBtn}>🗑</Text>
                </TouchableOpacity>
              </View>
              {item.description && (
                <Text style={styles.cardDesc}>{item.description}</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <CreateRoutineModal
        visible={modalVisible}
        userId={userId!}
        onClose={() => setModalVisible(false)}
        onCreated={() => { setModalVisible(false); fetchRoutines(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { color: "#64748b", fontSize: 16, textAlign: "center", lineHeight: 26 },
  card: {
    backgroundColor: "#1e293b",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardName: { color: "#f8fafc", fontSize: 16, fontWeight: "600", flex: 1 },
  badge: {
    backgroundColor: "#1d4ed8",
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  cardDesc: { color: "#94a3b8", fontSize: 14 },
  deleteBtn: { fontSize: 18, paddingLeft: 4 },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    backgroundColor: "#3b82f6",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: { color: "#fff", fontSize: 28, lineHeight: 32 },
});
