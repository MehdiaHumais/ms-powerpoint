"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-center">
      <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
      <p className="mt-2 text-gray-300">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
      >
        Try again
      </button>
    </div>
  );
}