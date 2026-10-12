import React, { useRef } from "react";
import type { SlideData, SlideElement, ShapeType, SlideAnimation } from "@/stores/presentationStore";
import { usePresentationStore } from "@/stores/presentationStore";

const stripBr = (h: string) => h.replace(/\u200B/g, "").replace(/(<br\s*\/?>\s*)+$/i, "").trim();

export function ShapeGlyph({
  type,
  color,
  outline,
  outlineWidth,
  opacity = 1,
}: {
  type: ShapeType;
  color: string;
  outline?: string;
  outlineWidth?: number;
  opacity?: number;
}) {
  const shared = { fill: color, opacity: opacity * 0.85 };
  const strokeColor = outline ?? color;
  const strokeW = outlineWidth ?? 1.5;
  switch (type) {
    case "rect":
      return (
        <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
          <rect x="2" y="2" width="96" height="56" rx="4" {...shared} stroke={strokeColor} strokeWidth={strokeW} />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <ellipse cx="50" cy="50" rx="48" ry="48" {...shared} stroke={strokeColor} strokeWidth={strokeW} />
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 100 86" className="w-full h-full">
          <polygon points="50,2 98,84 2,84" {...shared} stroke={strokeColor} strokeWidth={strokeW} />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="50" y="5" width="64" height="64" transform="rotate(45 50 5)" rx="6" {...shared} stroke={strokeColor} strokeWidth={strokeW} />
        </svg>
      );
    case "arrow":
      return (
        <svg viewBox="0 0 100 60" className="w-full h-full">
          <path d="M3 30h64M67 30l-16-16M67 30l-16 16" stroke={strokeColor} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "line":
      return (
        <svg viewBox="0 0 100 20" className="w-full h-full">
          <line x1="2" y1="10" x2="98" y2="10" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,4 61,36 95,36 67,56 78,90 50,70 22,90 33,56 5,36 39,36" {...shared} stroke={strokeColor} strokeWidth={strokeW} />
        </svg>
      );
    case "hexagon":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,3 92,26 92,74 50,97 8,74 8,26" {...shared} stroke={strokeColor} strokeWidth={strokeW} />
        </svg>
      );
    case "cloud":
      return (
        <svg viewBox="0 0 100 70" className="w-full h-full">
          <path d="M25 60a22 22 0 0 1 1-44 28 28 0 0 1 55 6 20 20 0 0 1-2 38H25z" {...shared} stroke={strokeColor} strokeWidth={strokeW} />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 88L12 50a22 22 0 0 1 38-16 22 22 0 0 1 38 16L50 88z" {...shared} stroke={strokeColor} strokeWidth={strokeW} />
        </svg>
      );
    case "canvas":
      return (
        <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
          <rect x="3" y="3" width="94" height="54" rx="3" fill="none" stroke={strokeColor} strokeWidth={strokeW} strokeDasharray="8 6" />
        </svg>
      );
  }
}

