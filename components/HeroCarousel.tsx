import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useApp } from "@/context/AppContext";
import type { Anime } from "@/data/animeData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

interface HeroCarouselProps {
  items: Anime[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatlistRef = useRef<FlatList>(null);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useApp();

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeIndex + 1) % items.length;
      flatlistRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex, items.length]);

  const current = items[activeIndex];
  const inWatchlist = current ? isInWatchlist(current.id) : false;

  function handleWatchlistToggle() {
    if (!current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (inWatchlist) {
      removeFromWatchlist(current.id);
    } else {
      addToWatchlist({
        animeId: current.id,
        title: current.title,
        thumbnail: current.thumbnail,
        genre: current.genre[0] ?? "",
      });
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatlistRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <Pressable
            style={{ width }}
            onPress={() => router.push({ pathname: "/anime/[id]", params: { id: item.id } })}
          >
            <Image source={{ uri: item.banner || item.thumbnail }} style={styles.image} resizeMode="cover" />
            <View style={styles.gradient} />
          </Pressable>
        )}
      />

      {/* Info overlay */}
      {current && (
        <View style={[styles.infoOverlay, { backgroundColor: "transparent" }]}>
          <View style={styles.genres}>
            {current.genre.slice(0, 3).map((g) => (
              <View key={g} style={[styles.genrePill, { borderColor: colors.primary + "80" }]}>
                <Text style={[styles.genreText, { color: colors.primary }]}>{g}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>{current.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={13} color="#f4c542" />
            <Text style={styles.metaText}>{current.rating}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{current.year}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{current.episodes} eps</Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push({ pathname: "/anime/[id]", params: { id: current.id } })}
              style={[styles.watchBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="play" size={16} color={colors.background} />
              <Text style={[styles.watchBtnText, { color: colors.background }]}>Watch Now</Text>
            </Pressable>

            <Pressable
              onPress={handleWatchlistToggle}
              style={[styles.listBtn, { borderColor: colors.border, backgroundColor: colors.card + "cc" }]}
            >
              <Ionicons
                name={inWatchlist ? "bookmark" : "bookmark-outline"}
                size={18}
                color={inWatchlist ? colors.primary : colors.mutedForeground}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* Dots */}
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIndex ? colors.primary : colors.border,
                width: i === activeIndex ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: 340,
  },
  image: {
    width,
    height: 340,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
  },
  genres: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  genrePill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: "rgba(13,13,24,0.6)",
  },
  genreText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
  },
  metaText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  metaDot: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  watchBtnText: {
    fontWeight: "700" as const,
    fontSize: 14,
  },
  listBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
