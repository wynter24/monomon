import { HistoryParsedItem } from '@/types/pokemon';
import { Dispatch, SetStateAction, useState } from 'react';

type HistoryListPros = {
  parsed: HistoryParsedItem[];
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  selectedIndex: number;
};

export default function HistoryList({
  parsed,
  setSelectedIndex,
  selectedIndex,
}: HistoryListPros) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(parsed.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageItems = parsed.slice(pageStart, pageStart + pageSize);

  const goPrevPage = () => setPage((p) => (p > 1 ? p - 1 : p));
  const goNextPage = () => setPage((p) => (p < totalPages ? p + 1 : p));

  return (
    <aside className="flex w-full max-w-sm flex-col justify-between rounded-2xl bg-red-600 p-5 text-white shadow-xl ring-1 ring-red-700/40">
      <div>
        <div className="mb-4 text-center text-sm text-gray-100">History</div>
        <ul className="grid grid-cols-1 gap-3">
          {pageItems.map((item, idx) => {
            const absoluteIndex = pageStart + idx;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(absoluteIndex)}
                  className={`flex w-full items-center gap-3 rounded-lg bg-red-700/40 p-3 text-left ring-1 ring-red-800/40 transition hover:bg-red-700/60 ${
                    absoluteIndex === selectedIndex
                      ? 'outline outline-yellow-300'
                      : ''
                  }`}
                  aria-current={absoluteIndex === selectedIndex}
                >
                  <div className="h-12 w-12 overflow-hidden rounded-md bg-black">
                    {item.result?.matched_pokemon_image && (
                      <img
                        src={item.result.matched_pokemon_image}
                        alt="thumb"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold capitalize">
                      {item.result?.matched_pokemon_name ?? 'Unknown'}
                    </span>
                    <span className="truncate text-xs text-gray-200">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : ''}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Pagination controls (Pokedex style) */}
      <div className="my-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevPage}
          className="h-10 w-16 rounded-md bg-black text-white shadow-inner ring-1 ring-white/10 transition hover:bg-black/90"
          aria-label="Previous page"
        >
          ◀
        </button>
        <div className="rounded-md bg-black/70 px-3 py-1 text-sm text-gray-100">
          {page} / {totalPages}
        </div>
        <button
          type="button"
          onClick={goNextPage}
          className="h-10 w-16 rounded-md bg-black text-white shadow-inner ring-1 ring-white/10 transition hover:bg-black/90"
          aria-label="Next page"
        >
          ▶
        </button>
      </div>
    </aside>
  );
}
