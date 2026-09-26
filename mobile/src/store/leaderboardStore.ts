import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'bingo:leaderboard';
const MAX_ENTRIES = 50;

export interface LeaderboardEntry {
  name: string;
  score: number;
  mode: 'Computer' | 'Solo' | 'Online';
  date: string; // ISO string
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  loaded: boolean;
  load: () => Promise<void>;
  addEntry: (entry: Omit<LeaderboardEntry, 'date'>) => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: [],
  loaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      set({ entries: raw ? JSON.parse(raw) : [], loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  addEntry: (entry) => {
    const next = [...get().entries, { ...entry, date: new Date().toISOString() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
    set({ entries: next });
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  },
}));
