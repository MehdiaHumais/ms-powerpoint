import React, { useState } from "react";
import { usePresentationStore } from "@/stores/presentationStore";
import { saveBritslide, getRecent, persistAutosave, FILENAME } from "@/utils/britfile";
import { THEMES } from "./ribbonThemes";
import { stripHtml } from "@/utils/html";

type PageId =
  | "info"
  | "new"
  | "open"
  | "save"
  | "saveAs"
  | "print"
  | "export"
  | "options"
  | "close";

const PAGES: { id: PageId; label: string; icon: string }[] = [
  { id: "info", label: "Info", icon: "i" },
  { id: "new", label: "New", icon: "+" },
  { id: "open", label: "Open", icon: "\uD83D\uDCC2" },
  { id: "save", label: "Save", icon: "\uD83D\uDCBE" },
  { id: "saveAs", label: "Save As", icon: "\uD83D\uDCBE" },
  { id: "print", label: "Print", icon: "\uD83D\uDCC4" },
  { id: "export", label: "Export", icon: "\uD83D\uDDA8" },
  { id: "options", label: "Options", icon: "\u2699\uFE0F" },
  { id: "close", label: "Close", icon: "\u2715" },
];

/**
 * Office-style File backstage. Replaces the ribbon while open and closes with
 * Escape or the back arrow, matching PowerPoint's File menu behaviour.
 */
