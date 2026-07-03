import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Point this at your deployed backend, e.g. "https://rose-backend.onrender.com"
export const API_URL = "https://YOUR-BACKEND-URL.example.com";

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("rose_jwt");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
