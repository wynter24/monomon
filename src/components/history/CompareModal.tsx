import { Dispatch, SetStateAction } from 'react';
import Portal from '../common/Portal';
import Image from 'next/image';
import { HistoryParsedItem } from '@/types/pokemon';

type CompareModalProps = {
  selected: HistoryParsedItem;
  setShowCompare: Dispatch<SetStateAction<boolean>>;
};

export default function CompareModal({
  selected,
  setShowCompare,
}: CompareModalProps) {
  return (
    <Portal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Compare</h3>
            <button
              type="button"
              onClick={() => setShowCompare(false)}
              className="cursor-pointer rounded-md bg-black px-3 py-1 text-sm text-white"
              aria-label="Close compare"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="mb-2 text-center text-sm font-medium">
                Matched
              </div>
              {selected?.result && (
                <div className="overflow-hidden rounded-md bg-black p-2">
                  <Image
                    src={selected.result.matched_pokemon_image}
                    alt="matched"
                    width={560}
                    height={560}
                    sizes="(max-width: 768px) 100vw, 560px"
                    className="h-auto w-full object-contain"
                    quality={90}
                  />
                </div>
              )}
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="mb-2 text-center text-sm font-medium">
                Original
              </div>
              {selected?.imageUrl && (
                <div className="overflow-hidden rounded-md bg-black p-2">
                  <Image
                    src={selected.imageUrl}
                    alt="original"
                    width={560}
                    height={560}
                    sizes="(max-width: 768px) 100vw, 560px"
                    className="h-auto w-full object-contain"
                    quality={90}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
