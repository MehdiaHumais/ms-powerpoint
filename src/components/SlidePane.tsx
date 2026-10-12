import React, { useRef, useEffect } from "react";
import SlideThumbnail from "./SlideThumbnail";
import { usePresentationStore } from "@/stores/presentationStore";

export default function SlidePane() {
  const slides = usePresentationStore((s) => s.slides);
  const activeIndex = usePresentationStore((s) => s.activeIndex);
  const setActiveSlide = usePresentationStore((s) => s.setActiveSlide);
  const deleteSlide = usePresentationStore((s) => s.deleteSlide);
  const duplicateSlide = usePresentationStore((s) => s.duplicateSlide);
  const addSlide = usePresentationStore((s) => s.addSlide);
  const moveSlide = usePresentationStore((s) => s.moveSlide);
  const setActiveTab = usePresentationStore((s) => s.setActiveTab);

  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div className="w-56 shrink-0 bg-[#eaeaea] border-r border-gray-300 flex flex-col">
      <div className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wide flex items-center justify-between">
        <span>Slides</span>
        <button
          title="Add blank slide"
          onClick={addSlide}
          className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm leading-none"
        >
          +
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
        {slides.map((slide, i) => (
          <div
            ref={i === activeIndex ? activeRef : undefined}
            key={slide.id}
            className="group"
          >
            <div className="relative">
              <SlideThumbnail
                slide={slide}
                number={i + 1}
                active={i === activeIndex}
                onClick={() => {
                  setActiveSlide(i);
                  setActiveTab("Home");
                }}
                onDelete={() => deleteSlide(i)}
              />
            </div>
            <div className="mt-1 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                title="Duplicate slide"
                onClick={() => {
                  setActiveSlide(i);
                  duplicateSlide();
                }}
                className="px-1.5 py-0.5 rounded bg-white border border-gray-300 hover:bg-gray-100 text-[10px] text-gray-700"
              >
                Duplicate
              </button>
              <button
                title="Move up"
                disabled={i === 0}
                onClick={() => moveSlide(i, -1)}
                className="px-1.5 py-0.5 rounded bg-white border border-gray-300 hover:bg-gray-100 text-[10px] text-gray-700 disabled:opacity-40"
              >
                ↑
              </button>
              <button
                title="Move down"
                disabled={i === slides.length - 1}
                onClick={() => moveSlide(i, 1)}
                className="px-1.5 py-0.5 rounded bg-white border border-gray-300 hover:bg-gray-100 text-[10px] text-gray-700 disabled:opacity-40"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-gray-300 flex justify-center">
        <button
          onClick={addSlide}
          className="px-3 py-1.5 rounded text-sm bg-[#185abd] text-white hover:bg-[#1669d9] flex items-center gap-1"
        >
          <span className="text-base leading-none">+</span> New Slide
        </button>
      </div>
    </div>
  );
}