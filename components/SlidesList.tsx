"use client";

import { useEffect, useState } from "react";
import SlideCard from "./SlideCard";
import type { Slide } from "@/app/api/slides/route";

export default function SlidesList() {
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/slides")
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: Slide[]) => {
        setSlides(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-xl shadow-card">
        <p className="font-medium">Failed to load slides: {error}</p>
      </div>
    );
  }

  if (slides && slides.length === 0) {
    return (
      <div className="text-muted text-center py-20">
        <p>No slides available.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {slides?.map((slide) => (
        <SlideCard key={slide.id} slide={slide} />
      ))}
    </div>
  );
}