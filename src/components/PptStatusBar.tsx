import React from "react";
import { usePresentationStore } from "@/stores/presentationStore";
import { FontSizeDecIcon, FontSizeIncIcon, ShapesGalleryIcon, LayoutIcon, CopyIcon } from "./icons";

export default function PptStatusBar() {
  const slides = usePresentationStore((s) => s.slides);
  const activeIndex = usePresentationStore((s) => s.activeIndex);
  const zoom = usePresentationStore((s) => s.zoom);
  const viewMode = usePresentationStore((s) => s.viewMode);
  const setViewMode = usePresentationStore((s) => s.setViewMode);
  const zoomIn = usePresentationStore((s) => s.zoomIn);
  const zoomOut = usePresentationStore((s) => s.zoomOut);
  const setZoom = usePresentationStore((s) => s.setZoom);
  const slide = slides[activeIndex];

  return (
    <div className="flex items-center justify-between bg-[#f3f2f1] border-t border-gray-300 h-8 px-3 text-xs text-gray-700 select-none">
      <div className="flex items-center gap-3">
        <span>
          Slide {activeIndex + 1} of {slides.length}
        </span>
        <span className="text-gray-500">English (United States)</span>
        <button
          className="px-1.5 py-0.5 rounded hover:bg-gray-200 text-gray-600"
          title="Speaker notes"
          onClick={() => document.querySelector<HTMLElement>("[data-notes-area]")?.focus()}
        >
          Notes
          {slide?.notes ? <span className="ml-1 text-blue-600">●</span> : null}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          className={`p-1 rounded hover:bg-gray-200 ${viewMode === "normal" ? "text-blue-600" : ""}`}
          title="Normal view"
          onClick={() => setViewMode("normal")}
        >
          <ShapesGalleryIcon size={16} />
        </button>
        <button
          className={`p-1 rounded hover:bg-gray-200 ${viewMode === "sorter" ? "text-blue-600" : ""}`}
          title="Slide sorter"
          onClick={() => setViewMode("sorter")}
        >
          <CopyIcon size={16} />
        </button>
        <button
          className={`p-1 rounded hover:bg-gray-200 ${viewMode === "reading" ? "text-blue-600" : ""}`}
          title="Reading view"
          onClick={() => setViewMode("reading")}
        >
          <LayoutIcon size={16} />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button className="p-1 rounded hover:bg-gray-200" title="Zoom out" onClick={zoomOut}>
          <FontSizeDecIcon size={16} />
        </button>
        <input
          type="range"
          min={0.4}
          max={2}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="accent-[#185abd] w-28"
          title="Zoom"
        />
        <span title="Zoom" className="w-[44px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button className="p-1 rounded hover:bg-gray-200" title="Zoom in" onClick={zoomIn}>
          <FontSizeIncIcon size={16} />
        </button>
        <button
          className="px-2 py-0.5 rounded hover:bg-gray-200 text-gray-600"
          title="Fit slide to window"
          onClick={() => setZoom(1)}
        >
          Fit
        </button>
      </div>
    </div>
  );
}