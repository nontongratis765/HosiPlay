import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface WatchHistoryItem {
  animeId: string;
  title: string;
  thumbnail: string;
  episodeNumber: number;
  episodeTitle: string;
  watchedAt: string;
  progress: number; // 0-100
}

export interface WatchlistItem {
  animeId: string;
  title: string;
  thumbnail: string;
  genre: string;
  addedAt: string;
}

interface AppContextType {
  watchlist: WatchlistItem[];
  watchHistory: WatchHistoryItem[];
  addToWatchlist: (item: Omit<WatchlistItem, "addedAt">) => Promise<void>;
  removeFromWatchlist: (animeId: string) => Promise<void>;
  isInWatchlist: (animeId: string) => boolean;
  addToHistory: (item: Omit<WatchHistoryItem, "watchedAt">) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const WATCHLIST_KEY = "@hoshiplay_watchlist";
const HISTORY_KEY = "@hoshiplay_history";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [wl, wh] = await Promise.all([
        AsyncStorage.getItem(WATCHLIST_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
      ]);
      if (wl) setWatchlist(JSON.parse(wl));
      if (wh) setWatchHistory(JSON.parse(wh));
    } catch {}
  }

  async function addToWatchlist(item: Omit<WatchlistItem, "addedAt">) {
    const newItem: WatchlistItem = { ...item, addedAt: new Date().toISOString() };
    const updated = [newItem, ...watchlist.filter((w) => w.animeId !== item.animeId)];
    setWatchlist(updated);
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  }

  async function removeFromWatchlist(animeId: string) {
    const updated = watchlist.filter((w) => w.animeId !== animeId);
    setWatchlist(updated);
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  }

  function isInWatchlist(animeId: string) {
    return watchlist.some((w) => w.animeId === animeId);
  }

  async function addToHistory(item: Omit<WatchHistoryItem, "watchedAt">) {
    const newItem: WatchHistoryItem = { ...item, watchedAt: new Date().toISOString() };
    const updated = [newItem, ...watchHistory.filter((h) => !(h.animeId === item.animeId && h.episodeNumber === item.episodeNumber))].slice(0, 50);
    setWatchHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }

  async function clearHistory() {
    setWatchHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  }

  return (
    <AppContext.Provider value={{ watchlist, watchHistory, addToWatchlist, removeFromWatchlist, isInWatchlist, addToHistory, clearHistory }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
