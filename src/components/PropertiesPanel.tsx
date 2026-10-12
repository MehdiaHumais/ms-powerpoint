import React from "react";
import {
  usePresentationStore,
  FONTS,
  FONT_SIZES,
  THEME_COLORS,
  type LayoutType,
  type SlideElement,
} from "@/stores/presentationStore";
import { editorCommands } from "@/utils/editorCommands";

const LAYOUTS: { key: LayoutType; label: string }[] = [
  { key: "title", label: "Title Slide" },
  { key: "titleContent", label: "Title and Content" },
  { key: "twoContent", label: "Two Content" },
  { key: "blank", label: "Blank" },
  { key: "sectionHeader", label: "Section Header" },
];

const SWATCHES = [
  "#000000",
  "#4472c4",
  "#ed7d31",
  "#a5a5a5",
  "#ffc000",
  "#5b9bd5",
  "#70ad47",
  "#7030a0",
  "#c00000",
  "#ffffff",
  "#f2f2f2",
  "#d9d9d9",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-2">
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-[11px] text-gray-600 shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-1">{children}</div>
    </div>
  );
}

function Num({
  value,
  onChange,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <input
      type="number"
      step={step}
      value={Math.round(value * 10) / 10}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (!Number.isNaN(v)) onChange(v);
      }}
      className="w-full h-6 border border-gray-300 rounded px-1 text-xs text-gray-800 outline-none focus:border-blue-500"
    />
  );
}

