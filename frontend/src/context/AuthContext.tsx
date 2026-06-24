import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_ID_KEY = "userId";

type AuthContextType = {
  userId: number | null;
  loading: boolean;
  login: (id: number) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_ID_KEY)
      .then((val) => {
        if (val) setUserId(Number(val));
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(id: number) {
    await AsyncStorage.setItem(USER_ID_KEY, String(id));
    setUserId(id);
  }

  async function logout() {
    await AsyncStorage.removeItem(USER_ID_KEY);
    setUserId(null);
  }

  return (
    <AuthContext.Provider value={{ userId, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
