import React from "react";
import { usePresentationStore } from "@/stores/presentationStore";
import SlideElements, { SlideTextLayer, ThemeDecor } from "./SlideElements";

export default function SlideSorter() {
  const slides = usePresentationStore((s) => s.slides);
  const activeIndex = usePresentationStore((s) => s.activeIndex);
  const setActiveSlide = usePresentationStore((s) => s.setActiveSlide);
const themeAccent = usePresentationStore((s) => s.themeAccent);
  const themeDecor = usePresentationStore((s) => s.themeDecor);
  const setViewMode = usePresentationStore((s) => s.setViewMode);
  const slideW = usePresentationStore((s) => s.slideW);
  const slideH = usePresentationStore((s) => s.slideH);

  return (
    <div className="flex-1 overflow-auto bg-[#eaeaea] p-6">
      <div className="flex flex-wrap justify-center gap-5">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => {
              setActiveSlide(i);
              setViewMode("normal");
            }}
            className={`w-56 aspect-video bg-white border relative shadow-sm rounded-sm overflow-hidden text-left ${
              i === activeIndex ? "border-[#185abd] ring-2 ring-[#185abd]" : "border-gray-400 hover:border-gray-500"
            }`}
          >
            <span className="absolute top-1 left-1 z-10 text-[10px] text-gray-500 bg-white/80 px-1 rounded">
              {i + 1}
            </span>
<div style={{ zoom: 0.24 }}>
              <div className="relative" style={{ width: slideW, height: slideH }}>
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
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}