export default function CaptureTips() {
  return (
    <section aria-labelledby="upload-tips-heading">
      <h2
        id="upload-tips-heading"
        className="mb-3 text-xs font-medium tracking-wide text-gray-500 sm:text-sm"
      >
        How to get the best match
      </h2>
      <ol className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">
        <li className="flex items-center gap-3 rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-700 sm:text-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
            1
          </span>
          Use bright, even lighting on your face
        </li>
        <li className="flex items-center gap-3 rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-700 sm:text-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
            2
          </span>
          Keep the camera at eye level, facing forward
        </li>
        <li className="flex items-center gap-3 rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-700 sm:text-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
            3
          </span>
          Minimize background distractions
        </li>
      </ol>
    </section>
  );
}
