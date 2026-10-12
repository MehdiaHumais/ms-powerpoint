import React, { useEffect, useRef, useState } from "react";
import { AppLogo, SaveIcon, UndoIcon, RedoIcon, FindIcon } from "./icons";
import { usePresentationStore } from "@/stores/presentationStore";
import { ribbonUndo, ribbonRedo } from "@/utils/editorCommands";
import { saveBritslide, FILENAME, isDesktopApp } from "@/utils/britfile";

export default function PptTitleBar() {
  const slides = usePresentationStore((s) => s.slides);
  const [saved, setSaved] = useState<"saved" | "saving" | "unsaved">("saved");
  const [query, setQuery] = useState("");
  const lastRef = useRef(slides);

  useEffect(() => {
    if (lastRef.current === slides) return;
    lastRef.current = slides;
    setSaved("unsaved");
    const t = window.setTimeout(() => setSaved("saved"), 900);
    return () => window.clearTimeout(t);
  }, [slides]);

  const winBtn = (action: "min" | "max" | "close") => {
    if (isDesktopApp()) {
      import("@tauri-apps/api/window")
        .then(({ appWindow }) => {
          if (action === "min") appWindow.minimize();
          else if (action === "max") appWindow.toggleMaximize();
          else appWindow.close();
        })
        .catch(() => undefined);
    } else if (action === "close") {
      window.close();
    }
  };

  const save = async () => {
    const ok = await saveBritslide(
      slides,
      FILENAME,
      usePresentationStore.getState().comments
    );
    if (ok) setSaved("saved");
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-[#f3f2f1] border-b border-gray-300 h-12 px-3 select-none">
      <div className="flex items-center gap-2 min-w-0">
        <AppLogo size={22} />
        <div className="leading-tight min-w-0">
          <span className="block text-sm font-semibold text-gray-800">BritSlide</span>
          <span className="block text-[10px] text-gray-500 truncate max-w-[140px]">
            {FILENAME} {saved === "saved" ? "· Saved" : "· Unsaved"}
          </span>
        </div>
        <div className="flex items-center gap-0.5 ml-1">
          <button title="Save (Ctrl+S)" onClick={save} className="p-1.5 rounded hover:bg-gray-200 text-gray-700">
            <SaveIcon size={16} />
          </button>
          <button title="Undo (Ctrl+Z)" onClick={ribbonUndo} className="p-1.5 rounded hover:bg-gray-200 text-gray-700">
            <UndoIcon size={16} />
          </button>
          <button title="Redo (Ctrl+Y)" onClick={ribbonRedo} className="p-1.5 rounded hover:bg-gray-200 text-gray-700">
            <RedoIcon size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-[460px] flex justify-center">
        <div className="flex items-center w-full max-w-[420px] h-8 bg-white border border-gray-300 rounded px-2 gap-1.5 focus-within:border-blue-500">
          <FindIcon size={14} className="text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shapes, commands, and more…"
            className="flex-1 bg-transparent outline-none text-[13px] text-gray-700 placeholder:text-gray-400"
          />
          <span className="text-[10px] text-gray-400 border border-gray-300 rounded px-1">/</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          className="px-3 py-1 h-7 rounded bg-[#185abd] hover:bg-[#1669d9] text-sm text-white flex items-center gap-1 font-medium"
          onClick={() =>
            navigator.clipboard?.writeText(window.location.href).catch(() => undefined)
          }
        >
          Share
        </button>
        <div
          className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e8763e] to-[#c13b3b] text-white flex items-center justify-center text-[11px] font-semibold"
          title="User profile"
        >
          U
        </div>
        <div className="flex items-center gap-0.5 ml-1">
          <button title="Minimize" onClick={() => winBtn("min")} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600">
            <span className="block w-2.5 h-px bg-gray-600" />
          </button>
          <button title="Maximize" onClick={() => winBtn("max")} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600">
            <span className="block w-2.5 h-2.5 border border-gray-600 rounded-[1px]" />
          </button>
          <button
            title="Close"
            onClick={() => winBtn("close")}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500 hover:text-white text-gray-600"
          >
            <span className="block w-2.5 h-px bg-current" />
          </button>
        </div>
      </div>
    </div>
  );
}