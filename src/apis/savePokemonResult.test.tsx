import type { MatchResult } from '@/types/pokemon';
import { savePokemonResult } from './imageResults.client';

// supabase 클라이언트 모듈을 통채로 mock
jest.mock('@/lib/supabaseBrowser', () => {
  return {
    supabaseBrowser: {
      from: jest.fn(),
    },
  };
});

// 공통 타입
type MaybeSingleResult<T> = { data: T | null; error: any | null };
type MaybeSingleFn<T> = () => Promise<MaybeSingleResult<T>>;
type UpsertResult = { error: any | null };
type UpsertFn = () => Promise<UpsertResult>;

function makeUpsertChain(resolved: UpsertResult) {
  const upsert: jest.MockedFunction<UpsertFn> = jest.fn();
  upsert.mockResolvedValue(resolved);
  return { upsert };
}

function makeFetchChain<T>(resolved: MaybeSingleResult<T>) {
  const maybeSingle: jest.MockedFunction<MaybeSingleFn<T>> = jest.fn();
  maybeSingle.mockResolvedValue(resolved);

  const eq = jest.fn().mockReturnValue({ maybeSingle });
  const select = jest.fn().mockReturnValue({ eq });
  return { select, __leafs: { eq, maybeSingle } };
}

describe('savePokemonResult', () => {
  const { supabaseBrowser } = jest.requireMock('@/lib/supabaseBrowser') as {
    supabaseBrowser: { from: jest.Mock };
  };

  const setNodeEnv = (v?: string) => {
    const env = process.env as Record<string, string | undefined>;
    if (v === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = v;
  };

  const originalNodeEnv = process.env.NODE_ENV;

  const mkMatchResult = (overrides: Partial<MatchResult> = {}): MatchResult => {
    return {
      matched_pokemon_id: overrides.matched_pokemon_id ?? 25,
      matched_pokemon_name: overrides.matched_pokemon_name ?? 'Pikachu',
      matched_pokemon_image:
        overrides.matched_pokemon_image ?? 'https://example.com/pikachu.png',
      similarity_score: overrides.similarity_score ?? 0.87,
      matched_pokemon_description: overrides.matched_pokemon_description ?? '',
      matched_pokemon_genus: overrides.matched_pokemon_genus ?? '',
    };
  };

  const etag = 'etag-123';
  const matchResult: MatchResult = mkMatchResult();

  beforeEach(() => {
    jest.resetAllMocks();
    setNodeEnv('test'); // 기본은 test
  });

  afterAll(() => {
    setNodeEnv(originalNodeEnv); // 원복 (undefined면 삭제)
  });

  test('정상 upsert 후 재조회 결과를 반환', async () => {
    const upsertChain = makeUpsertChain({ error: null });
    const fetchChain = makeFetchChain<{
      share_id: string;
      result: MatchResult;
    }>({
      data: { share_id: 'share-abc', result: matchResult },
      error: null,
    });

    supabaseBrowser.from
      .mockImplementationOnce(() => upsertChain) // upsert
      .mockImplementationOnce(() => fetchChain); // fetch

    const out = await savePokemonResult(etag, matchResult);

    // 반환값 검증
    expect(out).toEqual({ result: matchResult, id: 'share-abc' });

    // upsert 페이로드 검증
    expect(upsertChain.upsert).toHaveBeenCalledWith(
      {
        image_hash: etag,
        result: matchResult,
        matched_id: matchResult.matched_pokemon_id,
      },
      { onConflict: 'image_hash', ignoreDuplicates: true },
    );

    // 재조회가 image_hash 기준으로 수행되었는지
    expect(fetchChain.__leafs.eq).toHaveBeenCalledWith('image_hash', etag);
  });

  test('upsert가 데이터 없이 끝나면(충돌) 재조회 결과를 반환', async () => {
    const upsertChain = makeUpsertChain({ error: null });
    // 기존에 존재하는 데이터 설정
    const existing = {
      share_id: 'share-exist',
      result: mkMatchResult({ similarity_score: 0.9 }),
    };
    const fetchChain = makeFetchChain<typeof existing>({
      data: existing,
      error: null,
    });

    supabaseBrowser.from
      .mockImplementationOnce(() => upsertChain) // upsert: data가 null -> DO NOTHING -> 기존 데이터 유지(0.9)
      .mockImplementationOnce(() => fetchChain); // 재조회

    const out = await savePokemonResult(etag, matchResult);

    expect(out).toEqual({
      result: existing.result,
      id: 'share-exist',
    });
    expect(out.result).not.toEqual(matchResult);

    // 재조회가 image_hash 기준으로 수행되었는지
    expect(fetchChain.__leafs.eq).toHaveBeenCalledWith('image_hash', etag);
  });

  test('upsert 에러일 때 개발환경이면 로깅하고 재조회로 이어짐', async () => {
    setNodeEnv('development');

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const upsertChain = makeUpsertChain({ error: new Error('upsert failed') });
    const existing = {
      share_id: 'share-after-error',
      result: matchResult,
    };
    const fetchChain = makeFetchChain<typeof existing>({
      data: existing,
      error: null,
    });

    supabaseBrowser.from
      .mockImplementationOnce(() => upsertChain) // 에러나는 upsert
      .mockImplementationOnce(() => fetchChain); // 재조회

    const out = await savePokemonResult(etag, matchResult);

    expect(consoleSpy).toHaveBeenCalledWith(
      'image_results upsert failed:',
      'upsert failed',
    );
    expect(out).toEqual({ result: matchResult, id: 'share-after-error' });

    consoleSpy.mockRestore();
  });

  test('재조회도 에러면 개발환경 로깅 + id:null 반환', async () => {
    setNodeEnv('development');

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const upsertChain = makeUpsertChain({ error: null });
    const fetchChain = makeFetchChain<{ share_id: string; result: any }>({
      data: null,
      error: new Error('fetch failed'),
    });

    supabaseBrowser.from
      .mockImplementationOnce(() => upsertChain)
      .mockImplementationOnce(() => fetchChain);

    const out = await savePokemonResult(etag, matchResult);

    expect(consoleSpy).toHaveBeenCalledWith(
      'image_results fetch failed:',
      'fetch failed',
    );
    expect(out).toEqual({ result: matchResult, id: null });

    consoleSpy.mockRestore();
  });
});
