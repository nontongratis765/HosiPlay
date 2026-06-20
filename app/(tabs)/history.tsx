import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HistoryScreen() {
  const colors = useColors();
  const { watchHistory, clearHistory } = useApp();

  function handleClear() {
    Alert.alert("Clear History", "Remove all watch history?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearHistory },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, Platform.OS === "web" ? { paddingTop: 67 } : {}]}>
        <Text style={[styles.title, { color: colors.foreground }]}>History</Text>
        {watchHistory.length > 0 && (
          <Pressable onPress={handleClear}>
            <Text style={[styles.clearBtn, { color: colors.destructive }]}>Clear all</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={watchHistory}
        keyExtractor={(item) => `${item.animeId}-${item.episodeNumber}`}
        contentContainerStyle={[
          styles.list,
          watchHistory.length === 0 ? { flex: 1 } : {},
          Platform.OS === "web" ? { paddingBottom: 34 } : { paddingBottom: 100 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={52} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No history yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Start watching to see your history</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/anime/[id]", params: { id: item.animeId } })}
            style={({ pressed }) => [styles.item, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.info}>
              <Text style={[styles.animeTitle, { color: colors.foreground }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.episodeTitle, { color: colors.mutedForeground }]} numberOfLines={1}>
                Ep {item.episodeNumber}: {item.episodeTitle}
              </Text>
              <View style={styles.progressRow}>
                <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                  <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${item.progress}%` as any }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{item.progress}%</Text>
              </View>
              <Text style={[styles.time, { color: colors.mutedForeground }]}>{timeAgo(item.watchedAt)}</Text>
            </View>
            <Ionicons name="play-circle" size={28} color={colors.primary} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 28, fontWeight: "700" as const },
  clearBtn: { fontSize: 14, fontWeight: "500" as const },
  list: { padding: 16, gap: 10 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  thumbnail: { width: 52, height: 72, borderRadius: 8 },
  info: { flex: 1, gap: 4 },
  animeTitle: { fontSize: 14, fontWeight: "600" as const },
  episodeTitle: { fontSize: 12 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  progressBar: { flex: 1, height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 3, borderRadius: 2 },
  progressText: { fontSize: 10 },
  time: { fontSize: 11 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyTitle: { fontSize: 20, fontWeight: "600" as const },
  emptyText: { fontSize: 14 },
});
