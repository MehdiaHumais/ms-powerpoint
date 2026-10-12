import React from "react";
import { usePresentationStore } from "@/stores/presentationStore";
import { ThemeDecor } from "./SlideElements";
import { THEMES } from "./ribbonThemes";

const mixWhite = (hex: string, t: number) => {
  const a = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(v + (255 - v) * t);
  const r = ch((a >> 16) & 255);
  const g = ch((a >> 8) & 255);
  const b = ch(a & 255);
  return `#${(((r << 16) | (g << 8) | b) & 0xffffff).toString(16).padStart(6, "0")}`;
};

/**
 * Slide Master view: shows the placeholder layout every slide inherits from.
 * Edits to the master font sizes and background apply to all slides at once,
 * which is the closest browser-safe equivalent of Office's Slide Master.
 */
export default function SlideMasterView() {
  const themeAccent = usePresentationStore((s) => s.themeAccent);
  const themeDecor = usePresentationStore((s) => s.themeDecor);
  const themeName = usePresentationStore((s) => s.themeName);
  const designFont = usePresentationStore((s) => s.designFont);
  const designTitleColor = usePresentationStore((s) => s.designTitleColor);
  const designBodyColor = usePresentationStore((s) => s.designBodyColor);
  const applyTheme = usePresentationStore((s) => s.applyTheme);
  const applyVariant = usePresentationStore((s) => s.applyVariant);
  const setDesignFont = usePresentationStore((s) => s.setDesignFont);
  const setViewMode = usePresentationStore((s) => s.setViewMode);
  const slideW = usePresentationStore((s) => s.slideW);
  const slideH = usePresentationStore((s) => s.slideH);
  const masterTitle = usePresentationStore((s) => s.masterTitle);
  const masterBody = usePresentationStore((s) => s.masterBody);
  const masterFooter = usePresentationStore((s) => s.masterFooter);
  const setMasterText = usePresentationStore((s) => s.setMasterText);
  const applyBackgroundToAll = usePresentationStore((s) => s.applyBackgroundToAll);
  const slides = usePresentationStore((s) => s.slides);
  const bg = slides[0]?.bg ?? "#ffffff";

  const theme = THEMES.find((t) => t.name === themeName) ?? THEMES[0];

  const editable = (
    part: "title" | "body" | "footer",
    style: React.CSSProperties
  ) => (
    <div
      className="outline-none"
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => setMasterText(part, e.currentTarget.textContent ?? "")}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    >
      {part === "title" ? masterTitle : part === "body" ? masterBody : masterFooter}
    </div>
  );

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-[#f3f3f3]">
      <div className="px-4 py-2 border-b border-gray-300 bg-white flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-800">Slide Master</span>
        <span className="text-xs text-gray-500">
          {themeName} theme · changes here apply to every slide
        </span>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-gray-600">Master font</label>
          <select
            value={designFont}
            onChange={(e) => setDesignFont(e.target.value)}
            className="h-7 border border-gray-300 rounded px-1 text-xs"
          >
            {["Calibri", "Segoe UI", "Arial", "Georgia", "Times New Roman", "Verdana"].map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button
            onClick={() => setViewMode("normal")}
            className="h-7 px-3 rounded bg-[#185abd] text-white text-xs hover:bg-[#134a9e]"
          >
            Close Master View
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div
          className="relative mx-auto shadow border border-gray-300"
          style={{ width: slideW, height: slideH, background: bg }}
        >
          <ThemeDecor accent={themeAccent} decor={themeDecor} />
          <div
            className="absolute"
            style={{ left: 60, top: 150, width: 700, textAlign: "center" }}
          >
            {editable("title", {
              fontFamily: designFont,
              fontSize: 40,
              color: designTitleColor,
            })}
          </div>
          <div
            className="absolute"
            style={{ left: 60, top: 250, width: 700, textAlign: "center" }}
          >
            {editable("body", {
              fontFamily: designFont,
              fontSize: 22,
              color: designBodyColor,
            })}
          </div>
          <div
            className="absolute left-0 bottom-0 w-full h-[7%] flex items-center px-6"
            style={{ background: themeAccent, color: "#fff" }}
          >
            {editable("footer", { fontSize: 12, width: "100%" })}
          </div>
        </div>

        <div className="mx-auto mt-6 flex gap-2" style={{ width: 820 }}>
          {THEMES.map((t) => (
            <button
              key={t.name}
              onClick={() => {
                applyTheme(t);
                applyBackgroundToAll(t.bg);
              }}
              className={`h-9 w-[120px] rounded border text-xs ${
                t.name === themeName
                  ? "border-[#185abd] ring-2 ring-[#185abd]"
                  : "border-gray-300"
              }`}
              style={{ background: t.bg, color: t.title }}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="mx-auto mt-3 flex gap-2 flex-wrap" style={{ width: 820 }}>
          {[
            { name: "Light", tint: 0.08 },
            { name: "Deep", tint: 0.22 },
          ].map((v) => (
            <button
              key={v.name}
              onClick={() => {
                const tinted = mixWhite(theme.accent, v.tint);
                applyVariant(
                  mixWhite(theme.accent, v.tint * 0.6),
                  tinted,
                  mixWhite(theme.title, v.tint),
                  mixWhite(theme.body, v.tint)
                );
                applyBackgroundToAll(tinted);
              }}
              className="h-8 w-[120px] rounded border border-gray-300 text-xs hover:ring-2 ring-[#185abd]"
              style={{ background: mixWhite(theme.accent, v.tint), color: theme.title }}
            >
              {v.name} variant
            </button>
          ))}
        </div>
        <p className="mx-auto mt-4 text-xs text-gray-500" style={{ width: 820 }}>
          {theme.decor === "none" ? "No decoration" : `Decoration: ${theme.decor}`} · font{" "}
          {designFont} · title {designTitleColor} · body {designBodyColor} · background applies
          to all {slides.length} slides
        </p>
      </div>
    </div>
  );
}
