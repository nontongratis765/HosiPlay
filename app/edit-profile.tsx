import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const IMGBB_KEY = "2e5a1e8d9a1a3e7b3e7b3e7b3e7b3e7b"; // free imgbb key

async function uploadToImgbb(uri: string): Promise<string> {
  const formData = new FormData();
  const filename = uri.split("/").pop() ?? "image.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";
  formData.append("image", { uri, name: filename, type } as any);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error("Upload gagal");
  return data.data.url as string;
}

async function pickImage(aspect?: [number, number]): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Izin diperlukan", "Izinkan akses galeri untuk memilih foto.");
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: aspect ?? [1, 1],
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0].uri;
}

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();

  const [username, setUsername] = useState(user?.username ?? "");
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar ?? null);
  const [bannerUri, setBannerUri] = useState<string | null>(user?.banner ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handlePickAvatar() {
    const uri = await pickImage([1, 1]);
    if (!uri) return;
    setAvatarUploading(true);
    try {
      const url = await uploadToImgbb(uri);
      setAvatarUri(url);
    } catch { Alert.alert("Gagal upload foto profil"); }
    setAvatarUploading(false);
  }

  async function handlePickBanner() {
    const uri = await pickImage([16, 9]);
    if (!uri) return;
    setBannerUploading(true);
    try {
      const url = await uploadToImgbb(uri);
      setBannerUri(url);
    } catch { Alert.alert("Gagal upload banner"); }
    setBannerUploading(false);
  }

  async function handleSave() {
    setError("");
    setSuccess("");
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await updateProfile({
        username: username !== user?.username ? username : undefined,
        avatar: avatarUri !== user?.avatar ? avatarUri ?? "" : undefined,
        banner: bannerUri !== user?.banner ? bannerUri ?? "" : undefined,
      });
      setSuccess("Profil berhasil diperbarui!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => router.back(), 800);
    } catch (e: any) {
      setError(e.message ?? "Gagal menyimpan");
    }
    setSaving(false);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Profil</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Banner */}
        <Pressable onPress={handlePickBanner} disabled={bannerUploading} style={styles.bannerWrapper}>
          {bannerUri ? (
            <Image source={{ uri: bannerUri }} style={styles.bannerImg} />
          ) : (
            <View style={[styles.bannerPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {bannerUploading
                ? <ActivityIndicator color={colors.primary} />
                : <>
                    <Ionicons name="image-outline" size={28} color={colors.mutedForeground} />
                    <Text style={[styles.bannerHint, { color: colors.mutedForeground }]}>Tap untuk pasang banner (foto/gif)</Text>
                  </>}
            </View>
          )}
          {!bannerUploading && (
            <View style={[styles.editOverlay, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          )}
        </Pressable>

        <View style={styles.avatarSection}>
          <Pressable onPress={handlePickAvatar} disabled={avatarUploading} style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={[styles.avatarImg, { borderColor: colors.background }]} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: colors.primary + "33", borderColor: colors.background }]}>
                <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                  {user?.username?.[0]?.toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
              {avatarUploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="camera" size={12} color="#fff" />}
            </View>
          </Pressable>
          <Text style={[styles.avatarHint, { color: colors.mutedForeground }]}>Foto/GIF Profil</Text>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 12, marginTop: 8 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Username</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.atSign, { color: colors.mutedForeground }]}>@</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "44" }]}>
              <Ionicons name="alert-circle-outline" size={15} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          )}

          {!!success && (
            <View style={[styles.successBox, { backgroundColor: "#22c55e22", borderColor: "#22c55e44" }]}>
              <Ionicons name="checkmark-circle-outline" size={15} color="#22c55e" />
              <Text style={[styles.successText, { color: "#22c55e" }]}>{success}</Text>
            </View>
          )}

          <Pressable
            onPress={handleSave}
            disabled={saving || avatarUploading || bannerUploading}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: colors.primary, opacity: (saving || pressed) ? 0.8 : 1 },
            ]}
          >
            {saving
              ? <ActivityIndicator color={colors.background} />
              : <>
                  <Ionicons name="checkmark" size={18} color={colors.background} />
                  <Text style={[styles.saveBtnText, { color: colors.background }]}>Simpan Perubahan</Text>
                </>}
          </Pressable>

          {bannerUri && (
            <Pressable
              onPress={() => setBannerUri(null)}
              style={[styles.removeBtn, { borderColor: colors.border }]}
            >
              <Ionicons name="trash-outline" size={15} color={colors.mutedForeground} />
              <Text style={[styles.removeBtnText, { color: colors.mutedForeground }]}>Hapus Banner</Text>
            </Pressable>
          )}
          {avatarUri && (
            <Pressable
              onPress={() => setAvatarUri(null)}
              style={[styles.removeBtn, { borderColor: colors.border }]}
            >
              <Ionicons name="trash-outline" size={15} color={colors.mutedForeground} />
              <Text style={[styles.removeBtnText, { color: colors.mutedForeground }]}>Hapus Foto Profil</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 17, fontWeight: "600" as const },
  bannerWrapper: { width: "100%", height: 140, position: "relative" },
  bannerImg: { width: "100%", height: 140, resizeMode: "cover" },
  bannerPlaceholder: { width: "100%", height: 140, alignItems: "center", justifyContent: "center", gap: 6, borderBottomWidth: 1 },
  bannerHint: { fontSize: 12 },
  editOverlay: { position: "absolute", bottom: 8, right: 10, padding: 6, borderRadius: 20 },
  avatarSection: { alignItems: "flex-start", paddingHorizontal: 16, marginTop: -36, gap: 6 },
  avatarWrapper: { position: "relative", width: 72, height: 72 },
  avatarImg: { width: 72, height: 72, borderRadius: 36, borderWidth: 3 },
  avatarFallback: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 30, fontWeight: "700" as const },
  avatarBadge: { position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  avatarHint: { fontSize: 12 },
  label: { fontSize: 13, fontWeight: "500" as const, marginTop: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12, borderWidth: 1 },
  atSign: { fontSize: 15, fontWeight: "500" as const },
  input: { flex: 1, fontSize: 15, padding: 0 },
  errorBox: { flexDirection: "row", gap: 8, alignItems: "center", padding: 10, borderRadius: 10, borderWidth: 1 },
  errorText: { flex: 1, fontSize: 13 },
  successBox: { flexDirection: "row", gap: 8, alignItems: "center", padding: 10, borderRadius: 10, borderWidth: 1 },
  successText: { flex: 1, fontSize: 13 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 4 },
  saveBtnText: { fontSize: 15, fontWeight: "700" as const },
  removeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  removeBtnText: { fontSize: 13 },
});
