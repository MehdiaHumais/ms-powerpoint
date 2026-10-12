import React from "react";
import type { SlideData } from "@/stores/presentationStore";
import { transitionName } from "@/utils/transitions";
import { stripHtml } from "@/utils/html";

export default function SlideThumbnail({
  slide,
  number,
  active,
  onClick,
  onDelete,
}: {
  slide: SlideData;
  number: number;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`block w-44 aspect-video bg-white border text-left p-2 rounded-sm shadow-sm transition ${
          active
            ? "border-blue-600 ring-2 ring-blue-500"
            : "border-gray-400 hover:border-gray-500"
        }`}
      >
        <span className="absolute top-1 left-1 text-[10px] text-gray-500 bg-white/80 px-1 rounded">
          {number}
        </span>
        <div className="w-full h-full flex flex-col overflow-hidden text-[8px] leading-snug pt-1">
          {stripHtml(slide.title) ? (
            <span className="font-semibold text-gray-800 line-clamp-1">
              {stripHtml(slide.title)}
            </span>
          ) : (
            <span className="text-gray-400">Click to add title</span>
          )}
          <div className="mt-1 whitespace-pre-wrap text-gray-700 line-clamp-3 flex-1">
            {stripHtml(slide.content)}
          </div>
        </div>
        {slide.transition !== "none" && (
          <span
            title={`Transition: ${transitionName(slide.transition)}`}
            className="absolute bottom-1 left-1 flex items-center gap-0.5 text-[9px] text-[#185abd] bg-[#d5e3f7] rounded px-1 py-[1px]"
          >
            <svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            {transitionName(slide.transition)}
          </span>
        )}
        {slide.transitionSound && slide.transitionSound !== "applause" && (
          <span
            title="Plays a sound"
            className="absolute bottom-1 right-1 text-[9px] text-gray-500 bg-white/85 rounded px-0.5"
          >
            &#9835;
          </span>
        )}
      </button>
      <button
        onClick={onDelete}
        title="Delete slide"
        className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-5 h-5 rounded bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600 text-xs"
      >
        ×
      </button>
    </div>
  );
}