export function ElementView({
  el,
  selected,
  interactive,
  onPointerDownElement,
  onTextBoxFocus,
  onTextBoxInput,
  onTableCellInput,
  shapeEditingId,
  onShapeEditStart,
  onShapeEditText,
  onShapeEditEnd,
  textEditingId,
  onTextEditStart,
  inkReplayTick = 0,
  inkIndex = -1,
}: {
  el: SlideElement;
  selected: boolean;
  interactive: boolean;
  onPointerDownElement?: (e: React.PointerEvent, el: SlideElement) => void;
  onTextBoxFocus?: (el: SlideElement) => void;
  onTextBoxInput?: (id: string, text: string) => void;
  onTableCellInput?: (id: string, r: number, c: number, text: string) => void;
  shapeEditingId?: string | null;
  onShapeEditStart?: (id: string) => void;
  onShapeEditText?: (id: string, html: string) => void;
  onShapeEditEnd?: (id: string, html: string) => void;
  textEditingId?: string | null;
  onTextEditStart?: (id: string) => void;
  inkReplayTick?: number;
  inkIndex?: number;
}) {
  const editRef = useRef<HTMLDivElement>(null);
  const shapeEditRef = useRef<HTMLDivElement>(null);

  const editingThis = el.kind === "shape" && shapeEditingId === el.id;
  const textEditingThis = el.kind === "textbox" && textEditingId === el.id;

  React.useEffect(() => {
    if (editingThis && shapeEditRef.current) {
      shapeEditRef.current.focus();
    }
  }, [editingThis]);

  React.useEffect(() => {
    if (textEditingThis && editRef.current) {
      editRef.current.focus();
    }
  }, [textEditingThis]);

  React.useEffect(() => {
    if (el.kind !== "textbox") return;
    const node = editRef.current;
    if (!node) return;
    if (document.activeElement === node || node.contains(document.activeElement)) return;
    if (stripBr(node.innerHTML) === stripBr(el.text || "")) return;
    node.innerHTML = el.text || "";
  }, [el.kind === "textbox" ? el.text : null]);

  let inner: React.ReactNode = null;
  switch (el.kind) {
    case "shape":
      inner = (
        <>
          <ShapeGlyph
            type={el.type}
            color={el.color}
            outline={el.outline}
            outlineWidth={el.outlineWidth}
          />
          {shapeEditingId === el.id ? (
            <div
              ref={shapeEditRef}
              data-shape-editor
              contentEditable
              suppressContentEditableWarning
              dir="ltr"
              onClick={(e) => e.stopPropagation()}
              onInput={(e) => onShapeEditText?.(el.id, (e.currentTarget.innerHTML ?? "").replace(/\u200B/g, ""))}
              onBlur={(e) => onShapeEditEnd?.(el.id, (e.currentTarget.innerHTML ?? "").replace(/\u200B/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.currentTarget.blur();
                }
              }}
              className="absolute inset-0 flex items-center justify-center text-center overflow-hidden outline-none p-1 cursor-text"
              style={{
                color: "#ffffff",
                textShadow: "0 1px 3px rgba(0,0,0,0.35)",
                fontFamily: "Calibri",
                fontSize: "18px",
                whiteSpace: "pre-wrap",
              }}
              dangerouslySetInnerHTML={
                shapeEditRef.current &&
                stripBr(shapeEditRef.current.innerHTML) === stripBr(el.text || "")
                  ? undefined
                  : { __html: el.text || "" }
              }
            />
          ) : el.text ? (
            <div
              className="absolute inset-0 flex items-center justify-center text-center overflow-hidden p-1 pointer-events-none select-none"
              style={{
                color: "#ffffff",
                textShadow: "0 1px 3px rgba(0,0,0,0.35)",
                fontFamily: "Calibri",
                fontSize: "18px",
                whiteSpace: "pre-wrap",
              }}
              dangerouslySetInnerHTML={{ __html: el.text }}
            />
          ) : null}
        </>
      );
      break;
    case "image":
      inner = (
        <img src={el.src} alt="" draggable={false} className="w-full h-full object-cover rounded" />
      );
      break;
    case "chart": {
      const max = Math.max(...el.values, 1);
      inner = (
        <div className="w-full h-full flex items-end gap-1 px-2 pt-2 pb-1">
          {el.values.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full rounded-t bg-[#4472c4]"
                style={{ height: `${(v / max) * 88}%` }}
              />
            </div>
          ))}
        </div>
      );
      break;
    }
    case "table": {
      const cells = el.cells ?? Array.from({ length: el.rows }, () => Array.from({ length: el.cols }, () => ""));
      inner = (
        <div
          className={`w-full h-full grid border-l border-t border-gray-400 bg-white ${interactive ? "select-text" : "select-none"}`}
          style={{
            gridTemplateColumns: `repeat(${el.cols}, 1fr)`,
            gridTemplateRows: `repeat(${el.rows}, 1fr)`,
          }}
        >
          {cells.map((row, r) =>
            row.map((val, c) => (
              <TableCell
                key={`${r}-${c}`}
                value={val}
                editable={interactive}
                onText={(t) => onTableCellInput?.(el.id, r, c, t)}
              />
            ))
          )}
        </div>
      );
      break;
    }
    case "textbox":
      inner = (
        <div
          ref={editRef}
          contentEditable={interactive && textEditingThis}
          suppressContentEditableWarning
          dir="ltr"
          data-textbox-id={el.id}
          onFocus={() => onTextBoxFocus?.(el)}
          onPointerDown={(e) => {
            if (textEditingThis && !e.currentTarget.contains(document.activeElement))
              e.currentTarget.focus();
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onTextEditStart?.(el.id);
          }}
          onInput={(e) => onTextBoxInput?.(el.id, (e.currentTarget.innerHTML ?? "").replace(/\u200B/g, ""))}
          onBlur={() => {
            const node = editRef.current;
            if (node && stripBr(node.innerHTML) !== stripBr(el.text || "")) {
              node.innerHTML = el.text || "";
            }
          }}
          className={`w-full h-full outline-none whitespace-pre-wrap break-words p-1.5 -m-1.5 box-border ${
            textEditingThis ? "select-text" : "select-none"
          }`}
          style={{
            direction: "ltr",
            fontFamily: el.font || "Calibri",
            fontSize: `${el.size || 20}px`,
            color: el.color || "#1a1a1a",
            backgroundColor: el.fill && el.fill !== "transparent" ? el.fill : "transparent",
            textAlign: (el.align as "left" | "center" | "right") || "left",
            cursor: textEditingThis ? "text" : "move",
          }}
        />
      );
      break;
    case "ink": {
      // Ink Replay redraws each stroke from its start when inkReplayTick changes.
      const pts = el.stroke.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
      const replaying = !!interactive && inkReplayTick > 0 && inkIndex >= 0;
      inner = (
        <svg
          key={`${inkReplayTick}-${el.id}`}
          viewBox="0 0 820 461"
          preserveAspectRatio="none"
          className="absolute -inset-0 w-[820px] h-[461px]"
          style={{ width: "100%", height: "100%" }}
        >
          <polyline
            points={pts}
            fill="none"
            stroke={el.color}
            strokeWidth={el.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={replaying ? "ink-replay" : undefined}
            style={
              replaying
                ? ({ animationDelay: `${inkIndex * 420}ms` } as React.CSSProperties)
                : undefined
            }
          />
        </svg>
      );
      break;
    }
    case "audio":
      inner = (
        <div className="w-full h-full flex items-center gap-1.5 px-2 rounded bg-[#f3f3f3] border border-[#c8c8c8]">
          <svg viewBox="0 0 24 24" width="14" height="14" className="shrink-0 text-[#185abd]">
            <path fill="currentColor" d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
          </svg>
          <audio
            src={el.src}
            controls={el.controls}
            loop={el.loop}
            preload="metadata"
            onPointerDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            className="flex-1 h-7 min-w-0"
          />
        </div>
      );
      break;
    case "video":
      inner = (
        <video
          src={el.src}
          controls={el.controls}
          loop={el.loop}
          autoPlay={el.autoplay}
          muted={el.autoplay}
          preload="metadata"
          playsInline
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className="w-full h-full bg-black rounded"
        />
      );
      break;
  }

  return (
    <div
      className={`absolute inset-0 ${
        interactive ? "pointer-events-auto cursor-move" : "pointer-events-none"
      } ${selected && interactive ? "ring-2 ring-[#185abd]" : ""}`}
      onPointerDown={interactive && onPointerDownElement ? (e) => onPointerDownElement(e, el) : undefined}
      onDoubleClick={
        el.kind === "shape" && interactive && onShapeEditStart
          ? (e) => {
              e.stopPropagation();
              onShapeEditStart(el.id);
            }
          : el.kind === "textbox" && interactive && onTextEditStart
            ? (e) => {
                e.stopPropagation();
                onTextEditStart(el.id);
              }
            : undefined
      }
      data-element-id={el.id}
    >
      {inner}
    </div>
  );
}

