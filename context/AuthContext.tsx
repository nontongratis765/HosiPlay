import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  banner: string | null;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<UserProfile, "username" | "avatar" | "banner">>) => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const TOKEN_KEY = "@hoshiplay_token";
const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadToken(); }, []);

  async function loadToken() {
    try {
      const saved = await AsyncStorage.getItem(TOKEN_KEY);
      if (saved) {
        const profile = await fetchMe(saved);
        if (profile) { setToken(saved); setUser(profile); }
        else await AsyncStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
    setIsLoading(false);
  }

  async function fetchMe(authToken: string): Promise<UserProfile | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }

  async function refreshMe() {
    if (!token) return;
    const profile = await fetchMe(token);
    if (profile) setUser(profile);
  }

  async function register(username: string, email: string, password: string) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Registrasi gagal");
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function loginUser(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Login gagal");
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function updateProfile(data: Partial<Pick<UserProfile, "username" | "avatar" | "banner">>) {
    if (!token) throw new Error("Belum login");
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error ?? "Gagal update profil");
    setUser(result.user);
  }

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, register, loginUser, logout, updateProfile, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
