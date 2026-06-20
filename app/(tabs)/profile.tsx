import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface NotifItem {
  id: number;
  title: string;
  body: string;
  createdAt: string;
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, token, logout } = useAuth();
  const { watchlist, watchHistory, clearHistory } = useApp();

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [ownerTitle, setOwnerTitle] = useState("");
  const [ownerBody, setOwnerBody] = useState("");
  const [sending, setSending] = useState(false);
  const lastNotifId = useRef<number | null>(null);

  const isOwner = user?.role === "owner" || user?.role === "admin";

  useEffect(() => {
    checkNotifStatus();
  }, []);

  useEffect(() => {
    if (!notifEnabled) return;
    fetchAndNotify();
    const interval = setInterval(fetchAndNotify, 30000);
    return () => clearInterval(interval);
  }, [notifEnabled]);

  async function checkNotifStatus() {
    const { status } = await Notifications.getPermissionsAsync();
    setNotifEnabled(status === "granted");
    if (status === "granted") fetchAndNotify();
  }

  async function toggleNotifications() {
    if (notifEnabled) {
      setNotifEnabled(false);
      Alert.alert("Notifikasi dimatikan", "Kamu bisa mengaktifkannya lagi kapan saja.");
      return;
    }
    setNotifLoading(true);
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      setNotifEnabled(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Notifikasi aktif", "Kamu akan dapat notif saat ada anime baru atau pesan dari Owner.");
      fetchAndNotify();
    } else {
      Alert.alert("Izin ditolak", "Buka Pengaturan HP untuk mengizinkan notifikasi.");
    }
    setNotifLoading(false);
  }

  async function fetchAndNotify() {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications`);
      if (!res.ok) return;
      const data: NotifItem[] = await res.json();
      setNotifs(data.slice(0, 10));
      if (!data.length) return;
      const newest = data[0]!;
      if (lastNotifId.current === null) {
        lastNotifId.current = newest.id;
        return;
      }
      if (newest.id > lastNotifId.current) {
        lastNotifId.current = newest.id;
        await Notifications.scheduleNotificationAsync({
          content: { title: newest.title, body: newest.body, sound: true },
          trigger: null,
        });
      }
    } catch {}
  }

  async function sendOwnerNotif() {
    if (!ownerTitle.trim() || !ownerBody.trim()) { Alert.alert("Isi judul dan pesan"); return; }
    setSending(true);
    try {
      const res = await fetch(`${BASE_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: ownerTitle.trim(), body: ownerBody.trim() }),
      });
      if (!res.ok) throw new Error();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setOwnerTitle(""); setOwnerBody("");
      setShowOwnerPanel(false);
      fetchAndNotify();
      Alert.alert("✅ Notifikasi terkirim");
    } catch { Alert.alert("Gagal mengirim notifikasi"); }
    setSending(false);
  }

  if (!user) {
    return (
      <View style={[styles.guestWrap, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16) }]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="person-outline" size={40} color={colors.mutedForeground} />
        </View>
        <Text style={[styles.guestTitle, { color: colors.foreground }]}>Belum masuk</Text>
        <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>Masuk untuk menyimpan watchlist dan bergabung di chat</Text>
        <Pressable onPress={() => router.push("/login")} style={[styles.loginBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="log-in-outline" size={18} color={colors.background} />
          <Text style={[styles.loginBtnText, { color: colors.background }]}>Masuk / Daftar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100) }}
      >
        {/* Banner */}
        <View style={styles.bannerBox}>
          {user.banner
            ? <Image source={{ uri: user.banner }} style={styles.bannerImg} />
            : <View style={[styles.bannerFallback, { backgroundColor: colors.primary + "33" }]} />}
        </View>

        {/* Avatar + Edit */}
        <View style={[styles.topRow, { paddingTop: insets.top }]}>
          <View style={styles.avatarWrap}>
            {user.avatar
              ? <Image source={{ uri: user.avatar }} style={[styles.avatarImg, { borderColor: colors.background }]} />
              : <View style={[styles.avatarFallback, { backgroundColor: colors.primary + "33", borderColor: colors.background }]}>
                  <Text style={[styles.avatarInitial, { color: colors.primary }]}>{user.username[0]?.toUpperCase()}</Text>
                </View>}
          </View>
          <Pressable
            onPress={() => router.push("/edit-profile")}
            style={[styles.editBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="create-outline" size={16} color={colors.foreground} />
            <Text style={[styles.editBtnText, { color: colors.foreground }]}>Edit Profil</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 6, gap: 2 }}>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, { color: colors.foreground }]}>@{user.username}</Text>
            {isOwner && (
              <View style={[styles.ownerBadge, { backgroundColor: colors.primary + "22" }]}>
                <Ionicons name="star" size={10} color={colors.primary} />
                <Text style={[styles.ownerText, { color: colors.primary }]}>Owner</Text>
              </View>
            )}
          </View>
          <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user.email}</Text>
          <View style={[styles.idBadge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.idText, { color: colors.mutedForeground }]}>ID #{user.id}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{watchlist.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Watchlist</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{watchHistory.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Ditonton</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: isOwner ? colors.primary : colors.foreground }]}>{isOwner ? "Owner" : "Member"}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Status</Text>
          </View>
        </View>

        {/* Notif section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Notifikasi</Text>

          <Pressable
            onPress={toggleNotifications}
            disabled={notifLoading}
            style={[styles.menuItem, { backgroundColor: colors.card, borderColor: notifEnabled ? colors.primary + "55" : colors.border }]}
          >
            <Ionicons name={notifEnabled ? "notifications" : "notifications-outline"} size={20} color={notifEnabled ? colors.primary : colors.mutedForeground} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>
                {notifEnabled ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}
              </Text>
              <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>
                {notifEnabled ? "Tap untuk menonaktifkan" : "Dapat notif anime baru & pesan owner"}
              </Text>
            </View>
            {notifLoading
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <View style={[styles.toggleDot, { backgroundColor: notifEnabled ? colors.primary : colors.border }]} />}
          </Pressable>

          {/* Recent notifs */}
          {notifs.length > 0 && (
            <View style={{ gap: 6 }}>
              <Text style={[styles.notifHeader, { color: colors.mutedForeground }]}>Notifikasi Terbaru</Text>
              {notifs.slice(0, 3).map((n) => (
                <View key={n.id} style={[styles.notifRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.notifDot, { backgroundColor: colors.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifTitle, { color: colors.foreground }]}>{n.title}</Text>
                    <Text style={[styles.notifBody, { color: colors.mutedForeground }]}>{n.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Owner: send notification panel */}
          {isOwner && (
            <Pressable
              onPress={() => setShowOwnerPanel(true)}
              style={[styles.menuItem, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "44" }]}
            >
              <Ionicons name="megaphone-outline" size={20} color={colors.primary} />
              <Text style={[styles.menuLabel, { color: colors.primary }]}>Kirim Notifikasi ke Semua</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          )}
        </View>

        {/* Library */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Perpustakaan</Text>
          <Pressable onPress={() => router.push("/(tabs)/watchlist")} style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="bookmark" size={20} color={colors.primary} />
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Watchlist Saya</Text>
            <View style={styles.menuRight}>
              <Text style={[styles.menuCount, { color: colors.mutedForeground }]}>{watchlist.length}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/history")} style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="time" size={20} color={colors.accent} />
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Riwayat Tontonan</Text>
            <View style={styles.menuRight}>
              <Text style={[styles.menuCount, { color: colors.mutedForeground }]}>{watchHistory.length}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Akun</Text>
          <Pressable
            onPress={() => Alert.alert("Hapus Riwayat", "Yakin?", [{ text: "Batal", style: "cancel" }, { text: "Hapus", style: "destructive", onPress: clearHistory }])}
            style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="trash-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Hapus Riwayat</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={() => Alert.alert("Keluar", "Yakin ingin keluar?", [{ text: "Batal", style: "cancel" }, { text: "Keluar", style: "destructive", onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); logout(); } }])}
            style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
            <Text style={[styles.menuLabel, { color: colors.destructive }]}>Keluar</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>HoshiPlay v1.0.0</Text>
      </ScrollView>

      {/* Owner send notif modal */}
      <Modal visible={showOwnerPanel} animationType="slide" transparent onRequestClose={() => setShowOwnerPanel(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Kirim Notifikasi</Text>
              <Pressable onPress={() => setShowOwnerPanel(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>Pesan akan diterima semua pengguna saat buka app.</Text>
            <TextInput
              value={ownerTitle}
              onChangeText={setOwnerTitle}
              placeholder="Judul notifikasi..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            />
            <TextInput
              value={ownerBody}
              onChangeText={setOwnerBody}
              placeholder="Isi pesan..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, styles.modalTextarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              multiline
              numberOfLines={4}
            />
            <Pressable
              onPress={sendOwnerNotif}
              disabled={sending}
              style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            >
              {sending ? <ActivityIndicator color={colors.background} /> : (
                <>
                  <Ionicons name="send" size={16} color={colors.background} />
                  <Text style={[styles.sendBtnText, { color: colors.background }]}>Kirim Sekarang</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  guestWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 14 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  guestTitle: { fontSize: 22, fontWeight: "700" as const },
  guestSub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  loginBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 24, marginTop: 6 },
  loginBtnText: { fontWeight: "700" as const, fontSize: 15 },
  bannerBox: { width: "100%", height: 140 },
  bannerImg: { width: "100%", height: 140, resizeMode: "cover" },
  bannerFallback: { width: "100%", height: 140 },
  topRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 16, marginTop: -44 },
  avatarWrap: { position: "relative" },
  avatarImg: { width: 80, height: 80, borderRadius: 40, borderWidth: 3 },
  avatarFallback: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 34, fontWeight: "700" as const },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  editBtnText: { fontSize: 13, fontWeight: "500" as const },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  userName: { fontSize: 20, fontWeight: "700" as const },
  ownerBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  ownerText: { fontSize: 11, fontWeight: "700" as const },
  userEmail: { fontSize: 12 },
  idBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 2 },
  idText: { fontSize: 12, fontWeight: "500" as const },
  statsRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 14, borderRadius: 14, borderWidth: 1, paddingVertical: 14 },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 18, fontWeight: "700" as const },
  statLabel: { fontSize: 12 },
  statDiv: { width: StyleSheet.hairlineWidth },
  section: { paddingHorizontal: 16, marginTop: 20, gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: "600" as const, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" as const },
  menuSub: { fontSize: 12, marginTop: 1 },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  menuCount: { fontSize: 14 },
  toggleDot: { width: 12, height: 12, borderRadius: 6 },
  notifHeader: { fontSize: 12, fontWeight: "600" as const, marginTop: 4 },
  notifRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", padding: 10, borderRadius: 10, borderWidth: 1 },
  notifDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },
  notifTitle: { fontSize: 13, fontWeight: "600" as const },
  notifBody: { fontSize: 12, marginTop: 1 },
  version: { textAlign: "center", fontSize: 12, marginTop: 28, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, padding: 20, gap: 12 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 18, fontWeight: "700" as const },
  modalSub: { fontSize: 13 },
  modalInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  modalTextarea: { height: 90, textAlignVertical: "top" },
  sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14 },
  sendBtnText: { fontWeight: "700" as const, fontSize: 15 },
});
