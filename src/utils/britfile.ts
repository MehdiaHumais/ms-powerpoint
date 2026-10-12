import type { SlideData, SlideElement, ShapeType, SlideComment } from "@/stores/presentationStore";

export const FILENAME = "Presentation1.britslide";

const esc = (s: string) =>
  (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const rich = (s: string) => (/<[a-z][\s\S]*>/i.test(s ?? "") ? s : esc(s ?? ""));

function glyph(type: ShapeType, color: string): string {
  const c = esc(color);
  const pts = (p: string, vb: string, extra = "") =>
    `<svg viewBox="${vb}" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible"><polygon points="${p}" fill="${c}" stroke="${c}" stroke-width="1.5"/></svg>` +
    extra;
  switch (type) {
    case "rect":
      return `<svg viewBox="0 0 100 60" style="position:absolute;inset:0;width:100%;height:100%"><rect x="2" y="2" width="96" height="56" rx="4" fill="${c}" stroke="${c}" stroke-width="1.5"/></svg>`;
    case "circle":
      return `<svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%"><ellipse cx="50" cy="50" rx="48" ry="48" fill="${c}" stroke="${c}" stroke-width="1.5"/></svg>`;
    case "triangle":
      return pts("50,2 98,84 2,84", "0 0 100 86");
    case "diamond":
      return `<svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%"><rect x="50" y="5" width="64" height="64" transform="rotate(45 50 5)" rx="6" fill="${c}" stroke="${c}" stroke-width="1.5"/></svg>`;
    case "arrow":
      return `<svg viewBox="0 0 100 60" style="position:absolute;inset:0;width:100%;height:100%"><path d="M3 30h64M67 30l-16-16M67 30l-16 16" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case "line":
      return `<svg viewBox="0 0 100 20" style="position:absolute;inset:0;width:100%;height:100%"><line x1="2" y1="10" x2="98" y2="10" stroke="${c}" stroke-width="5" stroke-linecap="round"/></svg>`;
    case "star":
      return pts("50,4 61,36 95,36 67,56 78,90 50,70 22,90 33,56 5,36 39,36", "0 0 100 100");
    case "hexagon":
      return pts("50,3 92,26 92,74 50,97 8,74 8,26", "0 0 100 100");
    case "cloud":
      return `<svg viewBox="0 0 100 70" style="position:absolute;inset:0;width:100%;height:100%"><path d="M25 60a22 22 0 0 1 1-44 28 28 0 0 1 55 6 20 20 0 0 1-2 38H25z" fill="${c}" stroke="${c}" stroke-width="1.5"/></svg>`;
    case "heart":
      return `<svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%"><path d="M50 88L12 50a22 22 0 0 1 38-16 22 22 0 0 1 38 16L50 88z" fill="${c}" stroke="${c}" stroke-width="1.5"/></svg>`;
    case "canvas":
      return `<svg viewBox="0 0 100 60" style="position:absolute;inset:0;width:100%;height:100%"><rect x="3" y="3" width="94" height="54" rx="3" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="8 6"/></svg>`;
  }
}

function elementHtml(el: SlideElement): string {
  const st = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;transform:rotate(${
    el.rot ?? 0
  }deg);`;
  switch (el.kind) {
    case "shape":
      return `<div style="${st}">${glyph(el.type, el.color)}</div>`;
    case "image":
      return `<div style="${st}"><img src="${esc(el.src)}" style="width:100%;height:100%;object-fit:cover" /></div>`;
    case "chart": {
      const max = Math.max(...el.values, 1);
      const bars = el.values
        .map(
          (v) =>
            `<div style="flex:1;display:flex;align-items:flex-end;justify-content:center;height:100%"><div style="width:70%;height:${(v / max) * 88}%;background:#4472c4"></div></div>`
        )
        .join("");
      return `<div style="${st}display:flex;align-items:flex-end;gap:3px;padding:6px;background:#fff;border:1px solid #bbb">${bars}</div>`;
    }
    case "table": {
      const cells = Array.from({ length: el.rows * el.cols })
        .map((_, i) => {
          const r = Math.floor(i / el.cols);
          const c = i % el.cols;
          const v = el.cells && el.cells[r] ? esc(el.cells[r][c] || "") : "";
          return `<div style="border-right:1px solid #bbb;border-bottom:1px solid #bbb;background:#fff;padding:2px;font-size:12px;overflow:hidden">${v}</div>`;
        })
        .join("");
      const grid = `display:grid;grid-template-columns:repeat(${el.cols},1fr);grid-template-rows:repeat(${el.rows},1fr);border-left:1px solid #bbb;border-top:1px solid #bbb;`;
      return `<div style="${st}background:#fff;${grid}">${cells}</div>`;
    }
    case "textbox":
      return `<div style="${st};font-family:${esc(el.font || "Calibri")};font-size:${el.size || 20}px;color:${esc(
        el.color || "#1a1a1a"
      )};text-align:${esc(el.align || "left")};background:${
        el.fill && el.fill !== "transparent" ? esc(el.fill) : "transparent"
      };white-space:pre-wrap">${esc(el.text || "")}</div>`;
    case "ink":
      return `<div style="${st}"><svg viewBox="0 0 820 461" preserveAspectRatio="none" style="width:100%;height:100%"><polyline points="${el.stroke
        .map((p) => `${p.x},${p.y}`)
        .join(" ")}" fill="none" stroke="${esc(el.color)}" stroke-width="${el.width}" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
    case "audio":
      return `<div style="${st}display:flex;align-items:center;gap:8px;padding:6px 10px;background:#f3f3f3;border:1px solid #c8c8c8;border-radius:4px;font-size:12px;color:#333">\u266B\u00A0${esc(el.name || "Audio")}</div>`;
    case "video":
      return `<div style="${st}display:flex;align-items:center;justify-content:center;background:#000;color:#fff;font-size:12px">\u25B6\u00A0${esc(el.name || "Video")}</div>`;
  }
}

export function buildPrintHtml(
  slides: SlideData[],
  theme: { accent: string; decor: string; title: string; body: string; font: string } = {
    accent: "#4472c4",
    decor: "none",
    title: "#1f3864",
    body: "#404040",
    font: "Calibri",
  }
) {
  const accent = esc(theme.accent);
  const decor = theme.decor;
  const titleColor = esc(theme.title);
  const bodyColor = esc(theme.body);
  const font = esc(theme.font);
  const pages = slides
    .map((s) => {
      const els = (s.elements ?? []).map((el) => `<div style="position:absolute;inset:0">${elementHtml(el)}</div>`).join("");
      const text = (() => {
        if (!s || s.layout === "blank") return "";
        if (s.layout === "title" || s.layout === "sectionHeader") {
          let h = `<div style="text-align:center;font-size:38px;font-weight:bold;color:${titleColor};margin-top:120px">${rich(s.title)}</div>`;
          if (s.layout === "sectionHeader")
            h += `<div style="text-align:center;font-size:22px;color:${bodyColor};margin-top:12px">${rich(s.content)}</div>`;
          return h;
        }
        let h = `<div style="font-size:34px;font-weight:600;color:${titleColor};padding:24px">${rich(s.title)}</div>`;
        if (s.layout === "twoContent") {
          h += `<div style="display:flex;gap:16px;padding:16px"><div style="flex:1;font-size:18px;color:${bodyColor};white-space:pre-wrap">${rich(s.content)}</div><div style="flex:1;font-size:18px;color:${bodyColor};white-space:pre-wrap">${rich(s.contentRight)}</div></div>`;
        } else {
          h += `<div style="height:300px;padding:16px;font-size:19px;color:${bodyColor};white-space:pre-wrap">${rich(s.content)}</div>`;
        }
        return h;
      })();
      const bgCss =
        s.bgStyle === "gradient"
          ? `background:linear-gradient(135deg, ${esc(s.bg || "#ffffff")} 0%, #ffffff 100%)`
          : `background:${esc(s.bg || "#ffffff")}`;
      const decorHtml = (() => {
        if (decor === "band-bottom")
          return `<div style="position:absolute;left:0;bottom:0;height:7%;width:100%;background:${accent}"></div>`;
        if (decor === "band-left")
          return `<div style="position:absolute;left:0;top:0;height:100%;width:4.5%;background:${accent}"></div>`;
        if (decor === "corner-bl")
          return `<div style="position:absolute;left:-70px;bottom:-70px;width:190px;height:190px;background:${accent};transform:rotate(45deg)"></div>`;
        if (decor === "wedge")
          return `<div style="position:absolute;right:-40px;top:-100px;width:300px;height:320px;background:${accent}55;transform:rotate(28deg)"></div>`;
        return "";
      })();
      return `<div class="page"><div style="position:absolute;inset:0;${bgCss}">${text}</div><div style="position:absolute;inset:0">${decorHtml}</div><div style="position:absolute;inset:0">${els}</div></div>`;
    })
    .join("\n");
  return `<html><head><meta charset="utf-8"><style>
@page { size: 820px 461px; margin: 0; }
html,body{margin:0;padding:0}
.page{width:820px;height:461px;position:relative;overflow:hidden;page-break-after:always;background:#fff}
.page:last-child{page-break-after:auto}
body{font-family:${font},Calibri,Segoe UI,sans-serif}
</style></head><body>${pages}</body></html>`;
}

