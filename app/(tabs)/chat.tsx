import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface ChatMsg {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string | null;
  userRole: string;
  content: string;
  createdAt: string;
}

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

function timeStr(d: string) {
  const date = new Date(d);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function fetchMessages() {
    try {
      const res = await fetch(`${BASE_URL}/api/chat?limit=80`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {}
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    if (!user || !token) {
      router.push("/login");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);
    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: input.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setInput("");
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch {}
    setSending(false);
  }

  if (!user) {
    return (
      <View style={[styles.guestContainer, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
        <Ionicons name="chatbubbles-outline" size={60} color={colors.border} />
        <Text style={[styles.guestTitle, { color: colors.foreground }]}>Global Chat</Text>
        <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>Masuk untuk bergabung di chat</Text>
        <Pressable
          onPress={() => router.push("/login")}
          style={[styles.loginBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.loginBtnText, { color: colors.background }]}>Masuk</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0), borderBottomColor: colors.border }]}>
        <Ionicons name="chatbubbles" size={20} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Global Chat</Text>
        <View style={[styles.onlineDot, { backgroundColor: "#4caf50" }]} />
        <Text style={[styles.onlineText, { color: colors.mutedForeground }]}>Live</Text>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={[styles.emptyChatText, { color: colors.mutedForeground }]}>
                Belum ada pesan. Jadilah yang pertama!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.userId === user.id;
            const isOwner = item.userRole === "owner";
            return (
              <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
                {!isMe && (
                  <View style={[styles.avatarContainer, { backgroundColor: colors.muted }]}>
                    {item.userAvatar ? (
                      <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
                    ) : (
                      <Text style={[styles.avatarInitial, { color: colors.mutedForeground }]}>
                        {item.userName[0]?.toUpperCase()}
                      </Text>
                    )}
                  </View>
                )}
                <View style={styles.messageBubbleWrapper}>
                  {!isMe && (
                    <View style={styles.senderRow}>
                      <Text style={[styles.senderName, { color: isOwner ? colors.primary : colors.mutedForeground }]}>
                        {item.userName}
                      </Text>
                      {isOwner && (
                        <View style={[styles.ownerBadge, { backgroundColor: colors.primary + "22" }]}>
                          <Text style={[styles.ownerBadgeText, { color: colors.primary }]}>Owner</Text>
                        </View>
                      )}
                      <Text style={[styles.idText, { color: colors.border }]}>#{item.userId}</Text>
                    </View>
                  )}
                  <View style={[
                    styles.bubble,
                    isMe
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                  ]}>
                    <Text style={[styles.bubbleText, { color: isMe ? colors.background : colors.foreground }]}>
                      {item.content}
                    </Text>
                  </View>
                  <Text style={[styles.timeText, { color: colors.mutedForeground, alignSelf: isMe ? "flex-end" : "flex-start" }]}>
                    {timeStr(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Input bar */}
      <View style={[
        styles.inputBar,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
        }
      ]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Tulis pesan..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <Pressable
          onPress={sendMessage}
          disabled={!input.trim() || sending}
          style={({ pressed }) => [
            styles.sendBtn,
            { backgroundColor: input.trim() ? colors.primary : colors.muted, opacity: pressed ? 0.8 : 1 }
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color={input.trim() ? colors.background : colors.mutedForeground} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  guestContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  guestTitle: { fontSize: 24, fontWeight: "700" as const },
  guestSub: { fontSize: 15, textAlign: "center" },
  loginBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  loginBtnText: { fontWeight: "700" as const, fontSize: 15 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" as const, flex: 1 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { fontSize: 12 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  messageList: { padding: 12, gap: 12 },
  emptyChat: { alignItems: "center", marginTop: 60 },
  emptyChatText: { fontSize: 14 },
  messageRow: { flexDirection: "row", gap: 8, maxWidth: "85%" },
  messageRowMe: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  messageRowOther: { alignSelf: "flex-start" },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 18,
  },
  avatar: { width: 34, height: 34 },
  avatarInitial: { fontSize: 14, fontWeight: "700" as const },
  messageBubbleWrapper: { gap: 3, flex: 1 },
  senderRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  senderName: { fontSize: 12, fontWeight: "600" as const },
  ownerBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ownerBadgeText: { fontSize: 9, fontWeight: "700" as const },
  idText: { fontSize: 10 },
  bubble: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  timeText: { fontSize: 10 },
  inputBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
