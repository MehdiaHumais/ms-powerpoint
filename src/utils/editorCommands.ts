import { usePresentationStore } from "@/stores/presentationStore";
import type { SlideElement } from "@/stores/presentationStore";

function run(cmd: string, value?: string) {
  document.execCommand("styleWithCSS", false, "true");
  document.execCommand(cmd, false, value);
}

const focusCanvas = () => {
  const editable = document.querySelector<HTMLElement>('[contenteditable="true"]');
  if (!editable) return;
  const active = document.activeElement as HTMLElement | null;
  if (!(active?.isContentEditable || editable.contains(active))) {
    editable.focus();
  }
};

const activeTextbox = () => {
  const s = usePresentationStore.getState();
  const el = s.slides[s.activeIndex]?.elements.find(
    (e) => e.id === s.selectedElementId && e.kind === "textbox"
  );
  return (el as Extract<SlideElement, { kind: "textbox" }> | undefined) ?? null;
};

const patchActiveTextbox = (patch: { font?: string; size?: number; color?: string; align?: "left" | "center" | "right" | "justify" }) => {
  const el = activeTextbox();
  if (!el) return;
  usePresentationStore.getState().updateElement(el.id, { ...patch } as never);
};

const focusActiveTextBox = () => {
  const el = activeTextbox();
  if (!el) return;
  const target = document.querySelector<HTMLElement>(`[data-textbox-id="${el.id}"]`);
  if (target && !target.contains(document.activeElement)) target.focus();
};

const setFontSizePx = (px: number) => {
  const box = document.activeElement as HTMLElement | null;
  if (!box?.isContentEditable) return;
  document.execCommand("styleWithCSS", false, "true");
  // execCommand fontSize only accepts 1-7; use 7 as a sentinel then swap to real px
  document.execCommand("fontSize", false, "7");
  box.querySelectorAll('font[size="7"]').forEach((node) => {
    const span = document.createElement("span");
    span.style.fontSize = `${px}px`;
    while (node.firstChild) span.appendChild(node.firstChild);
    node.replaceWith(span);
  });
};

export function selectAllInEditable(): boolean {
  const active = document.activeElement as HTMLElement | null;
  if (active?.isContentEditable) {
    const r = document.createRange();
    r.selectNodeContents(active);
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(r);
    return true;
  }
  const id = usePresentationStore.getState().selectedElementId;
  if (!id) return false;
  const root = document.querySelector<HTMLElement>(
    `[data-textbox-id="${id}"],[data-element-id="${id}"] [data-shape-editor]`
  );
  if (!root) return false;
  root.focus();
  const r = document.createRange();
  r.selectNodeContents(root);
  const s = window.getSelection();
  s?.removeAllRanges();
  s?.addRange(r);
  return true;
}

