import { create } from 'zustand';

type MatchState = {
  imgUrl: string | null;
  matchPokemon: string | null;
  setImgUrl: (url: string) => void;
  setMatchResult: (pokemon: string, imgUrl: string) => void;
  clearMatch: () => void;
};

export const useMatchStore = create<MatchState>((set) => ({
  imgUrl: null,
  matchPokemon: null,
  setImgUrl: (url) => set({ imgUrl: url }),
  setMatchResult: (pokemon) => set({ matchPokemon: pokemon }),
  clearMatch: () => set({ matchPokemon: null, imgUrl: null }),
}));
