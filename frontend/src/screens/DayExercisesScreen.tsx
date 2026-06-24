import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/HomeStack";
import { routinesService, DayExercise } from "../services/routines";

type Props = NativeStackScreenProps<HomeStackParamList, "DayExercises">;

export default function DayExercisesScreen({ route }: Props) {
  const { routineId, dayId } = route.params;
  const [exercises, setExercises] = useState<DayExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    routinesService
      .getDay(routineId, dayId)
      .then((day) => {
        const sorted = [...day.day_exercises].sort((a, b) => a.exercise_order - b.exercise_order);
        setExercises(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [routineId, dayId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={exercises}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={exercises.length === 0 && styles.centered}
      ListEmptyComponent={
        <Text style={styles.empty}>Este día no tiene ejercicios asignados.</Text>
      }
      renderItem={({ item, index }) => (
        <View style={styles.card}>
          <View style={styles.number}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.exercise.name}</Text>
            {item.exercise.muscle_group && (
              <Text style={styles.muscle}>{item.exercise.muscle_group}</Text>
            )}
          </View>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{item.sets}</Text>
              <Text style={styles.metaLabel}>series</Text>
            </View>
            <Text style={styles.metaSep}>×</Text>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{item.reps}</Text>
              <Text style={styles.metaLabel}>reps</Text>
            </View>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { color: "#64748b", fontSize: 16, textAlign: "center" },
  card: {
    backgroundColor: "#1e293b",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  number: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1d4ed8",
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: { color: "#93c5fd", fontWeight: "700", fontSize: 14 },
  info: { flex: 1 },
  name: { color: "#f8fafc", fontSize: 15, fontWeight: "600" },
  muscle: { color: "#64748b", fontSize: 12, marginTop: 2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaItem: { alignItems: "center" },
  metaValue: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
  metaLabel: { color: "#64748b", fontSize: 10, textTransform: "uppercase" },
  metaSep: { color: "#475569", fontSize: 16, fontWeight: "300" },
});
