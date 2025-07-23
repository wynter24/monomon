import { create } from 'zustand';

export type MatchResult = {
  matched_pokemon_id: number;
  matched_pokemon_name: string;
  matched_pokemon_image: string;
  similarity_score: number;
};

type MatchState = {
  imgUrl: string | null;
  result: MatchResult | null;
  setImgUrl: (url: string) => void;
  setMatchResult: (pokemon: MatchResult) => void;
  clearMatch: () => void;
};

export const useMatchStore = create<MatchState>((set) => ({
  imgUrl: null,
  result: null,
  setImgUrl: (url) => set({ imgUrl: url }),
  setMatchResult: (result) => set({ result }),
  clearMatch: () => set({ imgUrl: null, result: null }),
}));
