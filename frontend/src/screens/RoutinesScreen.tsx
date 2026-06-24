import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/HomeStack";
import { routinesService, Routine } from "../services/routines";
import CreateRoutineModal from "../components/CreateRoutineModal";

type NavProp = NativeStackNavigationProp<HomeStackParamList, "Routines">;

const HARDCODED_USER_ID = 1;

export default function RoutinesScreen() {
  const navigation = useNavigation<NavProp>();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchRoutines = useCallback(() => {
    setLoading(true);
    routinesService
      .list(HARDCODED_USER_ID)
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
        userId={HARDCODED_USER_ID}
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
