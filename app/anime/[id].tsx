import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { type Episode, getAnimeById } from "@/data/animeData";
import { useColors } from "@/hooks/useColors";

export default function AnimeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useApp();
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  const anime = getAnimeById(id ?? "");

  if (!anime) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Anime not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const inWatchlist = isInWatchlist(anime.id);

  function toggleWatchlist() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (inWatchlist) {
      removeFromWatchlist(anime!.id);
    } else {
      addToWatchlist({
        animeId: anime!.id,
        title: anime!.title,
        thumbnail: anime!.thumbnail,
        genre: anime!.genre[0] ?? "",
      });
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Banner */}
      <View style={{ position: "relative" }}>
        <Image source={{ uri: anime.banner || anime.thumbnail }} style={styles.banner} resizeMode="cover" />
        <View style={[styles.bannerOverlay, { backgroundColor: colors.background + "cc" }]} />

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { top: insets.top + 8, backgroundColor: colors.card + "dd", borderColor: colors.border }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Thumbnail + info */}
      <View style={styles.infoSection}>
        <Image source={{ uri: anime.thumbnail }} style={[styles.thumbnail, { borderColor: colors.border }]} />
        <View style={styles.infoText}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
            {anime.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={13} color="#f4c542" />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>{anime.rating}</Text>
            <Text style={[styles.metaDot, { color: colors.border }]}>•</Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>{anime.year}</Text>
            <Text style={[styles.metaDot, { color: colors.border }]}>•</Text>
            <Text style={[styles.meta, { color: anime.status === "ongoing" ? colors.accent : colors.primary }]}>
              {anime.status === "ongoing" ? "Ongoing" : "Completed"}
            </Text>
          </View>
          <Text style={[styles.studio, { color: colors.mutedForeground }]}>{anime.studio}</Text>
        </View>
      </View>

      {/* Genres */}
      <View style={styles.genres}>
        {anime.genre.map((g) => (
          <View key={g} style={[styles.genrePill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.genreText, { color: colors.primary }]}>{g}</Text>
          </View>
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push({ pathname: "/watch/[animeId]/[epId]", params: { animeId: anime.id, epId: anime.episodeList[0]?.id ?? "" } })}
          style={[styles.watchBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="play" size={18} color={colors.background} />
          <Text style={[styles.watchBtnText, { color: colors.background }]}>Watch Now</Text>
        </Pressable>

        <Pressable
          onPress={toggleWatchlist}
          style={[styles.listBtn, { backgroundColor: colors.card, borderColor: inWatchlist ? colors.primary : colors.border }]}
        >
          <Ionicons name={inWatchlist ? "bookmark" : "bookmark-outline"} size={20} color={inWatchlist ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.listBtnText, { color: inWatchlist ? colors.primary : colors.mutedForeground }]}>
            {inWatchlist ? "Saved" : "Save"}
          </Text>
        </Pressable>
      </View>

      {/* Synopsis */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Synopsis</Text>
        <Pressable onPress={() => setShowFullSynopsis((v) => !v)}>
          <Text style={[styles.synopsis, { color: colors.mutedForeground }]} numberOfLines={showFullSynopsis ? undefined : 3}>
            {anime.synopsis}
          </Text>
          <Text style={[styles.readMore, { color: colors.primary }]}>
            {showFullSynopsis ? "Show less" : "Read more"}
          </Text>
        </Pressable>
      </View>

      {/* Episode list */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Episodes ({anime.episodes})
        </Text>
        {anime.episodeList.map((ep) => (
          <EpisodeRow key={ep.id} animeId={anime.id} animeTitle={anime.title} animeThumbnail={anime.thumbnail} episode={ep} />
        ))}
        {anime.episodes > anime.episodeList.length && (
          <View style={[styles.moreEps, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.moreEpsText, { color: colors.mutedForeground }]}>
              +{anime.episodes - anime.episodeList.length} more episodes available
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function EpisodeRow({ animeId, animeTitle, animeThumbnail, episode }: { animeId: string; animeTitle: string; animeThumbnail: string; episode: Episode }) {
  const colors = useColors();
  const { addToHistory } = useApp();

  function handlePress() {
    addToHistory({
      animeId,
      title: animeTitle,
      thumbnail: animeThumbnail,
      episodeNumber: episode.number,
      episodeTitle: episode.title,
      progress: 0,
    });
    router.push({ pathname: "/watch/[animeId]/[epId]", params: { animeId, epId: episode.id } });
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.episodeRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[styles.epNumberBadge, { backgroundColor: colors.muted }]}>
        <Text style={[styles.epNumber, { color: colors.mutedForeground }]}>{episode.number}</Text>
      </View>
      <View style={styles.epInfo}>
        <Text style={[styles.epTitle, { color: colors.foreground }]} numberOfLines={1}>
          {episode.title}
        </Text>
        <Text style={[styles.epDuration, { color: colors.mutedForeground }]}>{episode.duration}</Text>
      </View>
      <Ionicons name="play-circle-outline" size={24} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  banner: { width: "100%", height: 240 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: -60,
    gap: 14,
    alignItems: "flex-end",
  },
  thumbnail: {
    width: 100,
    height: 145,
    borderRadius: 10,
    borderWidth: 2,
  },
  infoText: {
    flex: 1,
    paddingBottom: 4,
    gap: 6,
  },
  title: { fontSize: 20, fontWeight: "700" as const, lineHeight: 26 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  meta: { fontSize: 13 },
  metaDot: { fontSize: 13 },
  studio: { fontSize: 12 },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  genrePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  genreText: { fontSize: 12, fontWeight: "500" as const },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  watchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  watchBtnText: { fontWeight: "700" as const, fontSize: 15 },
  listBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  listBtnText: { fontWeight: "600" as const, fontSize: 14 },
  section: { paddingHorizontal: 16, marginTop: 20, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const },
  synopsis: { fontSize: 14, lineHeight: 22 },
  readMore: { marginTop: 4, fontSize: 13, fontWeight: "500" as const },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  epNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  epNumber: { fontSize: 14, fontWeight: "700" as const },
  epInfo: { flex: 1, gap: 2 },
  epTitle: { fontSize: 14, fontWeight: "500" as const },
  epDuration: { fontSize: 12 },
  moreEps: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  moreEpsText: { fontSize: 13 },
});
