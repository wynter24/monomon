import { create } from 'zustand';

export type MatchResult = {
  matched_pokemon_id: number;
  matched_pokemon_name: string;
  matched_pokemon_image: string;
  similarity_score: number;
};

type MatchState = {
  uploadedImgUrl: string | null;
  etag: string | null;
  result: MatchResult | null;
  setImgUrl: (url: string) => void;
  setEtag: (hash: string) => void;
  setMatchResult: (pokemon: MatchResult) => void;
  clearMatch: () => void;
};

export const useMatchStore = create<MatchState>((set) => ({
  uploadedImgUrl: null,
  etag: null,
  result: null,
  setImgUrl: (url) => set({ uploadedImgUrl: url }),
  setEtag: (hash) => set({ etag: hash }),
  setMatchResult: (result) => set({ result }),
  clearMatch: () => set({ uploadedImgUrl: null, etag: null, result: null }),
}));
