export interface Episode {
  id: string;
  number: number;
  title: string;
  duration: string;
  thumbnail: string;
  streamUrl: string;
}

export interface Anime {
  id: string;
  title: string;
  thumbnail: string;
  banner: string;
  genre: string[];
  rating: number;
  year: number;
  status: "ongoing" | "completed";
  episodes: number;
  synopsis: string;
  studio: string;
  episodeList: Episode[];
}

// We use Consumet's public anime API (anime-sama or gogoanime via proxy)
// For demo, we provide rich mock data with real video embed URLs
export const ANIME_LIST: Anime[] = [
  {
    id: "1",
    title: "Demon Slayer",
    thumbnail: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    genre: ["Action", "Fantasy", "Shounen"],
    rating: 8.7,
    year: 2019,
    status: "ongoing",
    episodes: 44,
    synopsis: "A young boy becomes a demon slayer after his family is slaughtered and his sister is turned into a demon. He joins a secret organization to find a cure and avenge his family.",
    studio: "ufotable",
    episodeList: [
      { id: "1-1", number: 1, title: "Cruelty", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", streamUrl: "https://www.youtube.com/embed/VQGCKyvzIM4" },
      { id: "1-2", number: 2, title: "Trainer Sakonji Urokodaki", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", streamUrl: "https://www.youtube.com/embed/VQGCKyvzIM4" },
      { id: "1-3", number: 3, title: "Sabito and Makomo", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", streamUrl: "https://www.youtube.com/embed/VQGCKyvzIM4" },
    ],
  },
  {
    id: "2",
    title: "Attack on Titan",
    thumbnail: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    genre: ["Action", "Drama", "Mystery"],
    rating: 9.0,
    year: 2013,
    status: "completed",
    episodes: 87,
    synopsis: "In a world where humanity lives within enormous walled cities to protect themselves from Titans, a young boy vows revenge after watching a Titan devour his mother.",
    studio: "MAPPA",
    episodeList: [
      { id: "2-1", number: 1, title: "To You, in 2000 Years: The Fall of Shiganshina, Part 1", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", streamUrl: "https://www.youtube.com/embed/aMnHFaGDM5I" },
      { id: "2-2", number: 2, title: "That Day: The Fall of Shiganshina, Part 2", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", streamUrl: "https://www.youtube.com/embed/aMnHFaGDM5I" },
      { id: "2-3", number: 3, title: "A Dim Light Amid Despair", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", streamUrl: "https://www.youtube.com/embed/aMnHFaGDM5I" },
    ],
  },
  {
    id: "3",
    title: "Jujutsu Kaisen",
    thumbnail: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    genre: ["Action", "Supernatural", "Shounen"],
    rating: 8.6,
    year: 2020,
    status: "ongoing",
    episodes: 48,
    synopsis: "A high school student swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a secret school of sorcerers, facing supernatural threats.",
    studio: "MAPPA",
    episodeList: [
      { id: "3-1", number: 1, title: "Ryomen Sukuna", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg", streamUrl: "https://www.youtube.com/embed/pkKu9hLT-t8" },
      { id: "3-2", number: 2, title: "For Myself", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg", streamUrl: "https://www.youtube.com/embed/pkKu9hLT-t8" },
      { id: "3-3", number: 3, title: "Girl of Steel", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg", streamUrl: "https://www.youtube.com/embed/pkKu9hLT-t8" },
    ],
  },
  {
    id: "4",
    title: "One Piece",
    thumbnail: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    genre: ["Adventure", "Comedy", "Shounen"],
    rating: 8.7,
    year: 1999,
    status: "ongoing",
    episodes: 1100,
    synopsis: "Monkey D. Luffy sets off on a journey from the East Blue Sea to find the legendary treasure called One Piece and proclaim himself King of the Pirates.",
    studio: "Toei Animation",
    episodeList: [
      { id: "4-1", number: 1, title: "I'm Luffy! The Man Who's Gonna Be King of the Pirates!", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", streamUrl: "https://www.youtube.com/embed/MCuqYnzSGok" },
      { id: "4-2", number: 2, title: "The Great Swordsman Appears! Pirate Hunter Roronoa Zoro!", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", streamUrl: "https://www.youtube.com/embed/MCuqYnzSGok" },
      { id: "4-3", number: 3, title: "Morgan vs. Luffy! Who's This Beautiful Young Lady?", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", streamUrl: "https://www.youtube.com/embed/MCuqYnzSGok" },
    ],
  },
  {
    id: "5",
    title: "Naruto Shippuden",
    thumbnail: "https://cdn.myanimelist.net/images/anime/5/17407.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/5/17407l.jpg",
    genre: ["Action", "Adventure", "Shounen"],
    rating: 8.2,
    year: 2007,
    status: "completed",
    episodes: 500,
    synopsis: "Naruto Uzumaki, a young ninja who seeks recognition from his peers and dreams of becoming the Hokage, the leader of his village.",
    studio: "Studio Pierrot",
    episodeList: [
      { id: "5-1", number: 1, title: "Homecoming", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/5/17407.jpg", streamUrl: "https://www.youtube.com/embed/5QbL4jKv8wo" },
      { id: "5-2", number: 2, title: "The Akatsuki Makes Its Move", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/5/17407.jpg", streamUrl: "https://www.youtube.com/embed/5QbL4jKv8wo" },
    ],
  },
  {
    id: "6",
    title: "Spy x Family",
    thumbnail: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1441/122795l.jpg",
    genre: ["Comedy", "Action", "Slice of Life"],
    rating: 8.5,
    year: 2022,
    status: "ongoing",
    episodes: 37,
    synopsis: "A spy must build a fake family to complete a mission, but his fake daughter is actually a telepath and his fake wife is an assassin — and none of them know each other's secrets.",
    studio: "Wit Studio",
    episodeList: [
      { id: "6-1", number: 1, title: "Operation Strix", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg", streamUrl: "https://www.youtube.com/embed/HoHUtOeVMNI" },
      { id: "6-2", number: 2, title: "Secure a Wife", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg", streamUrl: "https://www.youtube.com/embed/HoHUtOeVMNI" },
    ],
  },
  {
    id: "7",
    title: "Fullmetal Alchemist: Brotherhood",
    thumbnail: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1223/96541l.jpg",
    genre: ["Action", "Adventure", "Drama"],
    rating: 9.1,
    year: 2009,
    status: "completed",
    episodes: 64,
    synopsis: "Two brothers search for a Philosopher's Stone after an attempt to revive their dead mother goes wrong, leaving them in damaged bodies and beginning a journey across a dangerous world.",
    studio: "Bones",
    episodeList: [
      { id: "7-1", number: 1, title: "Fullmetal Alchemist", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg", streamUrl: "https://www.youtube.com/embed/--IcmZkvL0Q" },
      { id: "7-2", number: 2, title: "The First Day", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg", streamUrl: "https://www.youtube.com/embed/--IcmZkvL0Q" },
    ],
  },
  {
    id: "8",
    title: "Hunter x Hunter",
    thumbnail: "https://cdn.myanimelist.net/images/anime/11/33657.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/11/33657l.jpg",
    genre: ["Action", "Adventure", "Fantasy"],
    rating: 9.0,
    year: 2011,
    status: "completed",
    episodes: 148,
    synopsis: "Gon discovers that his father, who he was told was dead, is actually alive and a famous Hunter. He decides to become a Hunter himself and follow in his father's footsteps.",
    studio: "Madhouse",
    episodeList: [
      { id: "8-1", number: 1, title: "Departure x And x Friends", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/11/33657.jpg", streamUrl: "https://www.youtube.com/embed/D9iTQRB4XRk" },
      { id: "8-2", number: 2, title: "Test x Of x Tests", duration: "23:40", thumbnail: "https://cdn.myanimelist.net/images/anime/11/33657.jpg", streamUrl: "https://www.youtube.com/embed/D9iTQRB4XRk" },
    ],
  },
];

export const GENRES = ["All", "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Mystery", "Romance", "Supernatural", "Slice of Life", "Shounen", "Seinen"];

export const TRENDING = ANIME_LIST.slice(0, 5);
export const NEW_RELEASES = [...ANIME_LIST].sort((a, b) => b.year - a.year).slice(0, 6);
export const TOP_RATED = [...ANIME_LIST].sort((a, b) => b.rating - a.rating).slice(0, 6);

export function searchAnime(query: string): Anime[] {
  const q = query.toLowerCase();
  return ANIME_LIST.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.genre.some((g) => g.toLowerCase().includes(q)) ||
      a.studio.toLowerCase().includes(q)
  );
}

export function getAnimeById(id: string): Anime | undefined {
  return ANIME_LIST.find((a) => a.id === id);
}

export function getAnimeByGenre(genre: string): Anime[] {
  if (genre === "All") return ANIME_LIST;
  return ANIME_LIST.filter((a) => a.genre.includes(genre));
}