export default function PropertiesPanel() {
  const slides = usePresentationStore((s) => s.slides);
  const activeIndex = usePresentationStore((s) => s.activeIndex);
  const selectedElementId = usePresentationStore((s) => s.selectedElementId);
  const propertiesOpen = usePresentationStore((s) => s.propertiesOpen);
  const setPropertiesOpen = usePresentationStore((s) => s.setPropertiesOpen);
  const updateElement = usePresentationStore((s) => s.updateElement);
  const setLayout = usePresentationStore((s) => s.setLayout);
  const setThemeColor = usePresentationStore((s) => s.setThemeColor);
  const setNotes = usePresentationStore((s) => s.setNotes);

  const slide = slides[activeIndex];
  if (!slide) return null;
  if (!propertiesOpen) return null;

  const selEl: SlideElement | undefined = selectedElementId
    ? slide.elements.find((e) => e.id === selectedElementId)
    : undefined;

  const rectStyle = (patch: Partial<SlideElement>) => {
    if (selEl) updateElement(selEl.id, patch);
  };

  return (
    <div className="w-72 shrink-0 bg-white border-l border-gray-300 overflow-y-auto text-[12px] select-none">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          Properties
        </div>
        <button
          onClick={() => setPropertiesOpen(false)}
          className="w-6 h-6 rounded hover:bg-gray-100 text-gray-500 text-sm leading-none"
          title="Close panel"
        >
          ✕
        </button>
      </div>
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Slide
        </div>
        <Row label="Layout">
          <select
            value={slide.layout}
            onChange={(e) => setLayout(e.target.value as LayoutType)}
            className="w-full h-6 border border-gray-300 rounded px-1 text-xs outline-none focus:border-blue-500 bg-white"
          >
            {LAYOUTS.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Background">
          <div className="flex flex-wrap gap-1">
            {SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => setThemeColor(c)}
                className="w-5 h-5 rounded border border-gray-300 hover:ring-2 ring-blue-500"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </Row>
      </div>

      {selEl ? (
        <div className="px-3 py-2 border-b border-gray-200 space-y-2">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Size &amp; Position
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Row label="X">
              <Num value={selEl.x} onChange={(v) => rectStyle({ x: Math.max(0, Math.min(820, v)) })} />
            </Row>
            <Row label="Y">
              <Num value={selEl.y} onChange={(v) => rectStyle({ y: Math.max(0, Math.min(461, v)) })} />
            </Row>
            <Row label="W">
              <Num value={selEl.w} onChange={(v) => rectStyle({ w: Math.max(10, v) })} />
            </Row>
            <Row label="H">
              <Num value={selEl.h} onChange={(v) => rectStyle({ h: Math.max(10, v) })} />
            </Row>
            <Row label="Rotate">
              <Num value={selEl.rot ?? 0} step={5} onChange={(v) => rectStyle({ rot: v % 360 })} />
            </Row>
          </div>

          {(selEl.kind === "shape" || selEl.kind === "textbox") && (
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Fill
              </div>
              <div className="flex flex-wrap gap-1">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => rectStyle({ color: c } as Partial<SlideElement>)}
                    className="w-5 h-5 rounded border border-gray-300 hover:ring-2 ring-blue-500"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}

          {selEl.kind === "shape" && (
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Outline
              </div>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => rectStyle({ outline: c })}
                    className="w-5 h-5 rounded border border-gray-300 hover:ring-2 ring-blue-500"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <Row label="Width">
                <select
                  value={`${Math.max(0.5, selEl.outlineWidth ?? 1)}`}
                  onChange={(e) => rectStyle({ outlineWidth: Number(e.target.value) })}
                  className="w-full h-6 border border-gray-300 rounded px-1 text-xs outline-none focus:border-blue-500 bg-white"
                >
                  {[0.5, 1, 1.5, 2, 3, 4, 6].map((w) => (
                    <option key={w} value={w}>
                      {w} pt
                    </option>
                  ))}
                </select>
              </Row>
            </div>
          )}

          {selEl.kind === "shape" && (
            <button
              onClick={() => usePresentationStore.getState().bringForward()}
              className="w-full h-7 rounded border border-gray-300 bg-[#f8f8f8] hover:bg-gray-100 text-xs text-gray-700"
            >
              Bring one level forward
            </button>
          )}

          {selEl.kind === "textbox" && (
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Text
              </div>
              <Row label="Font">
                <select
                  value={selEl.font || "Calibri"}
                  onChange={(e) => rectStyle({ font: e.target.value })}
                  className="w-full h-6 border border-gray-300 rounded px-1 text-xs outline-none focus:border-blue-500 bg-white"
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Row>
              <Row label="Size">
                <select
                  value={`${selEl.size || 20}`}
                  onChange={(e) => rectStyle({ size: Number(e.target.value) })}
                  className="w-full h-6 border border-gray-300 rounded px-1 text-xs outline-none focus:border-blue-500 bg-white"
                >
                  {FONT_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Row>
              <Row label="Align">
                <div className="flex gap-1">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => rectStyle({ align: a })}
                      className={`flex-1 h-6 rounded border text-[10px] capitalize ${
                        (selEl.align || "left") === a
                          ? "border-blue-500 bg-[#d5e3f7] text-blue-700"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </Row>
              <div className="flex flex-wrap gap-1 pt-1">
                <button
                  onClick={() => editorCommands.bold()}
                  className="w-8 h-7 rounded border border-gray-300 font-bold text-xs hover:bg-gray-100"
                  title="Bold"
                >
                  B
                </button>
                <button
                  onClick={() => editorCommands.italic()}
                  className="w-8 h-7 rounded border border-gray-300 italic text-xs hover:bg-gray-100"
                  title="Italic"
                >
                  I
                </button>
                <button
                  onClick={() => editorCommands.underline()}
                  className="w-8 h-7 rounded border border-gray-300 underline text-xs hover:bg-gray-100"
                  title="Underline"
                >
                  U
                </button>
                <button
                  onClick={() => editorCommands.strike()}
                  className="w-8 h-7 rounded border border-gray-300 line-through text-xs hover:bg-gray-100"
                  title="Strikethrough"
                >
                  S
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => usePresentationStore.getState().removeElement(selEl.id)}
            className="w-full h-7 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-xs text-red-600"
          >
            Delete
          </button>
        </div>
      ) : null}

      <div className="px-3 py-2">
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Speaker Notes
        </div>
        <textarea
          data-notes-area
          value={slide.notes ?? ""}
          onChange={(e) => setNotes(activeIndex, e.target.value)}
          placeholder="Add notes for the presenter…"
          className="w-full h-36 border border-gray-300 rounded p-2 text-xs text-gray-800 outline-none resize-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}