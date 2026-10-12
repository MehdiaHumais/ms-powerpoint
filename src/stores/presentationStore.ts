import { create } from 'zustand';

export type ShapeType =
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'diamond'
  | 'arrow'
  | 'line'
  | 'star'
  | 'hexagon'
  | 'cloud'
  | 'heart'
  | 'canvas';

export type Transition =
  | 'none'
  | 'fade'
  | 'push'
  | 'wipe'
  | 'split'
  | 'cover'
  | 'dissolve'
  | 'cut'
  | 'zoom'
  | 'glitter'
  | 'vortex'
  | 'ripple'
  | 'honeycomb'
  | 'prestige'
  | 'pageCurl'
  | 'airplane'
  | 'conveyor'
  | 'doors'
  | 'window'
  | 'ferris'
  | 'gallery'
  | 'cube'
  | 'box'
  | 'rotate'
  | 'orbit'
  | 'flash'
  | 'shred'
  | 'reveal'
  | 'pan'
  | 'randomBars'
  | 'wheelReverse'
  | 'shape'
  | 'uncover'
  | 'wind'
  | 'switch'
  | 'flip'
  | 'random';
export type SlideAnimation =
  | 'none'
  | 'fade'
  | 'flyIn'
  | 'floatIn'
  | 'appear'
  | 'wipe'
  | 'zoom'
  | 'split'
  | 'push'
  | 'glitter'
  | 'spin'
  | 'bounce'
  | 'pulse';
export type LayoutType = 'title' | 'titleContent' | 'twoContent' | 'blank' | 'sectionHeader';
export type ViewMode = 'normal' | 'sorter' | 'reading' | 'master';

export type SlideComment = {
  id: string;
  slide: number;
  x: number;
  y: number;
  text: string;
  author: string;
  resolved: boolean;
};

export type ElementEffect = {
  boxShadow?: string;
  filter?: string;
  reflect?: boolean;
  bevel?: boolean;
};

export type ElementAction = { kind: 'slide' | 'url'; value: string };

export type ElementAnimation = {
  type: SlideAnimation;
  duration: number;
  delay: number;
  start: 'onClick' | 'withPrevious' | 'afterPrevious';
};

type SlideElementBase =
  | { kind: 'shape'; id: string; type: ShapeType; x: number; y: number; w: number; h: number; color: string; rot: number; z: number; text?: string; outline?: string; outlineWidth?: number }
  | { kind: 'image'; id: string; src: string; x: number; y: number; w: number; h: number; rot: number; z: number }
  | { kind: 'chart'; id: string; x: number; y: number; w: number; h: number; values: number[]; rot: number; z: number }
  | { kind: 'table'; id: string; x: number; y: number; w: number; h: number; rows: number; cols: number; cells?: string[][]; rot: number; z: number }
  | { kind: 'textbox'; id: string; x: number; y: number; w: number; h: number; text: string; font: string; size: number; color: string; fill: string; align: string; rot: number; z: number }
  | { kind: 'ink'; id: string; x: number; y: number; w: number; h: number; color: string; width: number; stroke: Array<{ x: number; y: number }>; rot: number; z: number }
  | { kind: 'audio'; id: string; src: string; name: string; x: number; y: number; w: number; h: number; rot: number; z: number; autoplay: boolean; controls: boolean; loop: boolean; startAtSlide?: number | null }
  | { kind: 'video'; id: string; src: string; name: string; x: number; y: number; w: number; h: number; rot: number; z: number; autoplay: boolean; controls: boolean; loop: boolean; startAtSlide?: number | null };

export type SlideElement = SlideElementBase & { effect?: ElementEffect; action?: ElementAction; animation?: ElementAnimation };

export type SlideData = {
  id: number;
  title: string;
  content: string;
  contentRight: string;
  layout: LayoutType;
  transition: Transition;
  animation: SlideAnimation;
  animationDuration: number;
  animationStart: 'onClick' | 'withPrevious' | 'afterPrevious';
  bg: string;
  bgStyle?: 'solid' | 'gradient';
  notes: string;
  elements: SlideElement[];
  transitionDuration: number;
  transitionSound: string;
  transitionSoundLoop: boolean;
  advanceOnClick: boolean;
  advanceAfter: number | null;
};

export type InsertTool = ShapeType | 'chart' | 'table' | 'textbox' | 'picture' | 'ink' | 'highlighter' | 'pencil' | 'eraser' | 'lasso' | null;

export type FormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
  list: boolean;
};

type TabName =
  | 'File'
  | 'Home'
  | 'Insert'
  | 'Draw'
  | 'Design'
  | 'Transitions'
  | 'Animations'
  | 'Slide Show'
  | 'Review'
  | 'View'
  | 'Help';

type Snapshot = { slides: SlideData[]; activeIndex: number };

