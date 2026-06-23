import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { routinesService } from "../services/routines";
import { exercisesService, Exercise } from "../services/exercises";

const WEEKDAYS = [
  { label: "Lun", full: "Lunes", order: 1 },
  { label: "Mar", full: "Martes", order: 2 },
  { label: "Mié", full: "Miércoles", order: 3 },
  { label: "Jue", full: "Jueves", order: 4 },
  { label: "Vie", full: "Viernes", order: 5 },
  { label: "Sáb", full: "Sábado", order: 6 },
  { label: "Dom", full: "Domingo", order: 7 },
];

type ExerciseEntry = { id: number; sets: string; reps: string };
type DayExercises = Record<number, ExerciseEntry[]>; // keyed by day order

interface Props {
  visible: boolean;
  userId: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateRoutineModal({ visible, userId, onClose, onCreated }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [dayExercises, setDayExercises] = useState<DayExercises>({});
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (step === 3 && exercises.length === 0) {
      setLoadingExercises(true);
      exercisesService.list()
        .then(setExercises)
        .finally(() => setLoadingExercises(false));
    }
  }, [step]);

  function reset() {
    setStep(1);
    setName("");
    setDescription("");
    setSelectedDays([]);
    setCurrentDayIndex(0);
    setDayExercises({});
    setExercises([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function toggleDay(order: number) {
    setSelectedDays((prev) =>
      prev.includes(order) ? prev.filter((d) => d !== order) : [...prev, order]
    );
  }

  function toggleExercise(dayOrder: number, exercise: Exercise) {
    setDayExercises((prev) => {
      const current = prev[dayOrder] ?? [];
      const exists = current.find((e) => e.id === exercise.id);
      if (exists) {
        return { ...prev, [dayOrder]: current.filter((e) => e.id !== exercise.id) };
      }
      return { ...prev, [dayOrder]: [...current, { id: exercise.id, sets: "3", reps: "10" }] };
    });
  }

  function updateExerciseField(dayOrder: number, exerciseId: number, field: "sets" | "reps", value: string) {
    setDayExercises((prev) => ({
      ...prev,
      [dayOrder]: (prev[dayOrder] ?? []).map((e) =>
        e.id === exerciseId ? { ...e, [field]: value } : e
      ),
    }));
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const routine = await routinesService.create({ user_id: userId, name: name.trim(), description: description.trim() || undefined });
      const sortedDays = [...selectedDays].sort((a, b) => a - b);
      for (const dayOrder of sortedDays) {
        const dayName = WEEKDAYS.find((d) => d.order === dayOrder)!.full;
        const day = await routinesService.createDay(routine.id, { name: dayName, day_order: dayOrder });
        const exs = dayExercises[dayOrder] ?? [];
        for (let i = 0; i < exs.length; i++) {
          await routinesService.addExercise(routine.id, day.id, {
            exercise_id: exs[i].id,
            sets: parseInt(exs[i].sets) || 3,
            reps: parseInt(exs[i].reps) || 10,
            exercise_order: i + 1,
          });
        }
      }
      reset();
      onCreated();
    } catch {
      // silently fail for now
    } finally {
      setSaving(false);
    }
  }

  const sortedSelectedDays = [...selectedDays].sort((a, b) => a - b);
  const currentDayOrder = sortedSelectedDays[currentDayIndex];
  const currentDayExercises = dayExercises[currentDayOrder] ?? [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {step === 1 ? "Nueva rutina" : step === 2 ? "Días de entrenamiento" : `Ejercicios — ${WEEKDAYS.find((d) => d.order === currentDayOrder)?.full}`}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Step indicator */}
            <View style={styles.steps}>
              {[1, 2, 3].map((s) => (
                <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} />
              ))}
            </View>

            <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">

              {/* STEP 1 — Nombre */}
              {step === 1 && (
                <View style={styles.stepContent}>
                  <Text style={styles.label}>Nombre de la rutina *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Push Pull Legs"
                    placeholderTextColor="#475569"
                    value={name}
                    onChangeText={setName}
                    autoFocus
                  />
                  <Text style={styles.label}>Descripción (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    placeholder="Ej: Rutina de fuerza 3 días"
                    placeholderTextColor="#475569"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}

              {/* STEP 2 — Días */}
              {step === 2 && (
                <View style={styles.stepContent}>
                  <Text style={styles.label}>Seleccioná los días</Text>
                  <View style={styles.daysGrid}>
                    {WEEKDAYS.map((day) => {
                      const active = selectedDays.includes(day.order);
                      return (
                        <TouchableOpacity
                          key={day.order}
                          style={[styles.dayBtn, active && styles.dayBtnActive]}
                          onPress={() => toggleDay(day.order)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{day.label}</Text>
                          <Text style={[styles.dayFull, active && styles.dayLabelActive]}>{day.full}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* STEP 3 — Ejercicios por día */}
              {step === 3 && (
                <View style={styles.stepContent}>
                  {/* Day tabs */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabs}>
                    {sortedSelectedDays.map((order, index) => {
                      const day = WEEKDAYS.find((d) => d.order === order)!;
                      const active = index === currentDayIndex;
                      return (
                        <TouchableOpacity
                          key={order}
                          style={[styles.dayTab, active && styles.dayTabActive]}
                          onPress={() => setCurrentDayIndex(index)}
                        >
                          <Text style={[styles.dayTabText, active && styles.dayTabTextActive]}>{day.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {loadingExercises ? (
                    <ActivityIndicator color="#3b82f6" style={{ marginTop: 24 }} />
                  ) : exercises.length === 0 ? (
                    <Text style={styles.empty}>No hay ejercicios cargados en el sistema.</Text>
                  ) : (
                    exercises.map((ex) => {
                      const selected = currentDayExercises.find((e) => e.id === ex.id);
                      return (
                        <View key={ex.id}>
                          <TouchableOpacity
                            style={[styles.exerciseRow, selected && styles.exerciseRowActive]}
                            onPress={() => toggleExercise(currentDayOrder, ex)}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                              {selected && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.exerciseName}>{ex.name}</Text>
                              {ex.muscle_group && (
                                <Text style={styles.muscleGroup}>{ex.muscle_group}</Text>
                              )}
                            </View>
                          </TouchableOpacity>

                          {selected && (
                            <View style={styles.setsRepsRow}>
                              <View style={styles.setsRepsField}>
                                <Text style={styles.setsRepsLabel}>Series</Text>
                                <TextInput
                                  style={styles.setsRepsInput}
                                  keyboardType="number-pad"
                                  value={selected.sets}
                                  onChangeText={(v) => updateExerciseField(currentDayOrder, ex.id, "sets", v)}
                                />
                              </View>
                              <View style={styles.setsRepsField}>
                                <Text style={styles.setsRepsLabel}>Reps</Text>
                                <TextInput
                                  style={styles.setsRepsInput}
                                  keyboardType="number-pad"
                                  value={selected.reps}
                                  onChangeText={(v) => updateExerciseField(currentDayOrder, ex.id, "reps", v)}
                                />
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              {step > 1 && (
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>
                  <Text style={styles.backBtnText}>← Atrás</Text>
                </TouchableOpacity>
              )}
              {step < 3 ? (
                <TouchableOpacity
                  style={[styles.nextBtn, (step === 1 && !name.trim()) || (step === 2 && selectedDays.length === 0) ? styles.btnDisabled : null]}
                  onPress={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                  disabled={(step === 1 && !name.trim()) || (step === 2 && selectedDays.length === 0)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextBtnText}>Siguiente →</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.nextBtn, saving && styles.btnDisabled]}
                  onPress={handleCreate}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.nextBtnText}>Crear rutina</Text>
                  }
                </TouchableOpacity>
              )}
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 8,
  },
  title: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  closeBtn: {
    color: "#64748b",
    fontSize: 20,
    paddingLeft: 12,
  },
  steps: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  stepDot: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: "#334155",
  },
  stepDotActive: {
    backgroundColor: "#3b82f6",
  },
  body: {
    flexGrow: 0,
  },
  stepContent: {
    padding: 20,
    gap: 12,
  },
  label: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  dayBtn: {
    width: "13%",
    minWidth: 46,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    gap: 2,
  },
  dayBtnActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#3b82f6",
  },
  dayLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
  },
  dayFull: {
    color: "#475569",
    fontSize: 9,
  },
  dayLabelActive: {
    color: "#f8fafc",
  },
  dayTabs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  dayTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#0f172a",
  },
  dayTabActive: {
    backgroundColor: "#3b82f6",
  },
  dayTabText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 13,
  },
  dayTabTextActive: {
    color: "#fff",
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },
  exerciseRowActive: {
    borderBottomColor: "transparent",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#475569",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  checkmark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  exerciseName: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "500",
  },
  muscleGroup: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  setsRepsRow: {
    flexDirection: "row",
    gap: 12,
    paddingLeft: 34,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },
  setsRepsField: {
    gap: 4,
  },
  setsRepsLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  setsRepsInput: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 8,
    width: 64,
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  empty: {
    color: "#64748b",
    fontSize: 15,
    textAlign: "center",
    marginTop: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backBtn: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#0f172a",
  },
  backBtnText: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 15,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
  },
  nextBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  btnDisabled: {
    opacity: 0.4,
  },
});
