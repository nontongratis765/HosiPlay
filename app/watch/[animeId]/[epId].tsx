import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { getAnimeById } from "@/data/animeData";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

const SANKA = "https://www.sankavollerei.web.id/anime";

interface Server { serverId: string; title: string }
interface Quality { title: string; serverList: Server[] }
interface EpisodeData {
  title?: string;
  defaultStreamingUrl?: string;
  releaseTime?: string;
  hasPrevEpisode?: boolean;
  hasNextEpisode?: boolean;
  prevEpisode?: { episodeId: string };
  nextEpisode?: { episodeId: string };
  info?: { duration?: string; episodeList?: Array<{ episodeId: string; eps: string; title: string }> };
  server?: { qualities?: Quality[] };
}

async function fetchEpisode(episodeId: string): Promise<EpisodeData | null> {
  try {
    const r = await fetch(`${SANKA}/episode/${encodeURIComponent(episodeId)}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return null;
    const json = await r.json();
    return json?.data ?? null;
  } catch { return null; }
}

async function fetchServer(serverId: string): Promise<string | null> {
  try {
    const r = await fetch(`${SANKA}/server/${encodeURIComponent(serverId)}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return null;
    const json = await r.json();
    return json?.data?.url ?? null;
  } catch { return null; }
}

async function searchAnimeSlug(title: string): Promise<string | null> {
  try {
    const r = await fetch(`${SANKA}/search/${encodeURIComponent(title)}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const json = await r.json();
    const list = json?.data?.animeList ?? json?.data ?? [];
    if (!Array.isArray(list) || !list.length) return null;
    return list[0]?.animeId ?? list[0]?.slug ?? list[0]?.id ?? null;
  } catch { return null; }
}

async function getFirstEpisodeId(slug: string): Promise<string | null> {
  try {
    const r = await fetch(`${SANKA}/anime/${encodeURIComponent(slug)}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const json = await r.json();
    const eps = json?.data?.episodeList ?? [];
    if (!eps.length) return null;
    return eps[0]?.episodeId ?? null;
  } catch { return null; }
}

export default function WatchScreen() {
  const { animeId, epId } = useLocalSearchParams<{ animeId: string; epId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addToHistory } = useApp();

  const [epData, setEpData] = useState<EpisodeData | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<"finding" | "selecting" | "playing" | "error">("finding");
  const [errorMsg, setErrorMsg] = useState("");
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [serverLoading, setServerLoading] = useState(false);

  const anime = getAnimeById(animeId ?? "");
  const episode = anime?.episodeList.find((e) => e.id === epId);

  useEffect(() => { init(); }, [animeId, epId]);

  async function init() {
    if (!anime) return;
    setLoadState("finding");
    setStreamUrl(null);
    setEpData(null);
    setErrorMsg("");

    // 1. Try direct episodeId match: use animeId + episode number as slug
    const epNum = episode?.number ?? 1;
    const slug = `${anime.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-episode-${epNum}`;

    let data = await fetchEpisode(slug);
    if (!data) {
      // 2. Search for anime then get first matching episode
      const animeSlug = await searchAnimeSlug(anime.title);
      if (!animeSlug) { setLoadState("error"); setErrorMsg("Anime tidak ditemukan di server streaming"); return; }

      const epSlug = `${animeSlug}-episode-${epNum}`;
      data = await fetchEpisode(epSlug);
      if (!data) { setLoadState("error"); setErrorMsg("Episode tidak tersedia di server ini"); return; }
    }

    setEpData(data);

    // 3. If there's a defaultStreamingUrl, use it straight away
    if (data.defaultStreamingUrl) {
      setStreamUrl(data.defaultStreamingUrl);
      setLoadState("playing");
      saveHistory();
      return;
    }

    // 4. Otherwise show server picker
    const qs = data.server?.qualities ?? [];
    if (!qs.length) { setLoadState("error"); setErrorMsg("Tidak ada server streaming tersedia"); return; }
    setQualities(qs);
    setLoadState("selecting");
  }

  async function pickServer(serverId: string) {
    setActiveServerId(serverId);
    setServerLoading(true);
    const url = await fetchServer(serverId);
    setServerLoading(false);
    if (!url) { alert("Server tidak bisa dimuat, coba server lain"); return; }
    setStreamUrl(url);
    setLoadState("playing");
    saveHistory();
  }

  function saveHistory() {
    if (!anime || !episode) return;
    addToHistory({
      animeId: anime.id,
      title: anime.title,
      thumbnail: anime.thumbnail,
      episodeNumber: episode.number,
      episodeTitle: episode.title,
      progress: 50,
    });
  }

  function goEp(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace({ pathname: "/watch/[animeId]/[epId]", params: { animeId: animeId!, epId: id } });
  }

  if (!anime || !episode) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, flex: 1 }]}>
        <Text style={{ color: colors.mutedForeground }}>Episode tidak ditemukan</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary }}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const currentIndex = anime.episodeList.findIndex((e) => e.id === epId);
  const prevEp = currentIndex > 0 ? anime.episodeList[currentIndex - 1] : null;
  const nextEp = currentIndex < anime.episodeList.length - 1 ? anime.episodeList[currentIndex + 1] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerAnime, { color: colors.foreground }]} numberOfLines={1}>{anime.title}</Text>
          <Text style={[styles.headerEp, { color: colors.mutedForeground }]}>Ep {episode.number}: {episode.title}</Text>
        </View>
      </View>

      {/* Video Box */}
      <View style={[styles.videoBox, { backgroundColor: "#000" }]}>
        {loadState === "finding" && (
          <View style={styles.videoCenter}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.videoMsg, { color: "rgba(255,255,255,0.6)" }]}>Mencari stream anime...</Text>
          </View>
        )}

        {loadState === "selecting" && (
          <View style={styles.serverPicker}>
            <Text style={styles.serverTitle}>Pilih Server Streaming</Text>
            {serverLoading && <ActivityIndicator color={colors.primary} style={{ marginBottom: 8 }} />}
            {qualities.map((q) => (
              <View key={q.title}>
                <Text style={styles.qualityLabel}>{q.title}</Text>
                <View style={styles.serverRow}>
                  {(q.serverList ?? []).filter(s => s.serverId).map((s) => (
                    <Pressable
                      key={s.serverId}
                      onPress={() => pickServer(s.serverId)}
                      disabled={serverLoading}
                      style={[
                        styles.serverBtn,
                        {
                          backgroundColor: activeServerId === s.serverId ? colors.primary : colors.card,
                          borderColor: activeServerId === s.serverId ? colors.primary : colors.border,
                          opacity: serverLoading && activeServerId !== s.serverId ? 0.5 : 1,
                        },
                      ]}
                    >
                      <Text style={[styles.serverBtnText, { color: activeServerId === s.serverId ? colors.background : colors.foreground }]}>
                        {s.title.trim()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {loadState === "playing" && streamUrl && Platform.OS !== "web" && (
          <WebView
            source={{ uri: streamUrl }}
            style={styles.webview}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            userAgent="Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
          />
        )}

        {loadState === "playing" && Platform.OS === "web" && (
          <View style={styles.videoCenter}>
            <Ionicons name="play-circle" size={52} color={colors.primary} />
            <Text style={styles.videoMsg}>Stream tersedia! Buka di HP untuk nonton.</Text>
          </View>
        )}

        {loadState === "error" && (
          <View style={styles.videoCenter}>
            <Ionicons name="wifi-outline" size={44} color="rgba(255,255,255,0.3)" />
            <Text style={styles.videoMsgError}>{errorMsg || "Stream tidak tersedia"}</Text>
            <Pressable onPress={init} style={[styles.retryBtn, { borderColor: colors.border }]}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 13 }}>Coba Lagi</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Nav + Episode list */}
      <FlatList
        data={anime.episodeList}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 14, paddingBottom: insets.bottom + 80, gap: 8 }}
        ListHeaderComponent={
          <View style={{ gap: 10, marginBottom: 10 }}>
            {/* Server re-pick if playing */}
            {loadState === "playing" && qualities.length > 0 && (
              <Pressable
                onPress={() => { setLoadState("selecting"); setStreamUrl(null); }}
                style={[styles.changeServerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Ionicons name="server-outline" size={16} color={colors.primary} />
                <Text style={[styles.changeServerText, { color: colors.primary }]}>Ganti Server</Text>
              </Pressable>
            )}
            {/* Nav */}
            <View style={styles.navRow}>
              <Pressable
                onPress={() => prevEp && goEp(prevEp.id)}
                disabled={!prevEp}
                style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border, opacity: prevEp ? 1 : 0.3 }]}
              >
                <Ionicons name="skip-back" size={18} color={colors.foreground} />
                <Text style={[styles.navText, { color: colors.foreground }]}>Sebelumnya</Text>
              </Pressable>
              <Pressable
                onPress={() => nextEp && goEp(nextEp.id)}
                disabled={!nextEp}
                style={[styles.navBtn, { backgroundColor: colors.primary, borderColor: colors.primary, opacity: nextEp ? 1 : 0.3 }]}
              >
                <Text style={[styles.navText, { color: colors.background }]}>Selanjutnya</Text>
                <Ionicons name="skip-forward" size={18} color={colors.background} />
              </Pressable>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Semua Episode</Text>
          </View>
        }
        renderItem={({ item: ep }) => (
          <Pressable
            onPress={() => goEp(ep.id)}
            style={({ pressed }) => [
              styles.epRow,
              {
                backgroundColor: ep.id === epId ? colors.primary + "22" : colors.card,
                borderColor: ep.id === epId ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={[styles.epNumBadge, { backgroundColor: ep.id === epId ? colors.primary : colors.muted }]}>
              <Text style={[styles.epNum, { color: ep.id === epId ? colors.background : colors.mutedForeground }]}>{ep.number}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.epTitle, { color: colors.foreground }]} numberOfLines={1}>{ep.title}</Text>
              <Text style={[styles.epDur, { color: colors.mutedForeground }]}>{ep.duration}</Text>
            </View>
            {ep.id === epId && <Ionicons name="play-circle" size={20} color={colors.primary} />}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headerAnime: { fontSize: 15, fontWeight: "600" as const },
  headerEp: { fontSize: 12, marginTop: 1 },
  videoBox: { width, aspectRatio: 16 / 9 },
  webview: { flex: 1 },
  videoCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 20 },
  videoMsg: { color: "rgba(255,255,255,0.7)", fontSize: 13, textAlign: "center" },
  videoMsgError: { color: "rgba(255,255,255,0.6)", fontSize: 13, textAlign: "center" },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginTop: 4 },
  serverPicker: { flex: 1, padding: 14, gap: 10 },
  serverTitle: { color: "#fff", fontSize: 14, fontWeight: "700" as const, marginBottom: 4 },
  qualityLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "600" as const, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  serverRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  serverBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  serverBtnText: { fontSize: 13, fontWeight: "500" as const },
  changeServerBtn: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 10, borderWidth: 1 },
  changeServerText: { fontSize: 13, fontWeight: "600" as const },
  navRow: { flexDirection: "row", gap: 10 },
  navBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  navText: { fontSize: 14, fontWeight: "600" as const },
  sectionTitle: { fontSize: 16, fontWeight: "700" as const },
  epRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  epNumBadge: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  epNum: { fontSize: 13, fontWeight: "700" as const },
  epTitle: { fontSize: 13, fontWeight: "500" as const },
  epDur: { fontSize: 11, marginTop: 2 },
});
