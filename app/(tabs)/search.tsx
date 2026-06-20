import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AnimeCard from "@/components/AnimeCard";
import SearchBar from "@/components/SearchBar";
import { ANIME_LIST, GENRES, getAnimeByGenre, searchAnime } from "@/data/animeData";
import { useColors } from "@/hooks/useColors";

export default function SearchScreen() {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const results = query.trim().length > 0
    ? searchAnime(query)
    : getAnimeByGenre(selectedGenre);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, Platform.OS === "web" ? { paddingTop: 67 } : {}]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Discover</Text>
        <SearchBar value={query} onChangeText={setQuery} />

        {/* Genre pills */}
        {!query && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreList}
          >
            {GENRES.map((g) => (
              <Pressable
                key={g}
                onPress={() => setSelectedGenre(g)}
                style={[
                  styles.genrePill,
                  {
                    backgroundColor: selectedGenre === g ? colors.primary : colors.card,
                    borderColor: selectedGenre === g ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.genreText,
                    { color: selectedGenre === g ? colors.background : colors.mutedForeground },
                  ]}
                >
                  {g}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.list, Platform.OS === "web" ? { paddingBottom: 34 } : { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No anime found</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Try a different search or genre</Text>
          </View>
        }
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    paddingHorizontal: 16,
  },
  genreList: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  genrePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  row: {
    gap: 12,
    justifyContent: "space-between",
  },
  empty: {
    alignItems: "center",
    marginTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  emptyText: {
    fontSize: 14,
  },
});
