import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { encryptMessage, decryptMessage } from "../crypto";
import { getSocket } from "../socket";
import api from "../api";

export default function ChatScreen({ route, navigation }) {
  const { contact } = route.params; // {id, username, publicKey}
  const { user, secretKeyRaw } = useAuth();
  const [messages, setMessages] = useState([]); // {id, mine, text, ts}
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  const decryptIncoming = useCallback((m) => {
    const text = decryptMessage(m.ciphertext, m.nonce, contact.publicKey, secretKeyRaw);
    return { id: m.id, mine: m.senderId === user.id, text, ts: m.createdAt || Date.now() };
  }, [contact.publicKey, secretKeyRaw, user.id]);

  // Load history with this contact
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/messages/with/${contact.id}`);
        setMessages(data.map(decryptIncoming));
      } catch {}
    })();
  }, [contact.id, decryptIncoming]);

  // Listen for live incoming messages from this contact
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (m) => {
      if (m.senderId !== contact.id) return; // only show messages relevant to this open chat
      setMessages(prev => [...prev, decryptIncoming(m)]);
    };
    socket.on("message:new", handler);
    return () => socket.off("message:new", handler);
  }, [contact.id, decryptIncoming]);

  const send = () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    const { ciphertext, nonce } = encryptMessage(text, contact.publicKey, secretKeyRaw);
    const tempId = "local-" + Date.now();
    setMessages(prev => [...prev, { id: tempId, mine: true, text, ts: Date.now() }]);

    const socket = getSocket();
    socket.emit("message:send", { recipientId: contact.id, ciphertext, nonce }, (ack) => {
      if (!ack?.ok) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, failed: true } : m));
      }
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{contact.username}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, { justifyContent: item.mine ? "flex-end" : "flex-start" }]}>
            <View style={[styles.bubble, item.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
              {item.failed && <Text style={styles.failedText}>Not delivered — will retry</Text>}
            </View>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message"
          placeholderTextColor="#8696a0"
          onSubmitEditing={send}
        />
        <TouchableOpacity onPress={send} style={styles.sendButton}>
          <Text style={{ color: "white", fontWeight: "600" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b141a" },
  header: { backgroundColor: "#202c33", padding: 16, paddingTop: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { color: "#aebac1", fontSize: 28 },
  headerTitle: { color: "#e9edef", fontSize: 17, fontWeight: "600" },
  bubbleRow: { flexDirection: "row", marginBottom: 8 },
  bubble: { maxWidth: "78%", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  bubbleMine: { backgroundColor: "#005c4b" },
  bubbleTheirs: { backgroundColor: "#202c33" },
  bubbleText: { color: "#e9edef", fontSize: 15 },
  failedText: { color: "#ff8a80", fontSize: 11, marginTop: 4 },
  inputRow: { flexDirection: "row", padding: 10, backgroundColor: "#202c33", alignItems: "center" },
  input: { flex: 1, backgroundColor: "#2a3942", color: "#e9edef", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10 },
  sendButton: { backgroundColor: "#00a884", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
});