export const editorCommands = {
  bold() {
    run("bold");
    usePresentationStore.getState().setBannerFormat({
      bold: document.queryCommandState("bold"),
    });
  },
  italic() {
    run("italic");
    usePresentationStore.getState().setBannerFormat({
      italic: document.queryCommandState("italic"),
    });
  },
  underline() {
    run("underline");
    usePresentationStore.getState().setBannerFormat({
      underline: document.queryCommandState("underline"),
    });
  },
  strike() {
    run("strikeThrough");
    usePresentationStore.getState().setBannerFormat({
      strike: document.queryCommandState("strikeThrough"),
    });
  },
  align(align: "left" | "center" | "right" | "justify") {
    run(`justify${align[0].toUpperCase()}${align.slice(1)}`);
    patchActiveTextbox({ align });
    usePresentationStore.getState().setBannerFormat({ align });
  },
  bullets() {
    run("insertUnorderedList");
  },
  numbering() {
    run("insertOrderedList");
  },
  indent() {
    run("indent");
  },
  outdent() {
    run("outdent");
  },
  fontName(font: string) {
    focusActiveTextBox();
    run("fontName", font);
    patchActiveTextbox({ font });
  },
  fontSize(size: string) {
    const px = parseInt(size, 10);
    if (Number.isFinite(px)) {
      focusActiveTextBox();
      setFontSizePx(px);
      patchActiveTextbox({ size: px });
    }
  },
  increaseFont() {
    const px = Math.min(72, (activeTextbox()?.size ?? 20) + 2);
    focusActiveTextBox();
    setFontSizePx(px);
    patchActiveTextbox({ size: px });
  },
  decreaseFont() {
    const px = Math.max(8, (activeTextbox()?.size ?? 20) - 2);
    focusActiveTextBox();
    setFontSizePx(px);
    patchActiveTextbox({ size: px });
  },
  fontColor(color: string) {
    run("foreColor", color);
    patchActiveTextbox({ color });
  },
  highlight(color: string) {
    run("hiliteColor", color);
  },
  clearFormatting() {
    run("removeFormat");
  },
  /** Applies a CSS declaration to the current selection, or the whole text box
   *  when the caret is collapsed (matching PowerPoint's "apply to shape"). */
  styleSelection(decl: Record<string, string>) {
    const active = document.activeElement as HTMLElement | null;
    if (!active?.isContentEditable) {
      if (usePresentationStore.getState().selectedElementId === null) focusCanvas();
      if (!(document.activeElement as HTMLElement | null)?.isContentEditable) return false;
    }
    const host = document.activeElement as HTMLElement;
    const sel = window.getSelection();
    if (!sel) return false;
    let range: Range;
    if (sel.rangeCount === 0 || sel.isCollapsed) {
      // No highlighted text: style everything inside the active text box.
      if (!host.textContent?.trim()) return false;
      range = document.createRange();
      range.selectNodeContents(host);
    } else {
      range = sel.getRangeAt(0);
    }
    const span = document.createElement("span");
    span.dataset.cmdStyle = "1";
    Object.entries(decl).forEach(([k, v]) => {
      span.style.setProperty(k, v);
    });
    span.appendChild(range.extractContents());
    range.insertNode(span);
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(span);
    sel.addRange(r);
    // Persist the new innerHTML to the store (React's onInput won't fire for
    // direct DOM mutations, so the effect would otherwise be reverted on render).
    host.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  },
  textShadow() {
    return this.styleSelection({ "text-shadow": "1px 1px 2px rgba(0,0,0,0.55)" });
  },
  clearTextShadow() {
    return this.styleSelection({ "text-shadow": "none" });
  },
  characterSpacing(px: number) {
    return this.styleSelection({ "letter-spacing": `${px}px` });
  },
  lineSpacing(mult: number) {
    return this.styleSelection({ "line-height": String(mult) });
  },
  changeCase(mode: "upper" | "lower" | "title") {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const convert = (t: string) => {
      if (mode === "upper") return t.toUpperCase();
      if (mode === "lower") return t.toLowerCase();
      return t.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
    };
    const text = sel.toString();
    if (!text) return false;
    // execCommand replaces the selection in place and keeps undo history intact.
    document.execCommand("insertText", false, convert(text));
    return true;
  },
  replaceSelection(text: string) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    document.execCommand("insertText", false, text);
    return true;
  },
  selectedWord() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return "";
    const t = sel.toString().trim();
    return /\S/.test(t) ? t : "";
  },
  copy() {
    const st = usePresentationStore.getState();
    const active = document.activeElement as HTMLElement | null;
    if (st.selectedElementId && !active?.isContentEditable) {
      st.copySelected();
      return;
    }
    document.execCommand("copy");
  },
  cut() {
    const st = usePresentationStore.getState();
    const active = document.activeElement as HTMLElement | null;
    if (st.selectedElementId && !active?.isContentEditable) {
      st.cutSelected();
      return;
    }
    document.execCommand("cut");
  },
  paste() {
    const st = usePresentationStore.getState();
    const active = document.activeElement as HTMLElement | null;
    if (!active?.isContentEditable && st.hasClipboard()) {
      st.pasteElement();
      return;
    }
    const el = activeTextbox();
    const target = el
      ? document.querySelector<HTMLElement>(`[data-textbox-id="${el.id}"]`)
      : null;
    if (target) target.focus();
    else focusCanvas();
    // execCommand("paste") is blocked in browsers; read the clipboard instead.
    if (navigator.clipboard?.readText) {
      navigator.clipboard
        .readText()
        .then((t) => {
          if (t) document.execCommand("insertText", false, t);
        })
        .catch(() => document.execCommand("paste"));
    } else {
      document.execCommand("paste");
    }
  },
};

export const ribbonUndo = () => {
  const active = document.activeElement as HTMLElement | null;
  if (active?.isContentEditable) {
    document.execCommand("undo");
  } else {
    usePresentationStore.getState().undo();
  }
};

export const ribbonRedo = () => {
  const active = document.activeElement as HTMLElement | null;
  if (active?.isContentEditable) {
    document.execCommand("redo");
  } else {
    usePresentationStore.getState().redo();
  }
};