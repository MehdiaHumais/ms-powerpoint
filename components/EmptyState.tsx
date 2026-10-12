export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-800 p-12 shadow-xl">
      <svg
        className="h-16 w-16 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6M9 16h6M9 8h6M5 12h.M5 16h.M5 8h."
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-300">No presentations yet</h3>
      <p className="mt-2 text-sm text-gray-500">
        Click the “Create New Presentation” button above to get started.
      </p>
    </div>
  );
}