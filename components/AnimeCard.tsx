import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface AnimeCardProps {
  id: string;
  title: string;
  thumbnail: string;
  rating?: number;
  episodes?: number;
  status?: "ongoing" | "completed";
  size?: "small" | "medium" | "large";
}

const { width } = Dimensions.get("window");
const CARD_SMALL = (width - 48) / 3;
const CARD_MEDIUM = (width - 40) / 2.3;

export default function AnimeCard({
  id,
  title,
  thumbnail,
  rating,
  episodes,
  status,
  size = "medium",
}: AnimeCardProps) {
  const colors = useColors();

  const cardWidth = size === "small" ? CARD_SMALL : size === "large" ? width - 32 : CARD_MEDIUM;
  const cardHeight = size === "small" ? CARD_SMALL * 1.4 : size === "large" ? 200 : CARD_MEDIUM * 1.4;

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/anime/[id]", params: { id } })}
      style={({ pressed }) => [
        styles.container,
        { width: cardWidth, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.imageContainer, { width: cardWidth, height: cardHeight, borderRadius: 10, borderColor: colors.border }]}>
        <Image
          source={{ uri: thumbnail }}
          style={[StyleSheet.absoluteFill, { borderRadius: 10 }]}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        {status && (
          <View style={[styles.badge, { backgroundColor: status === "ongoing" ? colors.accent : colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.background }]}>
              {status === "ongoing" ? "ON AIR" : "DONE"}
            </Text>
          </View>
        )}
        {rating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#f4c542" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
        {title}
      </Text>
      {episodes && (
        <Text style={[styles.episodes, { color: colors.mutedForeground }]}>
          {episodes} eps
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  imageContainer: {
    overflow: "hidden",
    borderWidth: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    background: "transparent",
  },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  ratingBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: "#f4c542",
    fontSize: 10,
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 12,
    fontWeight: "600" as const,
    marginTop: 6,
    lineHeight: 16,
  },
  episodes: {
    fontSize: 11,
    marginTop: 2,
  },
});
