import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function WatchlistScreen() {
  const colors = useColors();
  const { watchlist, removeFromWatchlist } = useApp();

  function handleRemove(animeId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeFromWatchlist(animeId);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, Platform.OS === "web" ? { paddingTop: 67 } : {}]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My List</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {watchlist.length} anime
        </Text>
      </View>

      <FlatList
        data={watchlist}
        keyExtractor={(item) => item.animeId}
        contentContainerStyle={[
          styles.list,
          watchlist.length === 0 ? { flex: 1 } : {},
          Platform.OS === "web" ? { paddingBottom: 34 } : { paddingBottom: 100 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={52} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>Nothing here yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Save anime to watch later</Text>
            <Pressable
              onPress={() => router.push("/(tabs)/search")}
              style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.browseBtnText, { color: colors.background }]}>Browse Anime</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/anime/[id]", params: { id: item.animeId } })}
            style={({ pressed }) => [styles.item, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.info}>
              <Text style={[styles.animeTitle, { color: colors.foreground }]} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={[styles.genrePill, { backgroundColor: colors.muted }]}>
                <Text style={[styles.genre, { color: colors.mutedForeground }]}>{item.genre}</Text>
              </View>
            </View>
            <Pressable
              onPress={() => handleRemove(item.animeId)}
              hitSlop={12}
            >
              <Ionicons name="trash-outline" size={20} color={colors.destructive} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  count: {
    fontSize: 14,
    marginTop: 2,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  thumbnail: {
    width: 52,
    height: 72,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  animeTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  genrePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  genre: {
    fontSize: 12,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  emptyText: {
    fontSize: 14,
  },
  browseBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseBtnText: {
    fontWeight: "700" as const,
    fontSize: 15,
  },
});
