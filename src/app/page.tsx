import React, { useEffect, useRef, useState } from "react";
import PptTitleBar from "@/components/PptTitleBar";
import PptRibbon from "@/components/PptRibbon";
import SlidePane from "@/components/SlidePane";
import SlideCanvas from "@/components/SlideCanvas";
import SlideSorter from "@/components/SlideSorter";
import SlideMasterView from "@/components/SlideMasterView";
import ReadingView from "@/components/ReadingView";
import SlideShow from "@/components/SlideShow";
import PptStatusBar from "@/components/PptStatusBar";
import PropertiesPanel from "@/components/PropertiesPanel";
import { usePresentationStore } from "@/stores/presentationStore";
import {
  saveBritslide,
  exportPdf,
  parseBritslide,
  persistAutosave,
  loadAutosave,
  normalizeSlides,
  isDesktopApp,
  openBritslideFile,
} from "@/utils/britfile";
import { selectAllInEditable } from "@/utils/editorCommands";

export default function HomePage() {
  const viewMode = usePresentationStore((s) => s.viewMode);
  const show = usePresentationStore((s) => s.show);
  const [flash, setFlash] = useState<string | null>(null);
  const openInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    const applyState = (slides: ReturnType<typeof normalizeSlides>, comments: Parameters<typeof persistAutosave>[1]) => {
      usePresentationStore.setState({
        slides,
        comments,
        activeCommentId: null,
        activeIndex: 0,
        past: [],
        future: [],
        selectedElementId: null,
      });
    };
    (async () => {
      if (isDesktopApp()) {
        try {
          const { invoke } = await import("@tauri-apps/api/tauri");
          const path = await invoke<string | null>("initial_file");
          if (path && !cancelled) {
            const { readTextFile } = await import("@tauri-apps/api/fs");
            const { slides, comments } = parseBritslide(await readTextFile(path));
            if (!cancelled) {
              applyState(slides, comments);
              setFlash(`Opened ${path.split(/[\\/]/).pop()}`);
              return;
            }
          }
        } catch {
          /* fall through to autosave */
        }
      }
      const auto = await loadAutosave();
      if (auto && auto.slides.length > 0 && !cancelled) {
        applyState(auto.slides, auto.comments);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsub = usePresentationStore.subscribe((s) => {
      window.clearTimeout((unsub as unknown as { t?: number }).t);
      (unsub as unknown as { t?: number }).t = window.setTimeout(
        () => persistAutosave(s.slides, s.comments),
        900
      );
    });
    return unsub;
  }, []);

  useEffect(() => {
    const hasTextSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) return false;
      const active = document.activeElement;
      const node = sel.anchorNode;
      return !!(
        active &&
        (active as HTMLElement).isContentEditable &&
        node &&
        active.contains(node)
      );
    };

    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      const active = document.activeElement as HTMLElement | null;
      const inEdit = !!active?.isContentEditable;
      const st = usePresentationStore.getState();

      if (mod && k === "a") {
        e.preventDefault();
        if (!selectAllInEditable()) setFlash("Select a text box, or double-click a shape first");
      } else if (mod && k === "n") {
        e.preventDefault();
        if (window.confirm("Start a new presentation? Unsaved changes will be lost.")) {
          usePresentationStore.setState({
            slides: normalizeSlides([{} as never]),
            activeIndex: 0,
            past: [],
            future: [],
            selectedElementId: null,
          });
          setFlash("New presentation created");
        }
      } else if (mod && k === "o") {
        e.preventDefault();
        if (isDesktopApp()) {
          openBritslideFile().then((f) => {
            if (f) openText(f.name, f.text);
          });
        } else {
          openInput.current?.click();
        }
      } else if (mod && k === "s") {
        e.preventDefault();
        persistAutosave(st.slides, st.comments);
        saveBritslide(st.slides, undefined, st.comments).then((ok) => {
          if (ok) setFlash("Saved");
        });
      } else if (mod && k === "p") {
        e.preventDefault();
        exportPdf(st.slides);
        setFlash("Opening PDF print view…");
      } else if (mod && k === "f") {
        e.preventDefault();
        setFlash("Find: press Ctrl+F in a text box to search");
      } else if (mod && k === "z" && !inEdit) {
        e.preventDefault();
        st.undo();
      } else if (mod && (k === "y" || (k === "z" && e.shiftKey)) && !inEdit) {
        e.preventDefault();
        st.redo();
      } else if (mod && k === "c" && st.selectedElementId && !hasTextSelection()) {
        e.preventDefault();
        st.copySelected();
        setFlash("Copied");
      } else if (mod && k === "x" && st.selectedElementId && !hasTextSelection()) {
        e.preventDefault();
        st.cutSelected();
        setFlash("Cut");
      } else if (mod && k === "v" && !hasTextSelection()) {
        e.preventDefault();
        if (st.hasClipboard()) st.pasteElement();
        else setFlash("Nothing to paste yet — copy an element with Ctrl+C");
      } else if (mod && k === "d" && st.selectedElementId && !hasTextSelection()) {
        e.preventDefault();
        st.duplicateElement();
        setFlash("Duplicated");
      } else if (k === "delete" && inEdit && st.selectedElementId) {
        const tb = document.querySelector<HTMLElement>(`[data-textbox-id="${st.selectedElementId}"]`);
        const sel = window.getSelection();
        if (tb && sel?.isCollapsed && !tb.textContent?.trim() && !tb.querySelector("img,table")) {
          e.preventDefault();
          tb.blur();
          st.removeElement(st.selectedElementId);
        }
      } else if (k === "delete" && !inEdit && st.selectedElementId) {
        e.preventDefault();
        st.removeElement(st.selectedElementId);
      } else if (k === "escape") {
        if (st.show) st.stopShow();
        if (st.insertTool) st.setInsertTool(null);
        if (active?.isContentEditable) (active as HTMLElement).blur();
        if (st.selectedElementId) st.selectElement(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 2200);
    return () => window.clearTimeout(t);
  }, [flash]);

  const openText = (filename: string, text: string) => {
    try {
      const { slides, comments } = parseBritslide(text);
      usePresentationStore.setState({
        slides,
        comments,
        activeCommentId: null,
        activeIndex: 0,
        past: [],
        future: [],
        selectedElementId: null,
      });
      setFlash(`Opened ${filename}`);
    } catch {
      setFlash("Could not open that file");
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      openText(file.name, String(reader.result));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <PptTitleBar />
      {viewMode === "reading" ? null : <PptRibbon />}
      <div className="flex flex-1 min-h-0">
        {viewMode === "sorter" ? (
          <SlideSorter />
        ) : viewMode === "reading" ? (
          <ReadingView />
        ) : viewMode === "master" ? (
          <SlideMasterView />
        ) : (
          <>
            <SlidePane />
            <SlideCanvas />
            <PropertiesPanel />
          </>
        )}
      </div>
      <PptStatusBar />
      {show && <SlideShow />}
      <input
        ref={openInput}
        type="file"
        accept=".britslide,application/json,text/json"
        className="hidden"
        onChange={onFile}
      />
      {flash && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#323130] text-white text-sm px-4 py-2 rounded shadow-lg">
          {flash}
        </div>
      )}
    </div>
  );
}