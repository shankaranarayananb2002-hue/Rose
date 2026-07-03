import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import api from "../api";
import { loadOrCreateKeypair } from "../crypto";
import { connectSocket } from "../socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [secretKeyRaw, setSecretKeyRaw] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("rose_jwt");
      const savedUser = await SecureStore.getItemAsync("rose_user");
      if (token && savedUser) {
        const { secretKeyRaw } = await loadOrCreateKeypair();
        setSecretKeyRaw(secretKeyRaw);
        setUser(JSON.parse(savedUser));
        connectSocket(token);
      }
      setReady(true);
    })();
  }, []);

  const register = async (username, email, password) => {
    const { publicKey, secretKeyRaw } = await loadOrCreateKeypair();
    const { data } = await api.post("/auth/register", { username, email, password, publicKey });
    await SecureStore.setItemAsync("rose_jwt", data.token);
    await SecureStore.setItemAsync("rose_user", JSON.stringify(data.user));
    setSecretKeyRaw(secretKeyRaw);
    setUser(data.user);
    connectSocket(data.token);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const { secretKeyRaw } = await loadOrCreateKeypair();
    await SecureStore.setItemAsync("rose_jwt", data.token);
    await SecureStore.setItemAsync("rose_user", JSON.stringify(data.user));
    setSecretKeyRaw(secretKeyRaw);
    setUser(data.user);
    connectSocket(data.token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("rose_jwt");
    await SecureStore.deleteItemAsync("rose_user");
    setUser(null);
    setSecretKeyRaw(null);
  };

  return (
    <AuthContext.Provider value={{ user, secretKeyRaw, ready, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
