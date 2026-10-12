import React from "react";
import { usePresentationStore } from "@/stores/presentationStore";
import SlideElements, { SlideTextLayer, ThemeDecor } from "./SlideElements";

export default function ReadingView() {
  const slides = usePresentationStore((s) => s.slides);
  const activeIndex = usePresentationStore((s) => s.activeIndex);
  const setActiveSlide = usePresentationStore((s) => s.setActiveSlide);
const themeAccent = usePresentationStore((s) => s.themeAccent);
  const themeDecor = usePresentationStore((s) => s.themeDecor);
  const setViewMode = usePresentationStore((s) => s.setViewMode);
  const slideW = usePresentationStore((s) => s.slideW);
  const slideH = usePresentationStore((s) => s.slideH);

  const slide = slides[activeIndex];

  return (
    <div className="flex-1 min-h-0 overflow-auto bg-[#404040]">
      <div className="min-h-full flex items-center justify-center p-8">
        {slide ? (
          <div className="bg-white shadow-2xl border border-gray-300 select-none">
            <div className="relative overflow-hidden" style={{ width: slideW, height: slideH }}>
              <div
                className="absolute inset-0"
                style={
                  slide.bgStyle === "gradient"
                    ? { backgroundImage: `linear-gradient(135deg, ${slide.bg} 0%, #ffffff 100%)` }
                    : { backgroundColor: slide.bg, opacity: slide.bg === "#ffffff" ? 1 : 0.25 }
                }
              />
              <ThemeDecor accent={themeAccent} decor={themeDecor} />
              <SlideTextLayer slide={slide} editable={false} />
              <SlideElements slide={slide} selectedId={null} interactive={false} />
            </div>
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 text-xs text-gray-600">
              <button
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
                disabled={activeIndex === 0}
                onClick={() => setActiveSlide(activeIndex - 1)}
              >
                Previous
              </button>
              <span>
                Slide {activeIndex + 1} of {slides.length}
              </span>
              <button
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
                disabled={activeIndex === slides.length - 1}
                onClick={() => setActiveSlide(activeIndex + 1)}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <button
            className="px-4 py-2 rounded bg-[#185abd] text-white text-sm"
            onClick={() => usePresentationStore.getState().addSlide()}
          >
            Add a slide to get started
          </button>
        )}
      </div>
      <div className="fixed bottom-12 right-4 text-white/60 text-xs">
        <button onClick={() => setViewMode("normal")}>Exit reading view</button>
      </div>
    </div>
  );
}