export async function exportPdf(
  slides: SlideData[],
  theme?: Parameters<typeof buildPrintHtml>[1]
) {
  const html = buildPrintHtml(slides, theme);
  if (isDesktopApp()) {
    try {
      const [{ appDataDir, join }, { writeTextFile }, { open: shellOpen }] =
        await Promise.all([
          import("@tauri-apps/api/path"),
          import("@tauri-apps/api/fs"),
          import("@tauri-apps/api/shell"),
        ]);
      const file = await join(await appDataDir(), "Presentation1.print.html");
      await writeTextFile(file, html);
      await shellOpen(file);
      return;
    } catch {
      /* fall through to browser print */
    }
  }
  const w = window.open("", "_blank", "width=960,height=600");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

function readRecent(): { name: string; time: string }[] {
  try {
    const raw = localStorage.getItem("britslide.recent.v1");
    return raw ? (JSON.parse(raw) as { name: string; time: string }[]) : [];
  } catch {
    return [];
  }
}

export function getRecent(): { name: string; time: string }[] {
  return readRecent();
}

function pushRecent(name: string) {
  try {
    const list = [
      { name, time: new Date().toLocaleString() },
      ...readRecent().filter((r) => r.name !== name),
    ].slice(0, 8);
    localStorage.setItem("britslide.recent.v1", JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

let lastSavePath: string | null = null;

function buildBritslideJson(
  name: string,
  slides: SlideData[],
  comments: SlideComment[]
): string {
  return JSON.stringify(
    {
      app: "BritSlide",
      version: 2,
      name,
      saved: new Date().toISOString(),
      slides,
      comments,
    },
    null,
    2
  );
}

export async function saveBritslide(
  slides: SlideData[],
  name = FILENAME,
  comments: SlideComment[] = [],
  saveAs = false
): Promise<boolean> {
  if (isDesktopApp()) {
    try {
      const { writeTextFile } = await import("@tauri-apps/api/fs");
      if (lastSavePath && !saveAs) {
        await writeTextFile(lastSavePath, buildBritslideJson(name, slides, comments));
      } else {
        const { save: showSaveDialog } = await import("@tauri-apps/api/dialog");
        const full = name.toLowerCase().endsWith(".britslide") ? name : `${name}.britslide`;
        const chosen = (await showSaveDialog({
          defaultPath: full,
          filters: [{ name: "BritSlide presentation", extensions: ["britslide"] }],
        })) as string | null;
        if (!chosen) return false;
        await writeTextFile(chosen, buildBritslideJson(name, slides, comments));
        lastSavePath = chosen;
      }
    } catch {
      return false;
    }
    pushRecent(name);
    return true;
  }
  const blob = new Blob([buildBritslideJson(name, slides, comments)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name.toLowerCase().endsWith(".britslide") ? name : `${name}.britslide`;
  a.click();
  URL.revokeObjectURL(url);
  pushRecent(name);
  return true;
}

export function isDesktopApp(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    __TAURI__?: unknown;
    __TAURI_IPC__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  };
  return !!(w.__TAURI__ || w.__TAURI_IPC__ || w.__TAURI_INTERNALS__);
}

export async function pickBritslideFile(): Promise<{ name: string; text: string } | null> {
  if (!isDesktopApp()) return null;
  try {
    const { open } = await import("@tauri-apps/api/dialog");
    const { readTextFile } = await import("@tauri-apps/api/fs");
    const picked = (await open({
      multiple: false,
      filters: [{ name: "BritSlide presentation", extensions: ["britslide"] }],
    })) as string | null;
    if (!picked) return null;
    lastSavePath = picked;
    const short = picked.split(/[\\/]/).pop() || "Presentation.britslide";
    return { name: short, text: await readTextFile(picked) };
  } catch {
    return null;
  }
}

export async function openBritslideFile(): Promise<{ name: string; text: string } | null> {
  return pickBritslideFile();
}

export function persistAutosave(slides: SlideData[], comments: SlideComment[] = []) {
  const payload = { app: "BritSlide", saved: Date.now(), slides, comments };
  if (isDesktopApp()) {
    import("@tauri-apps/api/path")
      .then(async ({ appDataDir, join }) => {
        const { writeTextFile } = await import("@tauri-apps/api/fs");
        await writeTextFile(
          await join(await appDataDir(), "autosave.britslide.json"),
          JSON.stringify(payload, null, 2)
        );
      })
      .catch(() => undefined);
    return;
  }
  try {
    localStorage.setItem("britslide.autosave.v1", JSON.stringify(payload));
  } catch {
    /* ignore */
  }
  try {
    fetch("/api/v1/checkpoint/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  } catch {
    /* ignore */
  }
}

export function hasAutosave(): boolean {
  return !!localStorage.getItem("britslide.autosave.v1");
}

export async function loadAutosave(): Promise<{
  slides: SlideData[];
  comments: SlideComment[];
} | null> {
  const take = (data: { slides?: SlideData[]; comments?: SlideComment[] } | null) =>
    Array.isArray(data?.slides) && data.slides.length > 0
      ? {
          slides: normalizeSlides(data.slides),
          comments: Array.isArray(data.comments) ? data.comments : [],
        }
      : null;
  if (isDesktopApp()) {
    try {
      const [{ appDataDir, join }, fs] = await Promise.all([
        import("@tauri-apps/api/path"),
        import("@tauri-apps/api/fs"),
      ]);
      const { readTextFile, exists } = fs;
      const file = await join(await appDataDir(), "autosave.britslide.json");
      if (await exists(file)) {
        const found = take(JSON.parse(await readTextFile(file)) as {
          slides?: SlideData[];
          comments?: SlideComment[];
        });
        if (found) return found;
      }
    } catch {
      /* fall through to server/localStorage */
    }
  }
  try {
    const res = await fetch("/api/v1/checkpoint/");
    if (res.ok) {
      const found = take((await res.json()) as {
        slides?: SlideData[];
        comments?: SlideComment[];
      });
      if (found) return found;
    }
  } catch {
    /* fall through to localStorage */
  }
  try {
    const raw = localStorage.getItem("britslide.autosave.v1");
    if (!raw) return null;
    return take(JSON.parse(raw) as { slides?: SlideData[]; comments?: SlideComment[] });
  } catch {
    return null;
  }
}

export function normalizeSlides(list: SlideData[]): SlideData[] {
  return list.map((s, i) => ({
    id: s.id ?? i + 1,
    title: s.title ?? "",
    content: s.content ?? "",
    contentRight: s.contentRight ?? "",
    layout: s.layout ?? "blank",
    transition: s.transition ?? "none",
    animation: s.animation ?? "none",
    animationDuration:
      typeof s.animationDuration === "number" && isFinite(s.animationDuration)
        ? s.animationDuration
        : 0.6,
    animationStart: s.animationStart ?? "onClick",
    bg: s.bg ?? "#ffffff",
    notes: s.notes ?? "",
    elements: Array.isArray(s.elements)
      ? s.elements.map((e) => ({
          ...e,
          font: (e as { font?: string }).font ?? "Calibri",
          size: (e as { size?: number }).size ?? 20,
          color: (e as { color?: string }).color ?? "#1a1a1a",
          fill: (e as { fill?: string }).fill ?? "transparent",
          align: (e as { align?: string }).align ?? "left",
          rot: (e as { rot?: number }).rot ?? 0,
        }))
      : [],
    bgStyle: s.bgStyle,
    transitionDuration:
      typeof s.transitionDuration === "number" && isFinite(s.transitionDuration)
        ? s.transitionDuration
        : 0.7,
    transitionSound: s.transitionSound ?? "",
    transitionSoundLoop: Boolean(s.transitionSoundLoop),
    advanceOnClick: s.advanceOnClick !== false,
    advanceAfter: typeof s.advanceAfter === "number" ? s.advanceAfter : null,
  }));
}

export function parseBritslide(text: string): {
  slides: SlideData[];
  comments: SlideComment[];
} {
  const data = JSON.parse(text);
  const list: unknown[] = Array.isArray(data?.slides) ? data.slides : (data as unknown[]);
  if (!Array.isArray(list) || list.length === 0) throw new Error("no slides");
  const comments = Array.isArray(data?.comments)
    ? (data.comments as SlideComment[])
    : [];
  return { slides: normalizeSlides(list as SlideData[]), comments };
}