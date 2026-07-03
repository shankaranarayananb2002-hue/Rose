import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username || !email || !password) return;
    setLoading(true);
    try {
      await register(username, email, password);
    } catch (e) {
      Alert.alert("Couldn't create account", e?.response?.data?.error || "Try a different username/email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Your encryption keys are generated on this device and never leave it.</Text>
      <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#8696a0"
        autoCapitalize="none" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8696a0"
        autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#8696a0"
        secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Creating..." : "Create account"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111b21", justifyContent: "center", padding: 24 },
  title: { color: "#e9edef", fontSize: 24, fontWeight: "500", textAlign: "center" },
  subtitle: { color: "#8696a0", textAlign: "center", marginBottom: 28, marginTop: 8, fontSize: 13 },
  input: { backgroundColor: "#202c33", color: "#e9edef", borderRadius: 8, padding: 14, marginBottom: 12 },
  button: { backgroundColor: "#00a884", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "white", fontWeight: "600" },
  link: { color: "#53bdeb", textAlign: "center", marginTop: 20 },
});