function TableCell({
  value,
  editable,
  onText,
}: {
  value: string;
  editable: boolean;
  onText?: (t: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (document.activeElement === node || node.contains(document.activeElement)) return;
    if (stripBr(node.innerHTML) === stripBr(value || "")) return;
    node.innerHTML = value || "";
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      dir="ltr"
      onInput={
        editable && onText
          ? (e) => onText((e.currentTarget.innerHTML ?? "").replace(/\u200B/g, ""))
          : undefined
      }
      className="outline-none p-0.5 text-[13px] leading-snug text-gray-800 overflow-hidden border-r border-b border-gray-400 bg-white/60 min-w-0"
    />
  );
}

export default function SlideElements({
  slide,
  selectedId,
  interactive,
  onPointerDownElement,
  onTextBoxFocus,
  onTextBoxInput,
  onTableCellInput,
  shapeEditingId,
  onShapeEditStart,
  onShapeEditText,
  onShapeEditEnd,
  textEditingId,
  onTextEditStart,
  inkReplayTick = 0,
  animRun,
  animReplayTick,
  animReplayId,
}: {
  slide: SlideData;
  selectedId: string | null;
  interactive: boolean;
  onPointerDownElement?: (e: React.PointerEvent, el: SlideElement) => void;
  onTextBoxFocus?: (el: SlideElement) => void;
  onTextBoxInput?: (id: string, text: string) => void;
  onTableCellInput?: (id: string, r: number, c: number, text: string) => void;
  shapeEditingId?: string | null;
  onShapeEditStart?: (id: string) => void;
  onShapeEditText?: (id: string, html: string) => void;
  onShapeEditEnd?: (id: string, html: string) => void;
  textEditingId?: string | null;
  onTextEditStart?: (id: string) => void;
  inkReplayTick?: number;
  animRun?: number;
  animReplayTick?: number;
  animReplayId?: string | null;
}) {
  const slideW = usePresentationStore((s) => s.slideW);
  const slideH = usePresentationStore((s) => s.slideH);
  const inkOrder = slide.elements
    .map((el, i) => (el.kind === "ink" ? i : -1))
    .filter((i) => i >= 0);
  // In the slideshow, clicking cycles through "On Click" entrance animations.
  const animating = animRun !== undefined && !interactive;
  const onClickers = slide.elements
    .map((el, i) => (el.animation?.start === "onClick" ? i : -1))
    .filter((i) => i >= 0);
  const animClassOf = (a: SlideAnimation) =>
    ({
      fade: "animate-elm-fade",
      flyIn: "animate-elm-fly",
      floatIn: "animate-elm-float",
      appear: "animate-elm-appear",
      wipe: "animate-elm-wipe",
      zoom: "animate-elm-zoom",
      split: "animate-elm-split",
      push: "animate-elm-push",
      glitter: "animate-elm-glitter",
      spin: "animate-elm-spin",
      bounce: "animate-elm-bounce",
      pulse: "animate-elm-pulse",
      none: "",
    })[a];
  return (
    <div className="absolute inset-0 pointer-events-none">
      {slide.elements.map((el, i) => {
        let animCls = "";
        let animStyle: React.CSSProperties = {};
        let replayKey: string | undefined;
        const a = el.animation;
        // Applying an animation in the editor plays it once on the selected object.
        const replaying =
          interactive && !!animReplayTick && animReplayId === el.id && a && a.type !== "none";
        if (replaying) {
          animCls = animClassOf(a.type);
          animStyle = {
            "--elm-dur": `${Math.max(0.1, a.duration)}s`,
          } as React.CSSProperties;
        } else if (animating && a && a.type !== "none") {
          animStyle = {
            "--elm-dur": `${Math.max(0.1, a.duration)}s`,
            animationDelay: `${Math.max(0, a.delay)}s`,
          } as React.CSSProperties;
          if (a.start === "onClick" && animRun! <= onClickers.indexOf(i)) {
            animStyle.opacity = 0;
          } else {
            animCls = animClassOf(a.type);
          }
        }
        if (replaying) {
          replayKey = `${el.id}:p${animReplayTick}`;
        }
        return (
        <div
          key={replayKey ?? el.id}
          className={`absolute pointer-events-none ${animCls}`}
          style={{
            left: `${(el.x / slideW) * 100}%`,
            top: `${(el.y / slideH) * 100}%`,
            width: `${(el.w / slideW) * 100}%`,
            height: `${(el.h / slideH) * 100}%`,
            rotate: `${el.rot ?? 0}deg`,
            zIndex: el.z,
            ...animStyle,
            ...(el.effect?.boxShadow ? { boxShadow: el.effect.boxShadow } : {}),
            ...(el.effect?.filter ? { filter: el.effect.filter } : {}),
            ...(el.effect?.reflect
              ? {
                  WebkitBoxReflect:
                    "below 3px linear-gradient(transparent 55%, rgba(0,0,0,0.28))",
                }
              : {}),
          }}
        >
          <ElementView
            el={el}
            selected={selectedId === el.id}
            interactive={interactive}
            onPointerDownElement={onPointerDownElement}
            onTextBoxFocus={onTextBoxFocus}
            onTextBoxInput={onTextBoxInput}
            onTableCellInput={onTableCellInput}
            shapeEditingId={shapeEditingId}
            onShapeEditStart={onShapeEditStart}
            onShapeEditText={onShapeEditText}
            onShapeEditEnd={onShapeEditEnd}
            textEditingId={textEditingId}
            onTextEditStart={onTextEditStart}
            inkReplayTick={inkReplayTick}
            inkIndex={inkOrder.indexOf(i)}
          />
        </div>
        );
      })}
    </div>
  );
}

function EditableDiv({
  html,
  editable,
  className,
  placeholder,
  onText,
  style,
}: {
  html: string;
  editable: boolean;
  className?: string;
  placeholder?: string;
  onText?: (t: string) => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      dir="ltr"
      data-placeholder={placeholder}
      onInput={
        editable && onText
          ? (e) => onText((e.currentTarget.innerHTML ?? "").replace(/\u200B/g, ""))
          : undefined
      }
      className={className}
      style={style}
      dangerouslySetInnerHTML={
        ref.current && stripBr(ref.current.innerHTML) === stripBr(html)
          ? undefined
          : { __html: html }
      }
    />
  );
}

export function ThemeDecor({ accent, decor }: { accent: string; decor: string }) {
  if (!decor || decor === "none") return null;
  const soft = accent + "2e";
  if (decor === "band-bottom")
    return (
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute left-0 bottom-0 h-[7%] w-full" style={{ backgroundColor: accent }} />
        <div className="absolute left-0 bottom-[7%] h-[1.5%] w-full" style={{ backgroundColor: soft }} />
      </div>
    );
  if (decor === "band-left")
    return (
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute left-0 top-0 h-full w-[4.5%]" style={{ backgroundColor: accent }} />
        <div className="absolute left-[4.5%] top-0 h-full w-[1.2%]" style={{ backgroundColor: soft }} />
        <div
          className="absolute right-[-40px] top-[-40px] h-[150px] w-[150px] rounded-full"
          style={{ backgroundColor: soft }}
        />
      </div>
    );
  if (decor === "corner-bl")
    return (
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute left-[-70px] bottom-[-70px] h-[190px] w-[190px] rotate-45"
          style={{ backgroundColor: accent }}
        />
        <div
          className="absolute right-[-46px] bottom-[-46px] h-[120px] w-[120px] rotate-45"
          style={{ backgroundColor: soft }}
        />
      </div>
    );
  if (decor === "wedge")
    return (
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute right-[-8%] top-[-22%] h-[70%] w-[42%] rotate-[28deg]"
          style={{ backgroundColor: soft }}
        />
        <div
          className="absolute right-[-6%] top-[-4%] h-[26%] w-[30%] rotate-[28deg]"
          style={{ backgroundColor: accent }}
        />
      </div>
    );
  return null;
}

export function SlideTextLayer({
  slide,
  editable,
  className = "",
  onTitle,
  onContent,
  onContentRight,
}: {
  slide: SlideData;
  editable: boolean;
  className?: string;
  onTitle?: (t: string) => void;
  onContent?: (c: string) => void;
  onContentRight?: (c: string) => void;
}) {
  const textSel = editable ? "select-text" : "select-none";
  const base = "editable outline-none whitespace-pre-wrap break-words";
  const designFont = usePresentationStore((s) => s.designFont);
  const designTitleColor = usePresentationStore((s) => s.designTitleColor);
  const designBodyColor = usePresentationStore((s) => s.designBodyColor);
  const layerStyle = { fontFamily: designFont };
  const titleStyle = { ...layerStyle, color: designTitleColor };
  const bodyStyle = { ...layerStyle, color: designBodyColor };

  if (slide.layout === "blank") return null;

  const titleEl = (
    <EditableDiv
      editable={editable}
      html={slide.title}
      placeholder="Click to add title"
      onText={onTitle}
      className={`${base} ${textSel} ${
        slide.layout === "title" || slide.layout === "sectionHeader"
          ? "text-center mx-10 mt-[30%] text-[2.4rem] font-bold"
          : "text-[2rem] font-semibold"
      } text-gray-900`}
      style={titleStyle}
    />
  );

  if (slide.layout === "title" || slide.layout === "sectionHeader") {
    return (
      <div className={`absolute inset-0 ${className}`} style={layerStyle}>
        {titleEl}
        {slide.layout === "sectionHeader" && (
          <EditableDiv
            editable={editable}
            html={slide.content}
            placeholder="Click to add subtitle"
            onText={onContent}
            className={`${base} ${textSel} text-center text-xl text-gray-600 mt-[46%]`}
            style={bodyStyle}
          />
        )}
      </div>
    );
  }

  if (slide.layout === "twoContent") {
    return (
      <div className={`absolute inset-0 ${className}`} style={layerStyle}>
        <div className="pt-[9%] px-[7%]">{titleEl}</div>
        <div className="flex gap-[3%] px-[7%] pt-[2%] h-[62%]">
          <EditableDiv
            editable={editable}
            html={slide.content}
            placeholder="Click to add text"
            onText={onContent}
            className={`${base} ${textSel} flex-1 text-lg text-gray-800 overflow-hidden`}
            style={bodyStyle}
          />
          <EditableDiv
            editable={editable}
            html={slide.contentRight}
            placeholder="Click to add text"
            onText={onContentRight}
            className={`${base} ${textSel} flex-1 text-lg text-gray-800 overflow-hidden`}
            style={bodyStyle}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 ${className}`} style={layerStyle}>
      <div className="pt-[8%] px-[7%]">{titleEl}</div>
      <div className="px-[7%] pt-[1%] h-[55%]">
        <EditableDiv
          editable={editable}
          html={slide.content}
          placeholder="Click to add text"
          onText={onContent}
          className={`${base} ${textSel} text-lg text-gray-800 leading-relaxed overflow-hidden`}
          style={bodyStyle}
        />
      </div>
    </div>
  );
}