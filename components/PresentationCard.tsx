"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Presentation = {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
};

export default function PresentationCard({
  presentation,
}: {
  presentation: Presentation;
}) {
  const router = useRouter();

  const handleOpen = () => {
    router.push(`/presentations/${presentation.id}`);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl bg-gray-800 p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-2xl">
      <h2 className="text-lg font-semibold text-white">{presentation.title}</h2>
      <p className="mt-2 flex-1 text-sm text-gray-400">{presentation.description}</p>
      <p className="mt-4 text-xs text-gray-500">
        Updated {new Date(presentation.updatedAt).toLocaleDateString()}
      </p>
      <button
        onClick={handleOpen}
        className="mt-4 self-start rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:from-indigo-600 hover:to-purple-600"
      >
        Open
      </button>
    </div>
  );
}