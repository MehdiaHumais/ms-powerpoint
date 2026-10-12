"use client";

import type { Slide } from "@/types/slide";

export default function SlideCard({ slide }: { slide: Slide }) {
  return (
    <div className="bg-cardBg rounded-2xl shadow-card p-6 transition transform hover:-translate-y-1 hover:shadow-lg">
      <h2 className="text-xl font-semibold mb-2">{slide.title ?? "Untitled"}</h2>
      <p className="whitespace-pre-line text-muted">{slide.content}</p>
    </div>
  );
}