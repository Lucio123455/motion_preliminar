import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import RoutinesScreen from "../screens/RoutinesScreen";
import RoutineDaysScreen from "../screens/RoutineDaysScreen";
import DayExercisesScreen from "../screens/DayExercisesScreen";

export type HomeStackParamList = {
  HomeScreen: undefined;
  Routines: undefined;
  RoutineDays: { routineId: number; routineName: string };
  DayExercises: { routineId: number; dayId: number; dayName: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#f8fafc",
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Routines" component={RoutinesScreen} options={{ title: "Mis Rutinas" }} />
      <Stack.Screen name="RoutineDays" component={RoutineDaysScreen} options={({ route }) => ({ title: route.params.routineName })} />
      <Stack.Screen name="DayExercises" component={DayExercisesScreen} options={({ route }) => ({ title: route.params.dayName })} />
    </Stack.Navigator>
  );
}
