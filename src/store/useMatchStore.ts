import { create } from 'zustand';

type MatchState = {
  uploadedImgUrl: string | null;
  etag: string | null;
  setImgUrl: (url: string) => void;
  setEtag: (hash: string) => void;
  clearMatch: () => void;
};

export const useMatchStore = create<MatchState>((set) => ({
  uploadedImgUrl: null,
  etag: null,
  setImgUrl: (url) => set({ uploadedImgUrl: url }),
  setEtag: (hash) => set({ etag: hash }),
  clearMatch: () => set({ uploadedImgUrl: null, etag: null }),
}));
