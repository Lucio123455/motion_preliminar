import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/HomeStack";
import { routinesService, DayExercise } from "../services/routines";
import { progressService, todayString } from "../services/progress";

type Props = NativeStackScreenProps<HomeStackParamList, "DayExercises">;

const HARDCODED_USER_ID = 1;

type SetRow = {
  weight: string;
  reps: string;
  saved: boolean;
  saving: boolean;
  editing: boolean;
  progressId?: number;
  originalWeight?: string;
  originalReps?: string;
};

export default function DayExercisesScreen({ route }: Props) {
  const { routineId, dayId } = route.params;
  const [exercises, setExercises] = useState<DayExercise[]>([]);
  const [lastWeights, setLastWeights] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DayExercise | null>(null);
  const [setRows, setSetRows] = useState<SetRow[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    routinesService
      .getDay(routineId, dayId)
      .then(async (day) => {
        const sorted = [...day.day_exercises].sort((a, b) => a.exercise_order - b.exercise_order);
        setExercises(sorted);

        const results = await Promise.all(
          sorted.map((ex) =>
            progressService
              .getLastWeight(HARDCODED_USER_ID, ex.exercise_id)
              .then((entry) => ({ exerciseId: ex.exercise_id, weight: entry.weight_kg }))
              .catch(() => null)
          )
        );
        const map: Record<number, number> = {};
        results.forEach((r) => { if (r) map[r.exerciseId] = r.weight; });
        setLastWeights(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [routineId, dayId]);

  async function openModal(exercise: DayExercise) {
    setSelected(exercise);
    const rows: SetRow[] = Array.from({ length: exercise.sets }, () => ({
      weight: "",
      reps: String(exercise.reps),
      saved: false,
      saving: false,
      editing: false,
    }));
    setSetRows(rows);
    setLoadingModal(true);

    try {
      const existing = await progressService.listByExerciseToday(
        HARDCODED_USER_ID,
        exercise.exercise_id
      );
      setSetRows((prev) =>
        prev.map((row, index) => {
          const match = existing.find((e) => e.set_number === index + 1);
          if (match) {
            return {
              weight: String(match.weight_kg),
              reps: String(match.reps),
              saved: true,
              saving: false,
              editing: false,
              progressId: match.id,
            };
          }
          return row;
        })
      );
    } catch {
      // si falla el fetch mostramos las filas vacías igual
    } finally {
      setLoadingModal(false);
    }
  }

  function updateRow(index: number, field: "weight" | "reps", value: string) {
    setSetRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function saveSet(index: number) {
    if (!selected) return;
    const row = setRows[index];
    const weightNum = parseFloat(row.weight);
    const repsNum = parseInt(row.reps);
    if (!row.weight || isNaN(weightNum) || isNaN(repsNum)) return;

    setSetRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, saving: true } : r))
    );

    try {
      await progressService.create({
        user_id: HARDCODED_USER_ID,
        exercise_id: selected.exercise_id,
        weight_kg: weightNum,
        reps: repsNum,
        set_number: index + 1,
        date: todayString(),
      });
      setSetRows((prev) =>
        prev.map((r, i) => (i === index ? { ...r, saved: true, saving: false } : r))
      );
    } catch {
      setSetRows((prev) =>
        prev.map((r, i) => (i === index ? { ...r, saving: false } : r))
      );
    }
  }

  function startEdit(index: number) {
    setSetRows((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, editing: true, originalWeight: r.weight, originalReps: r.reps }
          : r
      )
    );
  }

  function cancelEdit(index: number) {
    setSetRows((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, editing: false, weight: r.originalWeight ?? r.weight, reps: r.originalReps ?? r.reps }
          : r
      )
    );
  }

  async function saveEdited(index: number) {
    if (!selected) return;
    const row = setRows[index];
    if (!row.progressId) return;
    const weightNum = parseFloat(row.weight);
    const repsNum = parseInt(row.reps);
    if (isNaN(weightNum) || isNaN(repsNum)) return;

    setSetRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, saving: true } : r))
    );
    try {
      await progressService.update(row.progressId, { weight_kg: weightNum, reps: repsNum });
      setSetRows((prev) =>
        prev.map((r, i) =>
          i === index ? { ...r, saved: true, saving: false, editing: false } : r
        )
      );
    } catch {
      setSetRows((prev) =>
        prev.map((r, i) => (i === index ? { ...r, saving: false } : r))
      );
    }
  }

  const savedCount = setRows.filter((r) => r.saved).length;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={styles.container}
        data={exercises}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={exercises.length === 0 && styles.centered}
        ListEmptyComponent={
          <Text style={styles.empty}>Este día no tiene ejercicios asignados.</Text>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => openModal(item)}
          >
            <View style={styles.number}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.exercise.name}</Text>
              {item.exercise.muscle_group && (
                <Text style={styles.muscle}>{item.exercise.muscle_group}</Text>
              )}
              {lastWeights[item.exercise_id] !== undefined && (
                <Text style={styles.lastWeight}>
                  Último: {lastWeights[item.exercise_id]} kg
                </Text>
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
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selected} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.overlay}>
            <View style={styles.sheet}>

              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{selected?.exercise.name}</Text>
                  {selected?.exercise.muscle_group && (
                    <Text style={styles.modalMuscle}>{selected.exercise.muscle_group}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Progreso del día */}
              <Text style={styles.dateLabel}>
                Hoy — {savedCount}/{setRows.length} series guardadas
              </Text>

              {loadingModal ? (
                <ActivityIndicator color="#3b82f6" style={{ marginVertical: 24 }} />
              ) : (
                <>
                  <View style={styles.rowHeader}>
                    <Text style={[styles.colLabel, styles.colSerie]}>#</Text>
                    <Text style={[styles.colLabel, styles.colInput]}>Peso (kg)</Text>
                    <Text style={[styles.colLabel, styles.colInput]}>Reps</Text>
                    <View style={styles.colAction} />
                  </View>

                  <ScrollView style={styles.rowsScroll} keyboardShouldPersistTaps="handled">
                    {setRows.map((row, index) => (
                      <View
                        key={index}
                        style={[styles.setRow, row.saved && styles.setRowSaved]}
                      >
                        <Text style={[styles.setNumber, styles.colSerie]}>
                          {index + 1}
                        </Text>

                        <TextInput
                          style={[styles.input, styles.colInput, row.saved && !row.editing && styles.inputSaved]}
                          keyboardType="decimal-pad"
                          placeholder="0"
                          placeholderTextColor="#475569"
                          value={row.weight}
                          onChangeText={(v) => updateRow(index, "weight", v)}
                          editable={!row.saved || row.editing}
                        />

                        <TextInput
                          style={[styles.input, styles.colInput, row.saved && !row.editing && styles.inputSaved]}
                          keyboardType="number-pad"
                          placeholder={String(selected?.reps ?? 0)}
                          placeholderTextColor="#475569"
                          value={row.reps}
                          onChangeText={(v) => updateRow(index, "reps", v)}
                          editable={!row.saved || row.editing}
                        />

                        <View style={styles.colAction}>
                          {row.editing ? (
                            row.saving ? (
                              <ActivityIndicator size="small" color="#3b82f6" />
                            ) : (
                              <View style={{ alignItems: "center", gap: 6 }}>
                                <TouchableOpacity style={styles.saveRowBtn} onPress={() => saveEdited(index)} activeOpacity={0.7}>
                                  <Text style={styles.saveRowBtnText}>OK</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => cancelEdit(index)}>
                                  <Text style={styles.cancelEditText}>✕</Text>
                                </TouchableOpacity>
                              </View>
                            )
                          ) : row.saved ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                              <Text style={styles.savedCheck}>✓</Text>
                              <TouchableOpacity onPress={() => startEdit(index)}>
                                <Text style={styles.editBtn}>✎</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.saveRowBtn}
                              onPress={() => saveSet(index)}
                              disabled={row.saving}
                              activeOpacity={0.7}
                            >
                              {row.saving
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Text style={styles.saveRowBtnText}>OK</Text>
                              }
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </>
              )}

            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
  lastWeight: { color: "#3b82f6", fontSize: 12, marginTop: 3, fontWeight: "600" },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaItem: { alignItems: "center" },
  metaValue: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
  metaLabel: { color: "#64748b", fontSize: 10, textTransform: "uppercase" },
  metaSep: { color: "#475569", fontSize: 16 },

  // Modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  modalTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
  modalMuscle: { color: "#64748b", fontSize: 13, marginTop: 2 },
  closeBtn: { color: "#64748b", fontSize: 20, paddingLeft: 12 },
  dateLabel: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 16,
    fontWeight: "600",
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  colLabel: { color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  colSerie: { width: 32, textAlign: "center" },
  colInput: { flex: 1, textAlign: "center" },
  colAction: { width: 48, alignItems: "center" },
  rowsScroll: { maxHeight: 320 },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    borderRadius: 10,
    padding: 4,
  },
  setRowSaved: { backgroundColor: "rgba(34,197,94,0.08)" },
  setNumber: { color: "#3b82f6", fontWeight: "700", fontSize: 16, textAlign: "center" },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
    textAlign: "center",
  },
  inputSaved: {
    borderColor: "transparent",
    color: "#94a3b8",
    backgroundColor: "transparent",
  },
  saveRowBtn: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 40,
    alignItems: "center",
  },
  saveRowBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  savedCheck: { color: "#22c55e", fontSize: 20, fontWeight: "700" },
  editBtn: { color: "#64748b", fontSize: 18 },
  cancelEditText: { color: "#ef4444", fontSize: 14, fontWeight: "700" },
});
