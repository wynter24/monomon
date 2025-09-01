import axios from 'axios';

type Flavor = {
  flavor_text: string;
  language: { name: string };
  version: { name: string };
};
type Genus = { genus: string; language: { name: string } };

const clean = (s: string) =>
  s
    .replace(/[\n\f]/g, ' ')
    .replace(/\u00AD/g, '')
    .trim();

export async function getPokemonInfo(id: string | number) {
  const { data } = await axios.get<{
    flavor_text_entries: Flavor[];
    genera: Genus[];
  }>(`https://pokeapi.co/api/v2/pokemon-species/${id}`);

  // 영어만 필터
  const en = data.flavor_text_entries.filter((f) => f.language.name === 'en');

  // 원하는 버전 우선순위
  const preferred = [
    'scarlet',
    'violet',
    'legends-arceus',
    'sword',
    'shield',
    'ultra-sun',
    'ultra-moon',
    'sun',
    'moon',
  ];
  const pick =
    en.find((f) => preferred.includes(f.version?.name ?? '')) ?? // 선호 버전 우선
    en.at(-1) ?? // 없으면 가장 마지막(대개 최신)
    null;

  const text = clean(pick?.flavor_text ?? '');

  // 종 카테고리 ("Seed Pokémon")
  const genus =
    data.genera.find((g) => g.language.name === 'en')?.genus ?? null;

  return { text, genus };
}
