import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      Alert.alert("Login failed", e?.response?.data?.error || "Check your details and try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rose</Text>
      <Text style={styles.subtitle}>End-to-end encrypted messaging</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8696a0"
        autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#8696a0"
        secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Logging in..." : "Log in"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>New here? Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111b21", justifyContent: "center", padding: 24 },
  title: { color: "#e9edef", fontSize: 32, fontWeight: "300", textAlign: "center" },
  subtitle: { color: "#8696a0", textAlign: "center", marginBottom: 32, marginTop: 4 },
  input: { backgroundColor: "#202c33", color: "#e9edef", borderRadius: 8, padding: 14, marginBottom: 12 },
  button: { backgroundColor: "#00a884", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "white", fontWeight: "600" },
  link: { color: "#53bdeb", textAlign: "center", marginTop: 20 },
});