type PresentationState = {
  slides: SlideData[];
  activeIndex: number;
  activeTab: TabName;
  past: Snapshot[];
  future: Snapshot[];
  transitionTick: number;
  previewingTransition: string | null;
  /** Increments each time Draw â€º Ink Replay runs, restarting the stroke animation. */
  inkReplayTick: number;
  format: FormatState;
  zoom: number;
  slideW: number;
  slideH: number;
  animPreviewTick: number;
  animPreviewId: string | null;
  viewMode: ViewMode;
  insertTool: InsertTool;
  selectedElementId: string | null;
  propertiesOpen: boolean;
  commentsEnabled: boolean;
  showRuler: boolean;
  showGridlines: boolean;
  show: boolean;
  showFrom: number;
  showLoop: boolean;
  showPreview: boolean;
  rehearsing: boolean;
  rehearsalTimes: Record<number, number>;
  inkColor: string;
  inkWidth: number;
  penActive: boolean;
  themeAccent: string;
  themeDecor: string;
  themeName: string;
  designFont: string;
  designTitleColor: string;
  designBodyColor: string;
  masterTitle: string;
  masterBody: string;
  masterFooter: string;

  setMasterText: (
    part: "title" | "body" | "footer",
    value: string
  ) => void;
  applyBackgroundToAll: (bg: string) => void;

  setActiveSlide: (index: number) => void;
  setActiveTab: (tab: TabName) => void;
  updateTitle: (index: number, title: string) => void;
  updateContent: (index: number, content: string) => void;
  updateContentRight: (index: number, content: string) => void;
  commitTextEdit: (index: number, before: SlideData) => void;
  addSlide: () => void;
  duplicateSlide: () => void;
  deleteSlide: (index: number) => void;
  moveSlide: (index: number, dir: -1 | 1) => void;
  setLayout: (layout: LayoutType) => void;
  setBannerFormat: (partial: Partial<FormatState>) => void;
  cycleShapeColor: () => void;



  insertElement: (el: SlideElement) => void;
  insertElements: (els: SlideElement[]) => void;
  updateElement: (id: string, patch: Partial<SlideElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setPropertiesOpen: (open: boolean) => void;
  setInsertTool: (tool: InsertTool) => void;

  setTransition: (t: Transition) => void;
  setAnimation: (a: SlideAnimation) => void;
  setAnimationDuration: (seconds: number) => void;
  setAnimationStart: (start: 'onClick' | 'withPrevious' | 'afterPrevious') => void;
  applyAnimationToAll: () => void;
  setElementAnimation: (anim: SlideAnimation) => void;
  setElementAnimationDuration: (seconds: number) => void;
  setElementAnimationDelay: (seconds: number) => void;
  setElementAnimationStart: (start: 'onClick' | 'withPrevious' | 'afterPrevious') => void;
  applyElementAnimationToAll: () => void;
  removeElementAnimation: () => void;
  previewElementAnimation: (id: string) => void;
  setThemeColor: (color: string) => void;

  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setSlideSize: (w: number, h: number) => void;
  setViewMode: (mode: ViewMode) => void;
  setComments: (enabled: boolean) => void;
  setShowRuler: (on: boolean) => void;
  setShowGridlines: (on: boolean) => void;
  comments: SlideComment[];
  activeCommentId: string | null;
  addComment: (c: Omit<SlideComment, "id" | "resolved">) => string;
  updateComment: (id: string, patch: Partial<SlideComment>) => void;
  removeComment: (id: string) => void;
  setActiveComment: (id: string | null) => void;
  clearResolvedComments: () => void;
  setInkColor: (color: string) => void;
  setInkWidth: (width: number) => void;
  applyTheme: (theme: {
    accent: string;
    bg: string;
    title: string;
    body: string;
    decor?: string;
    name?: string;
  }) => void;
  setDesignFont: (font: string) => void;
  applyVariant: (
    accent: string,
    bg: string,
    title: string,
    body: string
  ) => void;
  setBgStyle: (style: 'solid' | 'gradient') => void;

  setNotes: (index: number, notes: string) => void;
  updateTextBoxText: (id: string, text: string) => void;
  updateTableCellText: (id: string, r: number, c: number, text: string) => void;
  duplicateElement: () => void;
  copySelected: () => void;
  pasteElement: () => void;
  cutSelected: () => void;
  hasClipboard: () => boolean;
  bringToFront: (id?: string) => void;
  sendToBack: (id?: string) => void;
  bringForward: (id?: string) => void;
  sendBackward: (id?: string) => void;

  previewTransition: (id?: string) => void;
  clearPreview: () => void;
  replayInk: () => void;
  applyTransitionToAll: () => void;
  setTransitionDuration: (sec: number) => void;
  setTransitionSound: (file: string) => void;
  setTransitionSoundLoop: (loop: boolean) => void;
  setAdvanceOnClick: (on: boolean) => void;
  setAdvanceAfter: (sec: number | null) => void;

   startShow: (from: number, opts?: { loop?: boolean; preview?: boolean }) => void;
  stopShow: () => void;
  startRehearsal: () => void;
  recordRehearsalTime: (index: number, seconds: number) => void;
  finishRehearsal: () => void;

  undo: () => void;
  redo: () => void;
  loadFromApi: () => Promise<void>;
};

const FALLBACK_SLIDES: SlideData[] = [
  {
    id: 1,
    title: '',
    content: '',
    contentRight: '',
    layout: 'blank',
    transition: 'none',
    animation: 'none',
    animationDuration: 0.6,
    animationStart: 'onClick',
    bg: '#ffffff',
    notes: '',
    elements: [],
    transitionDuration: 0.7,
    transitionSound: '',
    transitionSoundLoop: false,
    advanceOnClick: true,
    advanceAfter: null,
  },
];

const snapOf = (state: Pick<PresentationState, 'slides' | 'activeIndex'>): Snapshot => ({
  slides: state.slides,
  activeIndex: state.activeIndex,
});

const histPush = (state: PresentationState): { past: Snapshot[]; future: [] } => ({
  past: [...state.past, snapOf(state)].slice(-50),
  future: [],
});

let elementCounter = 0;
const elId = (kind: string) => `${kind}-${++elementCounter}`;

const clipRef: { current: SlideElement | null } = { current: null };

const DEFAULT_COLORS: Record<ShapeType, string> = {
  rect: '#4472c4',
  circle: '#ed7d31',
  triangle: '#70ad47',
  diamond: '#7030a0',
  arrow: '#305496',
  line: '#7f7f7f',
  star: '#ffc000',
  hexagon: '#5b9bd5',
  cloud: '#a5a5a5',
  heart: '#c00000',
  canvas: '#4472c4',
};

type ShapeOpts = { x: number; y: number; w: number; h: number; type: ShapeType; color: string; rot: number; z: number; text: string; outline: string; outlineWidth: number };

export function makeShape(opts: Partial<ShapeOpts> = {}): SlideElement {
  const type = opts.type ?? 'rect';
  return {
    kind: 'shape',
    id: elId('shape'),
    type,
    x: opts.x ?? 300,
    y: opts.y ?? 180,
    w: opts.w ?? 140,
    h: opts.h ?? 80,
    color: opts.color ?? DEFAULT_COLORS[type],
    rot: opts.rot ?? 0,
    z: opts.z ?? 1,
    text: opts.text ?? '',
    outline: opts.outline ?? DEFAULT_COLORS[type],
    outlineWidth: opts.outlineWidth ?? 1,
  };
}

export function makeImage(src: string): SlideElement {
  return { kind: 'image', id: elId('image'), src, x: 260, y: 160, w: 220, h: 160, rot: 0, z: 1 };
}

export function makeChart(values: number[] = [40, 65, 55, 80, 60, 45]): SlideElement {
  return { kind: 'chart', id: elId('chart'), x: 260, y: 140, w: 280, h: 200, values, rot: 0, z: 1 };
}

export function makeTable(): SlideElement {
  return { kind: 'table', id: elId('table'), x: 270, y: 150, w: 260, h: 160, rows: 3, cols: 3, cells: [['', '', ''], ['', '', ''], ['', '', '']], rot: 0, z: 1 };
}

export function makeTextBox(x = 280, y = 180, text = '', font = 'Calibri', size = 20, color = '#1a1a1a', fill = 'transparent', w = 260, h = 70): SlideElement {
  return {
    kind: 'textbox',
    id: elId('textbox'),
    x,
    y,
    w,
    h,
    text,
    font,
    size,
    color,
    fill,
    align: 'left',
    rot: 0,
    z: 1,
  };
}

export function makeInk(color: string, width: number, x: number, y: number): SlideElement {
  return { kind: 'ink', id: elId('ink'), x: 0, y: 0, w: 820, h: 461, color, width, stroke: [{ x, y }], rot: 0, z: 1 };
}

function currentSlideIndex(state: PresentationState) {
  return state.activeIndex;
}

function updateCurrentSlide(
  state: PresentationState,
  updater: (s: SlideData) => Partial<SlideData>,
  recordHistory = true
) {
  const i = currentSlideIndex(state);
  const cur = state.slides[i];
  if (!cur) return {};
  const next = { ...cur, ...updater(cur) };
  const slides = state.slides.map((s, idx) => (idx === i ? next : s));
  const out: Partial<PresentationState> = { slides };
  if (recordHistory) Object.assign(out, histPush(state));
  return out;
}

export const SHAPE_LIST: ShapeType[] = [
  'rect',
  'circle',
  'triangle',
  'diamond',
  'arrow',
  'line',
  'star',
  'hexagon',
  'cloud',
  'heart',
  'canvas',
];

export const FONTS = ['Calibri', 'Arial', 'Georgia', 'Tahoma', 'Verdana', 'Courier New'];
export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64];
export const THEME_COLORS = ['#2f5b8f', '#c00000', '#7030a0', '#16a085', '#d35400', '#34495e'];