export default function FileBackstage({
  onClose,
  onOpen,
  onNew,
  onExportPdf,
  onPrint,
  onToast,
}: {
  onClose: () => void;
  onOpen: () => void;
  onNew: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  onToast: (msg: string) => void;
}) {
  const [page, setPage] = useState<PageId>("info");
  const [name, setName] = useState(FILENAME);
  const slides = usePresentationStore((s) => s.slides);
  const activeIndex = usePresentationStore((s) => s.activeIndex);
  const themeName = usePresentationStore((s) => s.themeName);
  const designFont = usePresentationStore((s) => s.designFont);
  const comments = usePresentationStore((s) => s.comments);
  const commentsEnabled = usePresentationStore((s) => s.commentsEnabled);
  const setCommentsEnabled = usePresentationStore((s) => s.setComments);
  const showRuler = usePresentationStore((s) => s.showRuler);
  const showGridlines = usePresentationStore((s) => s.showGridlines);
  const slideW = usePresentationStore((s) => s.slideW);
  const slideH = usePresentationStore((s) => s.slideH);
  const setShowRuler = usePresentationStore((s) => s.setShowRuler);
  const setShowGridlines = usePresentationStore((s) => s.setShowGridlines);
  const setDesignFont = usePresentationStore((s) => s.setDesignFont);
  const applyTheme = usePresentationStore((s) => s.applyTheme);
  const applyBackgroundToAll = usePresentationStore((s) => s.applyBackgroundToAll);
  const addSlide = usePresentationStore((s) => s.addSlide);

  const words = slides.reduce(
    (n, s) =>
      n +
      stripHtml(s.title).split(/\s+/).filter(Boolean).length +
      stripHtml(s.content).split(/\s+/).filter(Boolean).length +
      stripHtml(s.contentRight).split(/\s+/).filter(Boolean).length,
    0
  );
  const shapes = slides.reduce((n, s) => n + s.elements.length, 0);
  const media = slides.reduce(
    (n, s) =>
      n + s.elements.filter((e) => e.kind === "audio" || e.kind === "video").length,
    0
  );
  const recent = getRecent();

  const saveAs = async () => {
    const file = name.trim() ? name.trim() : FILENAME;
    const final = file.toLowerCase().endsWith(".britslide")
      ? file
      : `${file}.britslide`;
    const ok = await saveBritslide(slides, final, comments, true);
    if (ok) {
      setName(final);
      onToast(`Saved as ${final}`);
    }
  };

  const body = () => {
    switch (page) {
      case "info":
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{FILENAME}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Offline PowerPoint clone · stored as a <code>.britslide</code> JSON file
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Slides", String(slides.length)],
                ["Words", String(words)],
                ["Shapes and objects", String(shapes)],
                ["Embedded media", String(media)],
                ["Comments", String(comments.length)],
                ["Transitioned slides", String(slides.filter((s) => s.transition !== "none").length)],
                ["Animated slides", String(slides.filter((s) => s.animation !== "none" || s.elements.some((e) => e.animation)).length)],
                ["Current slide", `${activeIndex + 1} of ${slides.length}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border border-gray-200 rounded px-3 py-2">
                  <span className="text-gray-600">{k}</span>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <div className="border border-gray-200 rounded p-3 text-sm text-gray-700 space-y-1">
              <div className="font-semibold">Protect Presentation</div>
              <div className="text-xs text-gray-500">
                Mark as final, encrypt, or restrict editing require services this offline clone
                cannot provide. Use File › Save As to keep a copy instead.
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Theme: {themeName} · Font: {designFont}
            </div>
          </div>
        );

      case "new":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">New Presentation</h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onNew();
                  onClose();
                }}
                className="w-40 h-40 border-2 border-[#185abd] rounded bg-white flex flex-col items-center justify-center gap-2 text-sm text-gray-800 hover:bg-[#eaf0fb]"
              >
                <span className="w-16 h-11 border border-gray-400 bg-white shadow-sm" />
                Blank Presentation
              </button>
              <button
                onClick={() => {
                  addSlide();
                  onToast("Added a slide to the current presentation");
                }}
                className="w-40 h-40 border border-gray-200 rounded bg-white flex flex-col items-center justify-center gap-2 text-sm text-gray-800 hover:bg-[#eaf0fb]"
              >
                <span className="w-16 h-11 border border-gray-400 bg-[#4472c4]/20 shadow-sm" />
                New Slide From Current
              </button>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800 mb-2">From a theme</div>
              <div className="flex gap-2 flex-wrap">
                {THEMES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => {
                      applyTheme(t);
                      applyBackgroundToAll(t.bg);
                      onToast(`${t.name} theme applied to all slides`);
                    }}
                    className="h-9 w-[124px] rounded border text-xs"
                    style={{ background: t.bg, color: t.title }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "open":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Open</h2>
            <button
              onClick={onOpen}
              className="px-4 h-9 rounded bg-[#185abd] text-white text-sm hover:bg-[#134a9e]"
            >
              Browse this device
            </button>
            <p className="text-xs text-gray-500">
              Opens a <code>.britslide</code> file. Files stay on this machine — nothing is
              uploaded.
            </p>
            <div>
              <div className="text-sm font-semibold text-gray-800 mb-1">Recent</div>
              {recent.length === 0 ? (
                <div className="text-xs text-gray-500">No recent files yet.</div>
              ) : (
                recent.map((r) => (
                  <div key={r.name} className="flex items-center justify-between py-1 text-sm">
                    <span className="text-gray-800">{r.name}</span>
                    <span className="text-xs text-gray-400">{r.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "save":
      case "saveAs":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {page === "save" ? "Save" : "Save As"}
            </h2>
            <label className="block text-xs text-gray-600 mb-1">File name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-96 h-9 border border-gray-300 rounded px-2 text-sm outline-none focus:border-[#185abd]"
            />
            <div className="text-xs text-gray-500">
              Type: BritSlide presentation (.britslide)
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveAs}
                className="px-4 h-9 rounded bg-[#185abd] text-white text-sm hover:bg-[#134a9e]"
              >
                Save
              </button>
              <button
                onClick={() => {
                  persistAutosave(slides, comments);
                  onToast("Autosaved to this browser");
                }}
                className="px-4 h-9 rounded border border-gray-300 text-sm hover:bg-[#e1e7f5]"
              >
                Save to browser only
              </button>
            </div>
          </div>
        );

      case "print":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Print</h2>
            <div className="border border-gray-200 rounded p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Printer</span>
                <span>Browser print dialog</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layout</span>
                <span>Slides, full page, {(slideW / slideH).toFixed(2)}:1 ({slideW} × {slideH} px)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Copies</span>
                <span>Handled by the print dialog</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Slide numbers, handouts, and page ranges live in the browser print dialog. This
              clone always prints one slide per page.
            </p>
            <button
              onClick={onPrint}
              className="px-4 h-9 rounded bg-[#185abd] text-white text-sm hover:bg-[#134a9e]"
            >
              Print
            </button>
          </div>
        );

      case "export":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Export</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <button
                onClick={onExportPdf}
                className="border border-gray-200 rounded p-4 text-left hover:bg-[#eaf0fb]"
              >
                <div className="font-semibold text-gray-900">PDF Document</div>
                <div className="text-xs text-gray-500 mt-1">
                  Opens a print-ready window sized to each slide, then saves as PDF.
                </div>
              </button>
              <button
                onClick={saveAs}
                className="border border-gray-200 rounded p-4 text-left hover:bg-[#eaf0fb]"
              >
                <div className="font-semibold text-gray-900">BritSlide file (.britslide)</div>
                <div className="text-xs text-gray-500 mt-1">
                  Keeps every effect, animation, transition, and comment.
                </div>
              </button>
              <div className="border border-gray-200 rounded p-4 text-left bg-gray-50">
                <div className="font-semibold text-gray-700">Video / GIF</div>
                <div className="text-xs text-gray-500 mt-1">
                  Needs a screen recorder — not built into this offline clone.
                </div>
              </div>
              <div className="border border-gray-200 rounded p-4 text-left bg-gray-50">
                <div className="font-semibold text-gray-700">PNG / JPEG per slide</div>
                <div className="text-xs text-gray-500 mt-1">
                  Print to PDF, then export the pages as images in your PDF reader.
                </div>
              </div>
            </div>
          </div>
        );

      case "options":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Options</h2>
            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 w-[420px]">
                <span>Show comments while editing</span>
                <input
                  type="checkbox"
                  checked={commentsEnabled}
                  onChange={(e) => setCommentsEnabled(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 w-[420px]">
                <span>Show ruler</span>
                <input
                  type="checkbox"
                  checked={showRuler}
                  onChange={(e) => setShowRuler(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 w-[420px]">
                <span>Snap to 40px grid</span>
                <input
                  type="checkbox"
                  checked={showGridlines}
                  onChange={(e) => setShowGridlines(e.target.checked)}
                />
              </label>
              <div className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 w-[420px]">
                <span>Presentation font</span>
                <select
                  value={designFont}
                  onChange={(e) => setDesignFont(e.target.value)}
                  className="h-7 border border-gray-300 rounded px-1 text-xs"
                >
                  {["Calibri", "Segoe UI", "Arial", "Georgia", "Times New Roman", "Verdana"].map(
                    (f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Changes autosave to this browser 0.9s after every edit. Use File › Save to download
              a portable copy.
            </p>
          </div>
        );

      case "close":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Close</h2>
            <p className="text-sm text-gray-600">
              This clone has a single document window, so closing starts a blank presentation
              instead of quitting.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onNew();
                  onClose();
                }}
                className="px-4 h-9 rounded bg-[#185abd] text-white text-sm hover:bg-[#134a9e]"
              >
                Close and start blank
              </button>
              <button
                onClick={onClose}
                className="px-4 h-9 rounded border border-gray-300 text-sm hover:bg-[#e1e7f5]"
              >
                Back to the presentation
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 top-12 z-40 bg-white flex">
      <div className="w-56 bg-[#f3f2f1] border-r border-gray-300 py-2 flex flex-col">
        <button
          onClick={onClose}
          className="mx-3 mb-2 flex items-center gap-2 px-2 h-8 rounded text-sm text-gray-800 hover:bg-white"
        >
          <span>{"\u2190"}</span> Back
        </button>
        {PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => setPage(p.id)}
            className={`mx-2 flex items-center gap-3 px-3 h-9 rounded text-sm text-left ${
              page === p.id
                ? "bg-[#e6e6e6] text-gray-900"
                : "text-gray-700 hover:bg-white"
            }`}
          >
            <span className="w-5 text-center text-gray-500">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-8">{body()}</div>
    </div>
  );
}
