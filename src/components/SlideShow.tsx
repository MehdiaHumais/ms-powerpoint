import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePresentationStore } from "@/stores/presentationStore";
import SlideElements, { SlideTextLayer, ThemeDecor } from "./SlideElements";
import { playTransitionSound, transitionName } from "@/utils/transitions";
import { stripHtml } from "@/utils/html";
import { closePresenterView, updatePresenterView } from "@/utils/presenterView";

const RANDOM_POOL = ["vortex", "glitter", "ripple", "honeycomb", "cube", "prestige", "shape", "doors"];

function resolveTransition(id: string, seed: number): string {
  if (id === "random") return RANDOM_POOL[seed % RANDOM_POOL.length];
  return id;
}

export default function SlideShow() {
  const slides = usePresentationStore((s) => s.slides);
  const themeAccent = usePresentationStore((s) => s.themeAccent);
  const themeDecor = usePresentationStore((s) => s.themeDecor);
  const showFrom = usePresentationStore((s) => s.showFrom);
  const showLoop = usePresentationStore((s) => s.showLoop);
  const showPreview = usePresentationStore((s) => s.showPreview);
  const stopShow = usePresentationStore((s) => s.stopShow);
  const rehearsing = usePresentationStore((s) => s.rehearsing);
  const recordRehearsalTime = usePresentationStore((s) => s.recordRehearsalTime);
  const finishRehearsal = usePresentationStore((s) => s.finishRehearsal);
  const slideW = usePresentationStore((s) => s.slideW);
  const slideH = usePresentationStore((s) => s.slideH);
  const showW = 1160;
  const showH = Math.round(1160 * (slideH / slideW));
  const [index, setIndex] = useState(showFrom);
  const [animRun, setAnimRun] = useState(0);
  const [fit, setFit] = useState(() => {
    const w = window.innerWidth - 80;
    const h = window.innerHeight - 90;
    const st = usePresentationStore.getState();
    const hh = Math.round(1160 * (st.slideH / st.slideW));
    return Math.min(w / 1160, h / hh);
  });

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => {
        const next = i + dir;
        // Loop wraps around the deck; otherwise it clamps at either end.
        if (showLoop) return (next + slides.length) % slides.length;
        return Math.max(0, Math.min(slides.length - 1, next));
      });
    },
    [slides.length, showLoop]
  );

  const current = slides[index];
  const adv = current?.advanceAfter ?? null;
  const clickAdv = current?.advanceOnClick !== false;
  const clickAdvRef = useRef(clickAdv);
  clickAdvRef.current = clickAdv;
  const animRunRef = useRef(0);
  const pendingRef = useRef(0);

  useEffect(() => {
    if (adv === null || adv <= 0) return;
    const t = window.setTimeout(() => {
      setIndex((i) => {
        const next = i + 1;
        if (next < slides.length) return next;
        return showLoop ? 0 : i;
      });
    }, adv * 1000);
    return () => window.clearTimeout(t);
  }, [adv, index, slides.length, showLoop]);

  const soundRef = useRef<string | null>(null);
  useEffect(() => {
    if (index === showFrom) soundRef.current = null;
    const snd = current?.transitionSound ?? "";
    if (!current || current.transition === "none" || !snd) return;
    const key = `${index}:${snd}`;
    if (soundRef.current === key) return;
    soundRef.current = key;
    playTransitionSound(current.transition, snd);
    if (!current.transitionSoundLoop) return;
    // "Loop until next slide" repeats the cue while this slide stays on screen.
    const timer = window.setInterval(
      () => playTransitionSound(current.transition, snd),
      1600
    );
    return () => window.clearInterval(timer);
  }, [index, current, showFrom]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopShow();
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        // Preview mode is single-slide, like PowerPoint's animation Preview.
        if (showPreview) return;
        if (animRunRef.current < pendingRef.current) {
          setAnimRun(animRunRef.current + 1);
          return;
        }
        if (clickAdvRef.current) go(1);
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        if (!showPreview) go(-1);
      }
      if (!showPreview && e.key === "Home") setIndex(0);
      if (!showPreview && e.key === "End") setIndex(slides.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, slides.length, stopShow, showPreview]);

  useEffect(() => {
    const onResize = () => {
      const st = usePresentationStore.getState();
      const hh = Math.round(1160 * (st.slideH / st.slideW));
      const w = window.innerWidth - 80;
      const h = window.innerHeight - 90;
      setFit(Math.min(w / 1160, h / hh));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [slideW, slideH]);

  // Keep the (optional) Presenter View window in sync with the current slide.
  useEffect(() => {
    const cur = slides[index];
    if (!cur) return;
    const next = slides[index + 1];
    updatePresenterView({
      index,
      total: slides.length,
      notes: cur.notes ?? "",
      slideText: [stripHtml(cur.title), stripHtml(cur.content), stripHtml(cur.contentRight)]
        .filter(Boolean)
        .join("\n"),
      nextText: next
        ? [stripHtml(next.title), stripHtml(next.content)].filter(Boolean).join("\n")
        : "",
    });
  }, [index, slides]);

  // Close the presenter window when the show ends.
  useEffect(() => closePresenterView, []);

  // Rehearsal: measure how long each slide stays on screen.
  useEffect(() => {
    if (!rehearsing) return;
    const start = Date.now();
    return () => {
      const secs = (Date.now() - start) / 1000;
      if (secs > 0.2) recordRehearsalTime(index, secs);
    };
  }, [index, rehearsing, recordRehearsalTime]);

  // Rehearsal: on exit, write the recorded dwell times as per-slide timings.
  useEffect(() => {
    if (!rehearsing) return;
    return () => finishRehearsal();
  }, [rehearsing, finishRehearsal]);

  useEffect(() => {
    setIndex(showFrom);
  }, [showFrom]);

  // Each new slide restarts the "On Click" animation sequence.
  useEffect(() => {
    setAnimRun(0);
  }, [index, showFrom]);

  const slide = slides[index];
  if (!slide) return null;

  // Each entrance animation set to "On Click" waits for its own click to play;
  // "With Previous" / "After Previous" play as the slide appears, honoring Delay.
  pendingRef.current = slide.elements.filter(
    (e) => e.animation?.start === "onClick"
  ).length;
  animRunRef.current = animRun;
  const onClickAnimCount = pendingRef.current;
  const trId = resolveTransition(slide.transition, index);
  const trClass = trId === "none" ? "" : `tr tr-${trId} tr-anim`;
  const trStyle =
    trId === "none"
      ? undefined
      : ({ "--tr-dur": `${Math.max(0.1, slide.transitionDuration ?? 0.7)}s` } as React.CSSProperties);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none">
      <div className="flex items-center justify-center w-full h-full" style={{ zoom: fit }}>
        <div
          key={index}
          className={`relative bg-white shadow-2xl overflow-hidden ${trClass}`}
          style={{ width: showW, height: showH, ...(trStyle as React.CSSProperties) }}
          onClick={(e) => {
            if (showPreview) return;
            // Elements with an Action run it instead of advancing.
            const rect = e.currentTarget.getBoundingClientRect();
            const fx = ((e.clientX - rect.left) / rect.width) * slideW;
            const fy = ((e.clientY - rect.top) / rect.height) * slideH;
            const hit = [...slide.elements]
              .reverse()
              .find(
                (el) =>
                  el.action &&
                  fx >= el.x &&
                  fx <= el.x + el.w &&
                  fy >= el.y &&
                  fy <= el.y + el.h
              );
            if (hit?.action) {
              if (hit.action.kind === "slide") {
                const n = parseInt(hit.action.value, 10) - 1;
                if (n >= 0 && n < slides.length) setIndex(n);
              } else {
                window.open(hit.action.value, "_blank", "noopener");
              }
              return;
            }
            // Each click plays the next pending "On Click" entrance animation.
            if (animRun < onClickAnimCount) {
              setAnimRun(animRun + 1);
              return;
            }
            if (clickAdv) go(1);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            if (!showPreview) go(-1);
          }}
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
          <SlideTextLayer slide={slide} editable={false} />
          <SlideElements
            slide={slide}
            selectedId={null}
            interactive={false}
            animRun={showPreview ? 100 : animRun}
          />
          {slide.layout === "blank" && slide.elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-2xl">
              {stripHtml(slide.title) || "Blank slide"}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        <button
          className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/40 text-white text-xs disabled:opacity-30 disabled:hover:bg-white/20"
          onClick={() => go(-1)}
          disabled={showPreview}
        >
          ‹ Prev
        </button>
        <div className="flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
        <button
          className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/40 text-white text-xs disabled:opacity-30 disabled:hover:bg-white/20"
          onClick={() => go(1)}
          disabled={showPreview}
        >
          Next ›
        </button>
        {showPreview && (
          <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs">
            Animation preview
          </span>
        )}
      </div>

      <button
        className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 hover:bg-white/40 text-white text-xs"
        onClick={stopShow}
      >
        Exit (Esc)
      </button>

      <div className="absolute top-4 left-4 text-white/70 text-sm">
        Slide {index + 1} of {slides.length}
        {slide.transition !== "none" && (
          <span className="ml-2 text-white/40">({transitionName(slide.transition)})</span>
        )}
      </div>
    </div>
  );
}