export const usePresentationStore = create<PresentationState>((set, get) => ({
  slides: FALLBACK_SLIDES,
  activeIndex: 0,
  activeTab: 'Home',
  past: [],
  future: [],
  transitionTick: 0,
  previewingTransition: null,
  inkReplayTick: 0,
  format: { bold: false, italic: false, underline: false, strike: false, align: 'left', list: false },
  zoom: 1,
  slideW: 820,
  slideH: 461,
  animPreviewTick: 0,
  animPreviewId: null,
  viewMode: 'normal',
  insertTool: null,
  selectedElementId: null,
  propertiesOpen: true,
  commentsEnabled: false,
  showRuler: false,
  showGridlines: false,
  comments: [],
  activeCommentId: null,
  show: false,
  showFrom: 0,
  showLoop: false,
  showPreview: false,
  rehearsing: false,
  rehearsalTimes: {},
  inkColor: '#c00000',
  inkWidth: 3,
  penActive: false,
  themeAccent: '#4472c4',
  themeDecor: 'none',
  themeName: 'Office',
  designFont: 'Calibri',
  designTitleColor: '#1f3864',
  designBodyColor: '#333333',
  masterTitle: 'Click to edit Master title style',
  masterBody: 'Click to edit Master body text style',
  masterFooter: 'Master footer text',

  setActiveSlide: (index) =>
    set((state) => ({
      activeIndex: Math.max(0, Math.min(state.slides.length - 1, index)),
      selectedElementId: null,
    })),

  setActiveTab: (tab) => set(() => ({ activeTab: tab, insertTool: null })),

  updateTitle: (index, title) =>
    set((state) => ({
      slides: state.slides.map((s, i) => (i === index ? { ...s, title } : s)),
    })),

  updateContent: (index, content) =>
    set((state) => ({
      slides: state.slides.map((s, i) => (i === index ? { ...s, content } : s)),
    })),

  updateContentRight: (index, content) =>
    set((state) => ({
      slides: state.slides.map((s, i) => (i === index ? { ...s, contentRight: content } : s)),
    })),

  commitTextEdit: (index, before) =>
    set((state) => {
      const cur = state.slides[index];
      if (
        !cur ||
        (before.title === cur.title &&
          before.content === cur.content &&
          before.contentRight === cur.contentRight)
      ) {
        return {};
      }
      return {
        past: [
          ...state.past,
          {
            slides: state.slides.map((s, i) => (i === index ? before : s)),
            activeIndex: state.activeIndex,
          },
        ].slice(-50),
        future: [],
      };
    }),

  addSlide: () =>
    set((state) => {
      const id = state.slides.reduce((m, s) => Math.max(m, s.id), 0) + 1;
      const slide: SlideData = {
        id,
        title: '',
        content: '',
        contentRight: '',
        layout: 'blank',
        transition: state.slides[state.activeIndex]?.transition ?? 'none',
        animation: 'none',
        animationDuration: 0.6,
        animationStart: 'onClick',
        bg: '#ffffff',
        notes: '',
        elements: [],
        transitionDuration: state.slides[state.activeIndex]?.transitionDuration ?? 0.7,
        transitionSound: '',
        transitionSoundLoop: false,
        advanceOnClick: true,
        advanceAfter: null,
      };
      return {
        ...histPush(state),
        slides: [...state.slides, slide],
        activeIndex: state.slides.length,
        selectedElementId: null,
      };
    }),

  duplicateSlide: () =>
    set((state) => {
      const src = state.slides[state.activeIndex];
      if (!src) return {};
      const copy: SlideData = {
        ...src,
        id: state.slides.reduce((m, s) => Math.max(m, s.id), 0) + 1,
        elements: src.elements.map((el) => ({ ...el, id: elId(el.kind) })),
      };
      const insertAt = state.activeIndex + 1;
      const slides = [...state.slides];
      slides.splice(insertAt, 0, copy);
      return {
        ...histPush(state),
        slides,
        activeIndex: insertAt,
        selectedElementId: null,
      };
    }),

  deleteSlide: (index) =>
    set((state) => {
      if (state.slides.length <= 1) return {};
      const slides = state.slides.filter((_, i) => i !== index);
      const activeIndex =
        state.activeIndex >= slides.length
          ? slides.length - 1
          : state.activeIndex === index
          ? Math.max(0, index - 1)
          : state.activeIndex;
      return { ...histPush(state), slides, activeIndex, selectedElementId: null };
    }),

  moveSlide: (index, dir) =>
    set((state) => {
      const to = index + dir;
      if (to < 0 || to >= state.slides.length) return {};
      const slides = [...state.slides];
      const [s] = slides.splice(index, 1);
      slides.splice(to, 0, s);
      return {
        ...histPush(state),
        slides,
        activeIndex: state.activeIndex === index ? to : state.activeIndex,
        selectedElementId: null,
      };
    }),

  setLayout: (layout) =>
    set((state) => ({ ...updateCurrentSlide(state, () => ({ layout })) })),

  setBannerFormat: (partial) =>
    set((state) => ({ format: { ...state.format, ...partial } })),

  cycleShapeColor: () =>
    set((state) => {
      const id = state.selectedElementId;
      const el = id ? state.slides[state.activeIndex].elements.find((e) => e.id === id) : null;
      if (!el || el.kind !== 'shape') return {};
      const idx = SHAPE_LIST.indexOf(el.type);
      const next = DEFAULT_COLORS[SHAPE_LIST[(idx + 1) % SHAPE_LIST.length]];
      return updateCurrentSlide(state, (s) => ({
        elements: s.elements.map((e) => (e.id === id ? { ...e, color: next } : e)),
      }));
    }),

  bringToFront: (targetId) =>
    set((state) => {
      const id = targetId ?? state.selectedElementId;
      if (!id) return {};
      const els = state.slides[state.activeIndex].elements;
      const idx = els.findIndex((e) => e.id === id);
      if (idx < 0 || idx === els.length - 1) return {};
      const next = [...els];
      const [el] = next.splice(idx, 1);
      next.push(el);
      return updateCurrentSlide(state, () => ({ elements: next }));
    }),

  sendToBack: (targetId) =>
    set((state) => {
      const id = targetId ?? state.selectedElementId;
      if (!id) return {};
      const els = state.slides[state.activeIndex].elements;
      const idx = els.findIndex((e) => e.id === id);
      if (idx <= 0) return {};
      const next = [...els];
      const [el] = next.splice(idx, 1);
      next.unshift(el);
      return updateCurrentSlide(state, () => ({ elements: next }));
    }),

  bringForward: (targetId) =>
    set((state) => {
      const id = targetId ?? state.selectedElementId;
      const i = state.activeIndex;
      if (!id) return {};
      const els = state.slides[i].elements;
      const idx = els.findIndex((e) => e.id === id);
      if (idx < 0 || idx === els.length - 1) return {};
      const next = [...els];
      const [el] = next.splice(idx, 1);
      next.splice(idx + 1, 0, el);
      return updateCurrentSlide(state, () => ({ elements: next }));
    }),

  sendBackward: (targetId) =>
    set((state) => {
      const id = targetId ?? state.selectedElementId;
      if (!id) return {};
      const els = state.slides[state.activeIndex].elements;
      const idx = els.findIndex((e) => e.id === id);
      if (idx <= 0) return {};
      const next = [...els];
      const [el] = next.splice(idx, 1);
      next.splice(idx - 1, 0, el);
      return updateCurrentSlide(state, () => ({ elements: next }));
    }),

  insertElement: (el) =>
    set((state) => updateCurrentSlide(state, (s) => ({ elements: [...s.elements, el] }))),

  insertElements: (els) =>
    set((state) => {
      const patch = updateCurrentSlide(state, (s) => ({ elements: [...s.elements, ...els] }));
      return {
        ...patch,
        selectedElementId: els.length > 0 ? els[els.length - 1].id : state.selectedElementId,
      };
    }),

  updateElement: (id, patch) =>
    set((state) =>
      updateCurrentSlide(state, (s) => ({
        elements: s.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as SlideElement) : e)),
      }))
    ),

  removeElement: (id) =>
    set((state) =>
      updateCurrentSlide(state, (s) => ({
        elements: s.elements.filter((e) => e.id !== id),
      }))
    ),

  selectElement: (id) =>
    set((state) => ({ selectedElementId: id, propertiesOpen: id ? true : state.propertiesOpen })),

  setPropertiesOpen: (open) => set(() => ({ propertiesOpen: open })),

  setInsertTool: (tool) =>
    set(() => (tool ? { insertTool: tool, selectedElementId: null } : { insertTool: null })),

  setTransition: (t) =>
    set((state) => ({
      ...updateCurrentSlide(state, () => ({ transition: t })),
      transitionTick: state.transitionTick + 1,
      previewingTransition: t === 'none' ? null : t,
    })),

  previewTransition: (id) =>
    set((state) => {
      const t = id ?? state.slides[state.activeIndex]?.transition ?? 'none';
      return {
        transitionTick: state.transitionTick + 1,
        previewingTransition: t === 'none' ? null : t,
      };
    }),

  clearPreview: () => set(() => ({ previewingTransition: null })),

  replayInk: () => set((state) => ({ inkReplayTick: state.inkReplayTick + 1 })),

  applyTransitionToAll: () =>
    set((state) => {
      const src = state.slides[state.activeIndex];
      if (!src) return {};
      return {
        ...histPush(state),
        slides: state.slides.map((s) => ({
          ...s,
          transition: src.transition,
          transitionDuration: src.transitionDuration,
          transitionSound: src.transitionSound,
          transitionSoundLoop: src.transitionSoundLoop,
          advanceOnClick: src.advanceOnClick,
          advanceAfter: src.advanceAfter,
        })),
      };
    }),

  setTransitionDuration: (sec) =>
    set((state) => ({
      ...updateCurrentSlide(state, () => ({
        transitionDuration: Math.max(0.1, Math.min(59, sec)),
      })),
    })),

  setTransitionSound: (file) =>
    set((state) => ({ ...updateCurrentSlide(state, () => ({ transitionSound: file })) })),

  setTransitionSoundLoop: (loop) =>
    set((state) => ({ ...updateCurrentSlide(state, () => ({ transitionSoundLoop: loop })) })),

  setAdvanceOnClick: (on) =>
    set((state) => ({ ...updateCurrentSlide(state, () => ({ advanceOnClick: on })) })),

  setAdvanceAfter: (sec) =>
    set((state) => ({
      ...updateCurrentSlide(state, () => ({ advanceAfter: sec === null ? null : Math.max(0, sec) })),
    })),

  setAnimation: (a) =>
    set((state) => ({ ...updateCurrentSlide(state, () => ({ animation: a })) })),

  setAnimationDuration: (seconds) =>
    set((state) => ({
      ...updateCurrentSlide(state, () => ({
        animationDuration: Math.max(0.1, Math.min(10, seconds)),
      })),
    })),

  setAnimationStart: (start) =>
    set((state) => ({
      ...updateCurrentSlide(state, () => ({ animationStart: start })),
    })),

  applyAnimationToAll: () =>
    set((state) => {
      const src = state.slides[state.activeIndex];
      if (!src) return {};
      return {
        slides: state.slides.map((s) =>
          s.id === src.id
            ? s
            : {
                ...s,
                animation: src.animation,
                animationDuration: src.animationDuration,
                animationStart: src.animationStart,
              }
        ),
      };
    }),

  setElementAnimation: (anim) =>
    set((state) => {
      const id = state.selectedElementId;
      if (!id) return {};
      return updateCurrentSlide(state, (s) => ({
        elements: s.elements.map((e) => {
          if (e.id !== id) return e;
          if (anim === 'none') {
            const { animation: _drop, ...rest } = e;
            void _drop;
            return rest as SlideElement;
          }
          const prev = e.animation;
          return {
            ...e,
            animation: {
              type: anim,
              duration: prev?.duration ?? 0.6,
              delay: prev?.delay ?? 0,
              start: prev?.start ?? 'onClick',
            },
          } as SlideElement;
        }),
      }));
    }),

  setElementAnimationDuration: (seconds) =>
    set((state) => {
      const id = state.selectedElementId;
      if (!id) return {};
      const val = Math.max(0.1, Math.min(10, seconds));
      return updateCurrentSlide(state, (s) => ({
        elements: s.elements.map((e) =>
          e.id === id && e.animation
            ? { ...e, animation: { ...e.animation, duration: val } }
            : e
        ),
      }));
    }),

  setElementAnimationDelay: (seconds) =>
    set((state) => {
      const id = state.selectedElementId;
      if (!id) return {};
      const val = Math.max(0, Math.min(10, seconds));
      return updateCurrentSlide(state, (s) => ({
        elements: s.elements.map((e) =>
          e.id === id && e.animation
            ? { ...e, animation: { ...e.animation, delay: val } }
            : e
        ),
      }));
    }),

  setElementAnimationStart: (start) =>
    set((state) => {
      const id = state.selectedElementId;
      if (!id) return {};
      return updateCurrentSlide(state, (s) => ({
        elements: s.elements.map((e) =>
          e.id === id && e.animation
            ? { ...e, animation: { ...e.animation, start } }
            : e
        ),
      }));
    }),

  applyElementAnimationToAll: () =>
    set((state) => {
      const src = state.slides[state.activeIndex]?.elements.find(
        (e) => e.id === state.selectedElementId
      );
      const anim = src?.animation;
      if (!anim) return {};
      return updateCurrentSlide(state, (s) => ({
        elements: s.elements.map((e) => ({ ...e, animation: { ...anim } })),
      }));
    }),

  removeElementAnimation: () =>
    set((state) => {
      const id = state.selectedElementId;
      if (!id) return {};
      return updateCurrentSlide(state, (s) => ({
        elements: s.elements.map((e) => {
          if (e.id !== id) return e;
          const { animation: _drop, ...rest } = e;
          void _drop;
          return rest as SlideElement;
        }),
      }));
    }),

  previewElementAnimation: (id) =>
    set((state) => ({ animPreviewTick: state.animPreviewTick + 1, animPreviewId: id })),

  setThemeColor: (color) =>
    set((state) => ({ ...updateCurrentSlide(state, () => ({ bg: color })) })),

  applyTheme: (theme) =>
    set((state) => ({
      themeAccent: theme.accent,
      themeDecor: theme.decor ?? "none",
      themeName: theme.name ?? "Custom",
      designTitleColor: theme.title,
      designBodyColor: theme.body,
      ...updateCurrentSlide(state, () => ({ bg: theme.bg })),
    })),

  setDesignFont: (font) => set(() => ({ designFont: font })),

  setMasterText: (part, value) =>
    set(() => ({
      masterTitle:
        part === "title"
          ? value
          : usePresentationStore.getState().masterTitle,
      masterBody:
        part === "body" ? value : usePresentationStore.getState().masterBody,
      masterFooter:
        part === "footer" ? value : usePresentationStore.getState().masterFooter,
    })),

  applyBackgroundToAll: (bg) =>
    set((state) => ({
      slides: state.slides.map((s) => ({ ...s, bg })),
    })),

  applyVariant: (accent, bg, title, body) =>
    set((state) => ({
      themeAccent: accent,
      designTitleColor: title,
      designBodyColor: body,
      ...updateCurrentSlide(state, () => ({ bg })),
    })),

  setBgStyle: (style) =>
    set((state) => ({ ...updateCurrentSlide(state, () => ({ bgStyle: style })) })),

  setZoom: (zoom) =>
    set(() => ({ zoom: Math.max(0.4, Math.min(2, zoom)) })),

  zoomIn: () => set((state) => ({ zoom: Math.min(2, Math.round((state.zoom + 0.1) * 10) / 10) })),

  zoomOut: () => set((state) => ({ zoom: Math.max(0.4, Math.round((state.zoom - 0.1) * 10) / 10) })),
  setSlideSize: (w, h) =>
    set((state) => {
      const slideW = Math.max(400, Math.min(1600, Math.round(w)));
      const slideH = Math.max(300, Math.min(1200, Math.round(h)));
      const sx = slideW / state.slideW;
      const sy = slideH / state.slideH;
      const slides = state.slides.map((s) => ({
        ...s,
        elements: s.elements.map((el) => {
          if (el.kind === "ink") {
            return {
              ...el,
              x: el.x * sx,
              y: el.y * sy,
              w: el.w * sx,
              h: el.h * sy,
              stroke: el.stroke.map((p) => ({ x: p.x * sx, y: p.y * sy })),
            } as SlideElement;
          }
          return {
            ...el,
            x: el.x * sx,
            y: el.y * sy,
            w: el.w * sx,
            h: el.h * sy,
          } as SlideElement;
        }),
      }));
      return { slideW, slideH, slides, zoom: 1 };
    }),

  setViewMode: (mode) =>
    set(() => ({ viewMode: mode, selectedElementId: null })),

  setComments: (enabled) => set(() => ({ commentsEnabled: enabled })),

  setShowRuler: (on) => set(() => ({ showRuler: on })),

  setShowGridlines: (on) => set(() => ({ showGridlines: on })),

  addComment: (c) => {
    const id = `cm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({
      comments: [...state.comments, { ...c, id, resolved: false }],
      activeCommentId: id,
      commentsEnabled: true,
    }));
    return id;
  },

  updateComment: (id, patch) =>
    set((state) => ({
      comments: state.comments.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  removeComment: (id) =>
    set((state) => {
      const rest = state.comments.filter((c) => c.id !== id);
      return {
        comments: rest,
        activeCommentId: state.activeCommentId === id ? rest[rest.length - 1]?.id ?? null : state.activeCommentId,
      };
    }),

  setActiveComment: (id) => set(() => ({ activeCommentId: id })),

  clearResolvedComments: () =>
    set((state) => ({
      comments: state.comments.filter((c) => !c.resolved),
      activeCommentId: null,
    })),

  setInkColor: (color) => set(() => ({ inkColor: color, penActive: true })),

  setInkWidth: (width) => set(() => ({ inkWidth: width, penActive: true })),

  setNotes: (index, notes) =>
    set((state) => ({
      slides: state.slides.map((s, i) => (i === index ? { ...s, notes } : s)),
    })),

  updateTextBoxText: (id, text) =>
    set((state) =>
      updateCurrentSlide(state, (s) => ({
        elements: s.elements.map((e) =>
          e.id === id && e.kind === 'textbox' ? { ...e, text } : e
        ),
      }))
    ),

  updateTableCellText: (id, r, c, text) =>
    set((state) =>
      updateCurrentSlide(state, (s) => ({
        elements: s.elements.map((e) => {
          if (e.id !== id || e.kind !== 'table') return e;
          const cells = Array.from({ length: e.rows }, (_, ri) =>
            Array.from({ length: e.cols }, (__unused, ci) =>
              e.cells && e.cells[ri] && e.cells[ri][ci] !== undefined ? e.cells[ri][ci] : ''
            )
          );
          cells[r][c] = text;
          return { ...e, cells };
        }),
      }))
    ),

  duplicateElement: () =>
    set((state) => {
      const id = state.selectedElementId;
      const el = id ? state.slides[state.activeIndex].elements.find((e) => e.id === id) : null;
      if (!el) return {};
      const copy = { ...el, id: elId(el.kind), x: el.x + 24, y: el.y + 24, rot: el.rot ?? 0 } as SlideElement;
      return {
        ...histPush(state),
        ...updateCurrentSlide(state, (s) => ({ elements: [...s.elements, copy] }), false),
        selectedElementId: copy.id,
      };
    }),

  copySelected: () =>
    set((state) => {
      const id = state.selectedElementId;
      const el = id ? state.slides[state.activeIndex].elements.find((e) => e.id === id) : null;
      if (el) clipRef.current = { ...el, id: clipRef.current?.id ?? '' };
      return {};
    }),

  pasteElement: () =>
    set((state) => {
      const clip = clipRef.current;
      if (!clip) return {};
      const copy = { ...clip, id: elId(clip.kind), x: clip.x + 16, y: clip.y + 16, rot: clip.rot ?? 0 } as SlideElement;
      return {
        ...histPush(state),
        ...updateCurrentSlide(state, (s) => ({ elements: [...s.elements, copy] }), false),
        selectedElementId: copy.id,
      };
    }),

  cutSelected: () =>
    set((state) => {
      const id = state.selectedElementId;
      const el = id ? state.slides[state.activeIndex].elements.find((e) => e.id === id) : null;
      if (!el) return {};
      clipRef.current = { ...el, id: clipRef.current?.id ?? '' };
      return {
        ...histPush(state),
        ...updateCurrentSlide(state, (s) => ({ elements: s.elements.filter((e) => e.id !== id) }), false),
        selectedElementId: null,
      };
    }),

  hasClipboard: () => !!clipRef.current,

  startShow: (from, opts) =>
    set(() => ({
      show: true,
      showFrom: Math.max(0, Math.min(from, get().slides.length - 1)),
      showLoop: opts?.loop === true,
      showPreview: opts?.preview === true,
    })),

  stopShow: () => set(() => ({ show: false, showPreview: false })),

  startRehearsal: () =>
    set((state) => ({
      slides: state.slides.map((s) => ({ ...s, advanceAfter: null })),
      rehearsalTimes: {},
      rehearsing: true,
      show: true,
      showFrom: 0,
      showLoop: false,
      showPreview: false,
      activeIndex: 0,
    })),

  recordRehearsalTime: (index, seconds) =>
    set((state) => ({
      rehearsalTimes: { ...state.rehearsalTimes, [index]: seconds },
    })),

  finishRehearsal: () =>
    set((state) => ({
      slides: state.slides.map((s, i) => {
        const t = state.rehearsalTimes[i];
        return t && t > 0 ? { ...s, advanceAfter: Math.round(t * 10) / 10 } : s;
      }),
      rehearsing: false,
      show: false,
      showPreview: false,
    })),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return {};
      const prev = state.past[state.past.length - 1];
      return {
        slides: prev.slides,
        activeIndex: prev.activeIndex,
        past: state.past.slice(0, -1),
        future: [...state.future, snapOf(state)].slice(-50),
        selectedElementId: null,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return {};
      const next = state.future[state.future.length - 1];
      return {
        slides: next.slides,
        activeIndex: next.activeIndex,
        future: state.future.slice(0, -1),
        past: [...state.past, snapOf(state)].slice(-50),
        selectedElementId: null,
      };
    }),

  loadFromApi: async () => {
    try {
      const res = await fetch('/api/v1/slides/');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        set(() => ({
          slides: data.map((s) => ({
            id: s.id,
            title: s.title ?? '',
            content: s.content ?? '',
            contentRight: s.contentRight ?? '',
            layout: s.layout ?? ('titleContent' as LayoutType),
            transition: s.transition ?? ('none' as Transition),
            animation: s.animation ?? ('none' as SlideAnimation),
            animationDuration: typeof s.animationDuration === 'number' ? s.animationDuration : 0.6,
            animationStart: s.animationStart ?? ('onClick' as 'onClick' | 'withPrevious' | 'afterPrevious'),
            bg: s.bg ?? '#ffffff',
            bgStyle: s.bgStyle,
            notes: s.notes ?? '',
            elements: Array.isArray(s.elements)
              ? (s.elements as SlideElement[]).map((e) => ({ ...e, rot: (e as { rot?: number }).rot ?? 0 }))
              : [],
            transitionDuration: typeof s.transitionDuration === 'number' ? s.transitionDuration : 0.7,
            transitionSound: s.transitionSound ?? '',
            transitionSoundLoop: Boolean(s.transitionSoundLoop),
            advanceOnClick: s.advanceOnClick !== false,
            advanceAfter: typeof s.advanceAfter === 'number' ? s.advanceAfter : null,
          })),
          activeIndex: 0,
          past: [],
          future: [],
        }));
      }
    } catch {
      void get();
    }
  },
}));

if (typeof window !== 'undefined') {
  (window as unknown as { __ppt: typeof usePresentationStore }).__ppt = usePresentationStore;
}


