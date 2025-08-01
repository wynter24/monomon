export type MatchResult = {
  matched_pokemon_id: number;
  matched_pokemon_name: string;
  matched_pokemon_image: string;
  similarity_score: number;
};

export type ImageLoadingProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
};
