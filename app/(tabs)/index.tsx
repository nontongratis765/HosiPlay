import React from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AnimeCard from "@/components/AnimeCard";
import HeroCarousel from "@/components/HeroCarousel";
import SectionHeader from "@/components/SectionHeader";
import { NEW_RELEASES, TOP_RATED, TRENDING } from "@/data/animeData";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : 100 }}
    >
      {/* Header */}
      <View style={[styles.header, Platform.OS === "web" ? { paddingTop: 67 } : {}]}>
        <View>
          <Text style={[styles.logoText, { color: colors.primary }]}>HoshiPlay</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Anime Streaming</Text>
        </View>
      </View>

      {/* Hero Carousel */}
      <HeroCarousel items={TRENDING} />

      {/* Top Rated */}
      <SectionHeader title="Top Rated" />
      <FlatList
        data={TOP_RATED}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) => (
          <AnimeCard
            id={item.id}
            title={item.title}
            thumbnail={item.thumbnail}
            rating={item.rating}
            episodes={item.episodes}
            status={item.status}
          />
        )}
      />

      {/* New Releases */}
      <SectionHeader title="New Releases" />
      <FlatList
        data={NEW_RELEASES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) => (
          <AnimeCard
            id={item.id}
            title={item.title}
            thumbnail={item.thumbnail}
            rating={item.rating}
            episodes={item.episodes}
          />
        )}
      />

      {/* Popular */}
      <SectionHeader title="Popular Now" />
      <View style={styles.grid}>
        {TRENDING.map((item) => (
          <AnimeCard
            key={item.id}
            id={item.id}
            title={item.title}
            thumbnail={item.thumbnail}
            rating={item.rating}
            episodes={item.episodes}
            status={item.status}
            size="small"
          />
        ))}
      </View>
    </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoText: {
    fontSize: 26,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: -2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
});
