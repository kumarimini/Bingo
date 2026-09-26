import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NAME_KEY = 'bingo:playerName';
const SOUND_KEY = 'bingo:soundEnabled';
const DEFAULT_NAME = 'Player';

interface SettingsState {
  name: string;
  soundEnabled: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setName: (name: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  name: DEFAULT_NAME,
  soundEnabled: true,
  loaded: false,

  load: async () => {
    try {
      const [storedName, storedSound] = await Promise.all([
        AsyncStorage.getItem(NAME_KEY),
        AsyncStorage.getItem(SOUND_KEY),
      ]);
      set({
        name: storedName?.trim() || DEFAULT_NAME,
        soundEnabled: storedSound === null ? true : storedSound === 'true',
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  setName: (name: string) => {
    const trimmed = name.trim() || DEFAULT_NAME;
    set({ name: trimmed });
    AsyncStorage.setItem(NAME_KEY, trimmed).catch(() => {});
  },

  setSoundEnabled: (enabled: boolean) => {
    set({ soundEnabled: enabled });
    AsyncStorage.setItem(SOUND_KEY, String(enabled)).catch(() => {});
  },
}));
