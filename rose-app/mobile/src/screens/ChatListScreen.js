import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, TextInput, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function ChatListScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [contacts, setContacts] = useState([]); // {id, username, publicKey}
  const [showAdd, setShowAdd] = useState(false);
  const [lookupName, setLookupName] = useState("");

  const addContact = async () => {
    try {
      const { data } = await api.get(`/users/lookup/${lookupName.trim()}`);
      if (contacts.find(c => c.id === data.id)) { setShowAdd(false); return; }
      setContacts(prev => [...prev, data]);
      setShowAdd(false);
      setLookupName("");
    } catch (e) {
      Alert.alert("Not found", "No user with that username");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rose</Text>
        <View style={{ flexDirection: "row", gap: 20 }}>
          <TouchableOpacity onPress={() => setShowAdd(true)}><Text style={styles.headerIcon}>＋</Text></TouchableOpacity>
          <TouchableOpacity onPress={logout}><Text style={styles.headerIcon}>⎋</Text></TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={c => c.id}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No chats yet. Tap + and enter a username to start one.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate("Chat", { contact: item })}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text></View>
            <Text style={styles.rowText}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New chat</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter their username"
              placeholderTextColor="#8696a0"
              autoCapitalize="none"
              value={lookupName}
              onChangeText={setLookupName}
            />
            <TouchableOpacity style={styles.button} onPress={addContact}>
              <Text style={styles.buttonText}>Start chat</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Text style={styles.link}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111b21" },
  header: { backgroundColor: "#202c33", padding: 16, paddingTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "#e9edef", fontSize: 20, fontWeight: "600" },
  headerIcon: { color: "#aebac1", fontSize: 20 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyText: { color: "#8696a0", textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: "#222d34" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#00a884", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { color: "white", fontWeight: "600" },
  rowText: { color: "#e9edef", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  modalBox: { backgroundColor: "#202c33", borderRadius: 12, padding: 20 },
  modalTitle: { color: "#e9edef", fontSize: 18, marginBottom: 14 },
  input: { backgroundColor: "#2a3942", color: "#e9edef", borderRadius: 8, padding: 12, marginBottom: 14 },
  button: { backgroundColor: "#00a884", borderRadius: 8, padding: 12, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "600" },
  link: { color: "#53bdeb", textAlign: "center", marginTop: 14 },
});
