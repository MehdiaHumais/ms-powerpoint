export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-indigo-500" />
        <p className="text-gray-400">Loading presentations…</p>
      </div>
    </div>
  );
}