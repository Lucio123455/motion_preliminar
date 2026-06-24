import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/HomeStack";
import { routinesService, Day } from "../services/routines";

type Props = NativeStackScreenProps<HomeStackParamList, "RoutineDays">;

export default function RoutineDaysScreen({ route, navigation }: Props) {
  const { routineId } = route.params;
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    routinesService
      .listDays(routineId)
      .then(setDays)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [routineId]);

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
      data={days}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={days.length === 0 && styles.centered}
      ListEmptyComponent={
        <Text style={styles.empty}>Esta rutina no tiene días cargados.</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("DayExercises", {
            routineId,
            dayId: item.id,
            dayName: item.name,
          })}
        >
          <Text style={styles.order}>Día {item.day_order}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
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
  order: { color: "#3b82f6", fontSize: 13, fontWeight: "700", minWidth: 40 },
  name: { color: "#f8fafc", fontSize: 16, fontWeight: "600", flex: 1 },
  arrow: { color: "#475569", fontSize: 22 },
});
