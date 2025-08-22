import { renderHook, act, waitFor } from '@testing-library/react';
import { makeQueryClientWrapper } from '@/test/test-utils';
import { useUploadMutation } from './useUploadMutation';
import { toast } from 'sonner';

const mockMatchPokemon = jest.fn();
jest.mock('@/api/matchPokemon', () => ({
  matchPokemon: (...args: any[]) => mockMatchPokemon(...args),
}));

const mockSavePokemonResult = jest.fn();
jest.mock('@/api/savePokemonResult', () => ({
  savePokemonResult: (...args: any[]) => mockSavePokemonResult(...args),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useUploadMutation', () => {
  it('성공: match → save → /result/:id 라우팅', async () => {
    const { Wrapper } = makeQueryClientWrapper();

    // given
    const uploadedImgUrl = 'https://example.com/me.png';
    const etag = 'etag-123';
    const analysis = { name: 'Pikachu', matched: 87 };
    const saved = { id: 'share-abc' };

    mockMatchPokemon.mockResolvedValueOnce(analysis);
    mockSavePokemonResult.mockResolvedValueOnce(saved);

    const { result } = renderHook(() => useUploadMutation(), {
      wrapper: Wrapper,
    });

    // when
    await act(async () => {
      await result.current.mutateAsync({ uploadedImgUrl, etag });
    });

    // then
    expect(mockMatchPokemon).toHaveBeenCalledWith(uploadedImgUrl);
    expect(mockSavePokemonResult).toHaveBeenCalledWith(etag, analysis);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/result/${saved.id}`);
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('실패: 어느 단계에서든 에러면 toast.error 호출, 라우팅 없음', async () => {
    const { Wrapper } = makeQueryClientWrapper();

    // given
    const uploadedImgUrl = 'https://example.com/me.png';
    const etag = 'etag-err';
    mockMatchPokemon.mockRejectedValueOnce(new Error('network fail'));

    const { result } = renderHook(() => useUploadMutation(), {
      wrapper: Wrapper,
    });

    // when
    await expect(
      result.current.mutateAsync({ uploadedImgUrl, etag }),
    ).rejects.toThrow();

    // then
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockSavePokemonResult).not.toHaveBeenCalled();
  });
});
