import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  usePresentationStore,
  makeInk,
  makeShape,
  makeTextBox,
  type SlideData,
  type SlideElement,
  type ShapeType,
} from "@/stores/presentationStore";
import SlideElements, { SlideTextLayer, ShapeGlyph, ThemeDecor } from "./SlideElements";
import { ContextMenu } from "./ContextMenu";

type Gesture =
  | { type: "drag"; id: string; sx: number; sy: number; ox: number; oy: number }
  | { type: "resize"; id: string; sx: number; sy: number; ox: number; oy: number; ow: number; oh: number; corner: ResizeHandle }
  | { type: "rotate"; id: string; cx: number; cy: number; startAngle: number; startRot: number }
  | { type: "ink"; el: SlideElement }
  | { type: "lasso"; el: SlideElement }
  | { type: "shape"; st: ShapeType; sx: number; sy: number; x: number; y: number; w: number; h: number };

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLES: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const HANDLE_CURSOR: Record<ResizeHandle, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
};

export default function SlideCanvas() {
  const slides = usePresentationStore((s) => s.slides);
  const themeAccent = usePresentationStore((s) => s.themeAccent);
  const themeDecor = usePresentationStore((s) => s.themeDecor);
  const activeIndex = usePresentationStore((s) => s.activeIndex);
  const updateTitle = usePresentationStore((s) => s.updateTitle);
  const updateContent = usePresentationStore((s) => s.updateContent);
  const updateContentRight = usePresentationStore((s) => s.updateContentRight);
  const commitTextEdit = usePresentationStore((s) => s.commitTextEdit);
  const insertTool = usePresentationStore((s) => s.insertTool);
  const setInsertTool = usePresentationStore((s) => s.setInsertTool);
  const insertElement = usePresentationStore((s) => s.insertElement);
  const updateElement = usePresentationStore((s) => s.updateElement);
  const updateTextBoxText = usePresentationStore((s) => s.updateTextBoxText);
  const updateTableCellText = usePresentationStore((s) => s.updateTableCellText);
  const removeElement = usePresentationStore((s) => s.removeElement);
  const selectedElementId = usePresentationStore((s) => s.selectedElementId);
  const selectElement = usePresentationStore((s) => s.selectElement);
  const zoom = usePresentationStore((s) => s.zoom);
  const commentsEnabled = usePresentationStore((s) => s.commentsEnabled);
  const comments = usePresentationStore((s) => s.comments);
  const activeCommentId = usePresentationStore((s) => s.activeCommentId);
  const addComment = usePresentationStore((s) => s.addComment);
  const updateComment = usePresentationStore((s) => s.updateComment);
  const removeComment = usePresentationStore((s) => s.removeComment);
  const setActiveComment = usePresentationStore((s) => s.setActiveComment);
  const inkColor = usePresentationStore((s) => s.inkColor);
  const inkWidth = usePresentationStore((s) => s.inkWidth);
  const transitionTick = usePresentationStore((s) => s.transitionTick);
  const previewingTransition = usePresentationStore((s) => s.previewingTransition);
  const clearPreview = usePresentationStore((s) => s.clearPreview);
  const inkReplayTick = usePresentationStore((s) => s.inkReplayTick);
  const showRuler = usePresentationStore((s) => s.showRuler);
  const showGridlines = usePresentationStore((s) => s.showGridlines);
  const slideW = usePresentationStore((s) => s.slideW);
  const slideH = usePresentationStore((s) => s.slideH);
  const animPreviewTick = usePresentationStore((s) => s.animPreviewTick);
  const animPreviewId = usePresentationStore((s) => s.animPreviewId);

  const slide = slides[activeIndex];
  const cardRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const snapshotRef = useRef<SlideData | null>(null);
  const [inkDraft, setInkDraft] = useState<SlideElement | null>(null);
  const [shapeDraft, setShapeDraft] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [ctx, setCtx] = useState<{ open: boolean; x: number; y: number }>({ open: false, x: 0, y: 0 });
  const commentDragRef = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const slideComments = comments.filter((c) => c.slide === activeIndex);

  const toLocal = useCallback((e: { clientX: number; clientY: number }) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const st = usePresentationStore.getState();
    const sx = (e.clientX - rect.left) / (rect.width / st.slideW);
    const sy = (e.clientY - rect.top) / (rect.height / st.slideH);
    return { x: Math.max(0, Math.min(st.slideW, sx)), y: Math.max(0, Math.min(st.slideH, sy)) };
  }, []);

  const topZ = () => {
    const st = usePresentationStore.getState();
    const els = st.slides[st.activeIndex]?.elements ?? [];
    return els.reduce((m, e) => Math.max(m, (e as { z?: number }).z ?? 1), 1);
  };

  const commentMove = useCallback((e: PointerEvent) => {
    const d = commentDragRef.current;
    if (!d) return;
    updateComment(d.id, {
      x: Math.max(-160, Math.min(640, d.ox + e.clientX - d.sx)),
      y: Math.max(-120, Math.min(280, d.oy + e.clientY - d.sy)),
    });
  }, [updateComment]);

  const commentUp = useCallback(() => {
    commentDragRef.current = null;
    window.removeEventListener("pointermove", commentMove);
    window.removeEventListener("pointerup", commentUp);
  }, [commentMove]);

  const onCommentBarDown = useCallback(
    (e: React.PointerEvent, id: string, x: number, y: number) => {
      e.stopPropagation();
      e.preventDefault();
      commentDragRef.current = { id, sx: e.clientX, sy: e.clientY, ox: x, oy: y };
      window.addEventListener("pointermove", commentMove);
      window.addEventListener("pointerup", commentUp);
    },
    [commentMove, commentUp]
  );

  const endGesture = useCallback(() => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    const g = gestureRef.current;
    if (g?.type === "ink" && (g.el as Extract<SlideElement, { kind: "ink" }>).stroke.length > 1) {
      insertElement(g.el);
    }
    if (g?.type === "lasso") {
      const ink = g.el as Extract<SlideElement, { kind: "ink" }>;
      const pts = ink.stroke;
      if (pts.length > 1) {
        const xs = pts.map((pt) => pt.x);
        const ys = pts.map((pt) => pt.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const hits = (slide?.elements ?? []).filter(
          (el) => el.x < maxX && el.x + el.w > minX && el.y < maxY && el.y + el.h > minY
        );
        if (hits.length > 0) {
          const top = hits.reduce((a, b) => (a.z >= b.z ? a : b));
          selectElement(top.id);
        }
      }
    }
    if (g?.type === "shape") {
      const w = Math.max(24, Math.abs(g.w - g.sx));
      const h = Math.max(18, Math.abs(g.h - g.sy));
      if (w > 1 && h > 1) {
        const el = makeShape({
          type: g.st,
          x: Math.min(g.sx, g.w),
          y: Math.min(g.sy, g.h),
          w,
          h,
        });
        insertElement({ ...el, z: topZ() + 1 });
        selectElement(el.id);
      }
      setInsertTool(null);
    }
    setInkDraft(null);
    setShapeDraft(null);
    gestureRef.current = null;
  }, [slide, insertElement, setInsertTool, selectElement]);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const g = gestureRef.current;
      if (!g) return;
      const p = toLocal(e);
      // Snap to the visible 40px grid when View \u203a Snap to Grid is on.
      const snap = (v: number) => (showGridlines ? Math.round(v / 40) * 40 : v);
      if (g.type === "drag") {
        const nx = g.ox + p.x - g.sx;
        const ny = g.oy + p.y - g.sy;
        updateElement(g.id, {
          x: snap(nx),
          y: snap(ny),
        });
      } else if (g.type === "resize") {
        const dx = p.x - g.sx;
        const dy = p.y - g.sy;
        let x = g.ox;
        let y = g.oy;
        let w = g.ow;
        let h = g.oh;
        if (g.corner.includes("e")) w = Math.max(10, g.ow + dx);
        if (g.corner.includes("s")) h = Math.max(10, g.oh + dy);
        if (g.corner.includes("w")) {
          w = Math.max(10, g.ow - dx);
          x = g.ox + (g.ow - w);
        }
        if (g.corner.includes("n")) {
          h = Math.max(10, g.oh - dy);
          y = g.oy + (g.oh - h);
        }
        updateElement(g.id, {
          x: snap(x),
          y: snap(y),
          w: Math.max(10, snap(w)),
          h: Math.max(10, snap(h)),
        });
      } else if (g.type === "rotate") {
        const angle = (Math.atan2(p.y - g.cy, p.x - g.cx) * 180) / Math.PI;
        let rot = (g.startRot + (angle - g.startAngle)) % 360;
        rot = Math.round(rot * 10) / 10;
        updateElement(g.id, { rot });
      } else if (g.type === "ink" || g.type === "lasso") {
        const cur = g.el as Extract<SlideElement, { kind: "ink" }>;
        g.el = { ...cur, stroke: [...cur.stroke, p] };
        setInkDraft(g.el);
      } else if (g.type === "shape") {
        g.w = p.x;
        g.h = p.y;
        setShapeDraft({
          x: Math.min(g.sx, p.x),
          y: Math.min(g.sy, p.y),
          w: Math.max(24, Math.abs(p.x - g.sx)),
          h: Math.max(18, Math.abs(p.y - g.sy)),
        });
      }
    },
    [toLocal, updateElement, showGridlines]
  );

  const onPointerUp = useCallback(() => endGesture(), [endGesture]);

  const onCardPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!slide) return;
      setEditingShapeId(null);
      const tool = insertTool;
      const p = toLocal(e);

      if (tool === "ink" || tool === "highlighter" || tool === "pencil") {
        e.preventDefault();
        const color = tool === "highlighter" ? "#ffe172" : inkColor;
        const width =
          tool === "highlighter" ? 12 : tool === "pencil" ? 1.2 : inkWidth;
        const el = makeInk(color, width, p.x, p.y);
        gestureRef.current = { type: "ink", el };
        setInkDraft(el);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        return;
      }

      if (tool === "lasso") {
        e.preventDefault();
        const draft: SlideElement = {
          kind: "ink",
          id: "lasso-draft",
          x: 0,
          y: 0,
          w: slideW,
          h: slideH,
          color: "#185abd",
          width: 1.5,
          stroke: [{ x: p.x, y: p.y }],
          rot: 0,
          z: 99,
        };
        gestureRef.current = { type: "lasso", el: draft };
        setInkDraft(draft);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        return;
      }

      if (tool === "eraser") {
        const hits = slide.elements.filter(
          (el) =>
            el.kind === "ink" &&
            el.stroke.some(
              (pt) => Math.abs(pt.x - p.x) < 18 && Math.abs(pt.y - p.y) < 18
            )
        );
        if (hits.length > 0) {
          const top = hits.reduce((a, b) => (a.z >= b.z ? a : b));
          removeElement(top.id);
        }
        return;
      }

      if (tool === "textbox") {
        e.preventDefault();
        const bx = makeTextBox(
          Math.max(0, Math.min(560, p.x - 130)),
          Math.max(0, Math.min(391, p.y - 35)),
          ""
        );
        insertElement({ ...bx, z: topZ() + 1 });
        selectElement(bx.id);
        setEditingTextId(bx.id);
        setInsertTool(null);
        requestAnimationFrame(() => {
          const teb = document.querySelector<HTMLElement>(`[data-textbox-id="${bx.id}"]`);
          if (teb) {
            teb.focus();
            const range = document.createRange();
            range.selectNodeContents(teb);
            const selR = window.getSelection();
            selR?.removeAllRanges();
            selR?.addRange(range);
            selR?.collapseToEnd();
          }
        });
        return;
      }

      if (tool && tool !== "picture") {
        e.preventDefault();
        gestureRef.current = {
          type: "shape",
          st: tool as ShapeType,
          sx: p.x,
          sy: p.y,
          x: p.x,
          y: p.y,
          w: p.x,
          h: p.y,
        };
      setShapeDraft({ x: p.x, y: p.y, w: 0, h: 0 });
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      return;
    }

    if (e.button === 2) {
      e.preventDefault();
      setCtx({ open: true, x: e.clientX, y: e.clientY });
      return;
    }

      const target = e.target as HTMLElement;
      if (target.closest?.('[contenteditable="true"]')) return;

      const sel = selectedElementId;
      if (sel) {
        selectElement(null);
        setEditingTextId(null);
        setEditingShapeId(null);
        return;
      }
    },
    [slide, insertTool, toLocal, onPointerMove, onPointerUp, selectElement, removeElement, inkColor, inkWidth, selectedElementId, insertElement, setInsertTool]
  );

  const onElementPointerDown = useCallback(
    (e: React.PointerEvent, el: SlideElement) => {
      if (insertTool) {
        onCardPointerDown(e);
        return;
      }
      e.stopPropagation();
      const p = toLocal(e);
      selectElement(el.id);
      if (editingShapeId && editingShapeId !== el.id) setEditingShapeId(null);
      if (editingTextId && editingTextId !== el.id) setEditingTextId(null);

      if (el.kind === "textbox" && !(el.text || "").trim()) {
        const boxEditable = (e.target as HTMLElement).closest?.('[contenteditable="true"]');
        const focused =
          boxEditable &&
          (document.activeElement === boxEditable ||
            (boxEditable as HTMLElement).contains(document.activeElement));
        if (focused) {
          const beneath = slide.elements
            .filter((x) => x.id !== el.id)
            .filter(
              (x) => p.x >= x.x && p.x <= x.x + x.w && p.y >= x.y && p.y <= x.y + x.h
            )
            .sort((a, b) => ((b as { z?: number }).z ?? 1) - ((a as { z?: number }).z ?? 1))[0];
           if (beneath) {
            setEditingShapeId(null);
            setEditingTextId(null);
            selectElement(beneath.id);
            return;
          }
        }
      }

      if (e.button === 2) {
        e.preventDefault();
        setCtx({ open: true, x: e.clientX, y: e.clientY });
        return;
      }

      if (el.kind === "shape" && editingShapeId === el.id) {
        const editor = (e.target as HTMLElement).closest?.("[data-shape-editor]");
        if (editor) {
          const r = editor.getBoundingClientRect();
          const M = 6;
          const inMargin =
            e.clientX < r.left + M ||
            e.clientX > r.right - M ||
            e.clientY < r.top + M ||
            e.clientY > r.bottom - M;
          if (inMargin) {
            e.preventDefault();
            gestureRef.current = { type: "drag", id: el.id, sx: p.x, sy: p.y, ox: el.x, oy: el.y };
            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);
          }
          return;
        }
      }

      if (el.kind === "textbox") {
        const editable = (e.target as HTMLElement).closest?.('[contenteditable="true"]');
        if (editable) {
          const r = editable.getBoundingClientRect();
          const M = 6;
          const inMargin =
            e.clientX < r.left + M ||
            e.clientX > r.right - M ||
            e.clientY < r.top + M ||
            e.clientY > r.bottom - M;
          if (inMargin) {
            e.preventDefault();
            gestureRef.current = { type: "drag", id: el.id, sx: p.x, sy: p.y, ox: el.x, oy: el.y };
            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);
          }
          return;
        }
      }

      e.preventDefault();
      gestureRef.current = { type: "drag", id: el.id, sx: p.x, sy: p.y, ox: el.x, oy: el.y };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [insertTool, toLocal, onPointerMove, onPointerUp, selectElement, onCardPointerDown, editingShapeId, editingTextId, slide]
  );

  const onResizeHandlePointerDown = useCallback(
    (e: React.PointerEvent, el: SlideElement, corner: ResizeHandle) => {
      e.preventDefault();
      e.stopPropagation();
      const p = toLocal(e);
      selectElement(el.id);
      gestureRef.current = {
        type: "resize",
        id: el.id,
        sx: p.x,
        sy: p.y,
        ox: el.x,
        oy: el.y,
        ow: el.w,
        oh: el.h,
        corner,
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [toLocal, onPointerMove, onPointerUp, selectElement]
  );

  const onRotateHandlePointerDown = useCallback(
    (e: React.PointerEvent, el: SlideElement) => {
      e.preventDefault();
      e.stopPropagation();
      const p = toLocal(e);
      const cx = el.x + el.w / 2;
      const cy = el.y + el.h / 2;
      selectElement(el.id);
      gestureRef.current = {
        type: "rotate",
        id: el.id,
        cx,
        cy,
        startAngle: (Math.atan2(p.y - cy, p.x - cx) * 180) / Math.PI,
        startRot: el.rot ?? 0,
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [toLocal, onPointerMove, onPointerUp, selectElement]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active?.isContentEditable && e.key === "Delete") return;
      if (e.key === "Delete" && selectedElementId) {
        e.preventDefault();
        removeElement(selectedElementId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedElementId, removeElement]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (editingTextId) {
        (document.activeElement as HTMLElement | null)?.blur();
        setEditingTextId(null);
      }
      if (editingShapeId) setEditingShapeId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingTextId, editingShapeId]);

  useEffect(() => () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove, onPointerUp]);

  if (!slide) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#eaeaea]">
        <button
          className="px-4 py-2 rounded bg-[#185abd] text-white text-sm hover:bg-[#1669d9]"
          onClick={() => usePresentationStore.getState().addSlide()}
        >
          Add a slide to get started
        </button>
      </div>
    );
  }

  const snapStart = () => {
    if (!snapshotRef.current) snapshotRef.current = slide;
  };
  const snapEnd = () => {
    if (snapshotRef.current) {
      commitTextEdit(activeIndex, snapshotRef.current);
      snapshotRef.current = null;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[#eaeaea] relative">
      <div
        className="min-h-full flex items-start justify-center px-4 py-6"
        style={{ zoom: zoom }}
      >
          <div
            className="relative shrink-0"
            style={{ width: slideW, height: slideH }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (!selectedElementId) setCtx({ open: true, x: e.clientX, y: e.clientY });
            }}
          >
          {showRuler && (
            <div className="absolute -top-6 left-0 right-0 h-5 flex items-end pointer-events-none">
              <div className="w-full h-full border-b border-[#8a8a8a] relative">
                {Array.from({ length: 21 }, (_, i) => (
                  <span
                    key={i}
                    className="absolute bottom-0 border-l border-[#8a8a8a] text-[8px] text-[#5a5a5a] pl-[2px]"
                    style={{ left: `${i * 5}%`, height: i % 2 === 0 ? 10 : 6 }}
                  >
                    {i % 2 === 0 ? Math.round((i * slideW) / 20) : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div
            ref={cardRef}
            key={`tr-${transitionTick}`}
            className={`relative bg-white shadow-[0_4px_28px_rgba(0,0,0,0.28)] border border-gray-300 ${
              previewingTransition ? `tr tr-${previewingTransition} tr-anim overflow-hidden` : ""
            }`}
            style={{
              width: slideW,
              height: slideH,
              ...(previewingTransition
                ? ({ "--tr-dur": `${Math.max(0.1, slide.transitionDuration ?? 0.7)}s` } as React.CSSProperties)
                : {}),
            }}
            onPointerDown={onCardPointerDown}
            onFocus={snapStart}
            onBlur={snapEnd}
            data-editable-area
          >
            <div
              className="absolute inset-0"
              style={
                slide.bgStyle === "gradient"
                  ? { backgroundImage: `linear-gradient(135deg, ${slide.bg} 0%, #ffffff 100%)` }
                  : { backgroundColor: slide.bg, opacity: slide.bg === "#ffffff" ? 1 : 0.25 }
              }
            />
            <ThemeDecor accent={themeAccent} decor={themeDecor} />

            {showGridlines && (
              <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(120,120,120,0.28) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,120,120,0.28) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
                aria-hidden
              />
            )}

          <SlideTextLayer
            slide={slide}
            editable
            onTitle={(t) => updateTitle(activeIndex, t)}
            onContent={(c) => updateContent(activeIndex, c)}
            onContentRight={(c) => updateContentRight(activeIndex, c)}
          />

          <SlideElements
            slide={slide}
            selectedId={selectedElementId}
            interactive
            animReplayTick={animPreviewTick}
            animReplayId={animPreviewId}
            onPointerDownElement={onElementPointerDown}
            onTextBoxFocus={(el) => selectElement(el.id)}
            onTextBoxInput={(id, text) => updateTextBoxText(id, text)}
            onTableCellInput={(id, r, c, text) => updateTableCellText(id, r, c, text)}
            shapeEditingId={editingShapeId}
            textEditingId={editingTextId}
            inkReplayTick={inkReplayTick}
            onShapeEditStart={(id) => setEditingShapeId(id)}
            onTextEditStart={(id) => setEditingTextId(id)}
            onShapeEditText={(id, html) => updateElement(id, { text: html } as Partial<SlideElement>)}
            onShapeEditEnd={(id, html) => {
              updateElement(id, { text: html } as Partial<SlideElement>);
              setEditingShapeId(null);
            }}
          />

          {(() => {
            const selEl = selectedElementId
              ? slide.elements.find((el) => el.id === selectedElementId)
              : null;
            if (!selEl || insertTool) return null;
            const cx = selEl.x + selEl.w / 2;
            const cyTop = selEl.y;
            return (
              <div className="absolute inset-0 z-50 pointer-events-none">
                <div
                  style={{
                    left: cx - 0.5,
                    top: cyTop - 18,
                  }}
                  className="absolute w-px h-[18px] bg-[#185abd]/60"
                />
                <div
                  onPointerDown={(e) => onRotateHandlePointerDown(e, selEl)}
                  className="absolute w-3 h-3 bg-white border-[1.5px] border-[#185abd] rounded-full pointer-events-auto shadow-sm"
                  style={{ left: cx - 6, top: cyTop - 22, cursor: "crosshair" }}
                  title="Rotate"
                />
                {HANDLES.map((h) => {
                  const hcx =
                    h === "e" ? selEl.x + selEl.w : h === "w" ? selEl.x : selEl.x + selEl.w / 2;
                  const hcy =
                    h === "s" ? selEl.y + selEl.h : h === "n" ? selEl.y : selEl.y + selEl.h / 2;
                  return (
                    <div
                      key={h}
                      onPointerDown={(e) => onResizeHandlePointerDown(e, selEl, h)}
                      className="absolute w-2.5 h-2.5 bg-white border-[1.5px] border-[#185abd] rounded-[2px] pointer-events-auto shadow-sm"
                      style={{ left: hcx - 5, top: hcy - 5, cursor: HANDLE_CURSOR[h] }}
                      title={`Resize ${h}`}
                    />
                  );
                })}
              </div>
            );
          })()}

          {slide.layout === "blank" && slide.elements.length === 0 && insertTool === null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 text-lg">
              Blank slide — insert text, shapes, or pictures from the ribbon
            </div>
          )}

          {shapeDraft && (
            <div
              className="absolute border-2 border-[#185abd] bg-[#185abd]/10 pointer-events-none"
              style={{
                left: shapeDraft.x,
                top: shapeDraft.y,
                width: shapeDraft.w,
                height: shapeDraft.h,
              }}
            />
          )}

          {inkDraft && inkDraft.kind === "ink" && (
<svg
              viewBox={`0 0 ${slideW} ${slideH}`}
              className="absolute inset-0 pointer-events-none"
              style={{ width: slideW, height: slideH }}
            >
              <polyline
                points={inkDraft.stroke.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={inkDraft.color}
                strokeWidth={inkDraft.width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {commentsEnabled &&
            slideComments.map((c) => (
              <div
                key={c.id}
                className={`absolute w-52 bg-[#fff6c7] shadow border rounded p-2 text-xs text-gray-700 z-30 ${
                  c.resolved ? "opacity-60 border-green-400" : "border-yellow-300"
                } ${activeCommentId === c.id ? "ring-2 ring-[#185abd]" : ""}`}
                style={{ left: c.x, top: c.y }}
                onPointerDown={() => setActiveComment(c.id)}
              >
                <div
                  className="font-medium mb-1 flex items-center justify-between cursor-move select-none"
                  onPointerDown={(e) => onCommentBarDown(e, c.id, c.x, c.y)}
                  title="Drag to move"
                >
                  <span>{c.resolved ? "Resolved" : c.author}</span>
                  <span className="flex items-center gap-1.5">
                    <button
                      className="text-gray-500 hover:text-green-700 text-[11px] leading-none"
                      title={c.resolved ? "Mark as unresolved" : "Resolve comment"}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateComment(c.id, { resolved: !c.resolved });
                      }}
                    >
                      &#10003;
                    </button>
                    <button
                      className="text-gray-500 hover:text-red-600 text-sm leading-none"
                      title="Delete this comment"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeComment(c.id);
                      }}
                    >
                      &#10005;
                    </button>
                  </span>
          <ContextMenu open={ctx.open} x={ctx.x} y={ctx.y} onClose={() => setCtx({ open: false, x: 0, y: 0 })} />
        </div>
                <textarea
                  value={c.text}
                  placeholder="Add a comment\u2026"
                  className="w-full h-20 bg-transparent outline-none resize-none"
                  onPointerDown={(e) => e.stopPropagation()}
                  onChange={(e) => updateComment(c.id, { text: e.target.value })}
                />
              </div>
            ))}

          {selectedElementId && (
            <div className="absolute bottom-2 right-2 z-40 flex items-center gap-1 bg-white border border-gray-300 rounded shadow px-1 py-0.5">
              <button
                className="p-1 rounded hover:bg-gray-100 text-red-600 text-xs"
                title="Delete element"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  removeElement(selectedElementId);
                }}
              >
                ✕
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {previewingTransition && (
        <button
          onClick={clearPreview}
          className="absolute top-4 right-4 bg-white border border-gray-300 rounded-full shadow px-3 py-1 text-xs hover:bg-gray-50 z-40"
        >
          Clear Transition Preview
        </button>
      )}
      {insertTool && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white border border-gray-300 rounded-full shadow px-4 py-1.5 text-xs flex items-center gap-3 z-40">
          <span className="text-gray-600">
            {insertTool === "ink" && "Pen — draw on the slide"}
            {insertTool === "pencil" && "Pencil — draw thin strokes on the slide"}
            {insertTool === "highlighter" && "Highlighter — draw on the slide"}
            {insertTool === "lasso" && "Lasso Select — drag around objects to select the top one"}
            {insertTool === "eraser" && "Eraser — click an ink stroke to remove it"}
            {insertTool === "picture" && "Insert a picture"}
            {insertTool === "textbox" && "Click the slide to add a text box"}
            {insertTool !== "ink" &&
              insertTool !== "pencil" &&
              insertTool !== "highlighter" &&
              insertTool !== "lasso" &&
              insertTool !== "eraser" &&
              insertTool !== "picture" &&
              insertTool !== "textbox" &&
              `Drag to draw a ${insertTool} shape`}
          </span>
          <button
            className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
            onClick={() => setInsertTool(null)}
          >
            Esc
          </button>
        </div>
      )}
    </div>
  );
}