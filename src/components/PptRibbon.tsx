import React, { useEffect, useRef, useState } from "react";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowIcon,
  BlankLayoutIcon,
  ChartBarIcon,
  ChartIcon,
  CheckIcon,
  CircleIcon,
  CloudIcon,
  CommentIcon,
  CopyIcon,
  CutIcon,
  DiamondIcon,
  EraserIcon,
  FindIcon,
  FontColorIcon,
  FontSizeDecIcon,
  FontSizeIncIcon,
  FormatPainterIcon,
  HeartIcon,
  HexagonIcon,
  HighlighterColorIcon,
  HighlighterIcon,
  IndentIcon,
  LayoutIcon,
  LineIcon,
  LineSpacingIcon,
  ListBulletsIcon,
  NewSlideIcon,
  NumberingIcon,
  OutdentIcon,
  PasteIcon,
  PenIcon,
  PencilIcon,
  InkToTextIcon,
  InkToShapeIcon,
  InkToMathIcon,
  LassoIcon,
  InkReplayIcon,
  CanvasIcon,
  FontsIcon,
  EffectsIcon,
  SlideSizeIcon,
  PaintIcon,
  MoreIcon,
  PictureIcon,
  RectIcon,
  RemoveFormatIcon,
  ReplaceIcon,
  ResetIcon,
  SectionLayoutIcon,
  SelectIcon,
  ShapesGalleryIcon,
  ShapesIcon,
  SpellIcon,
  StarIcon,
  TablePlusIcon,
  TextIcon,
  TitleContentLayoutIcon,
  TitleLayoutIcon,
  TriangleIcon,
  TwoContentLayoutIcon,
  TableIcon,
  ThreeDIcon,
  SmartArtIcon,
  AddinsIcon,
  ActionIcon,
  LinkIcon,
  HeaderFooterIcon,
  WordArtIcon,
  DateIcon,
  SlideNumberIcon,
  ObjectIcon,
  EquationIcon,
  SymbolIcon,
  VideoIcon,
  AudioIcon,
  ScreenRecIcon,
} from "./icons";
import {
  usePresentationStore,
  FONTS,
  FONT_SIZES,
  SHAPE_LIST,
  THEME_COLORS,
  makeChart,
  makeImage,
  makeShape,
  makeTable,
  makeTextBox,
  type ElementEffect,
  type LayoutType,
  type ShapeType,
  type SlideAnimation,
  type SlideData,
  type SlideElement,
} from "@/stores/presentationStore";
import { editorCommands, selectAllInEditable } from "@/utils/editorCommands";
import { THEMES } from "./ribbonThemes";
import FileBackstage from "./FileBackstage";
import {
saveBritslide,
  exportPdf,
  isDesktopApp,
  openBritslideFile,
  parseBritslide,
  getRecent,
  persistAutosave,
  FILENAME,
} from "@/utils/britfile";
import {
  TRANSITION_LIST,
  SOUND_LIST,
  playSoundCue,
  playTransitionSound,
  transitionName,
  type TransitionDef,
} from "@/utils/transitions";
import { openPresenterView } from "@/utils/presenterView";

const TABS = [
  "File",
  "Home",
  "Insert",
  "Draw",
  "Design",
  "Transitions",
  "Animations",
  "Slide Show",
  "Review",
  "View",
  "Help",
] as const;

type TabName = (typeof TABS)[number];

type Menu =
  | "layout"
  | "shapes"
  | "font"
  | "size"
  | "fontColor"
  | "hilite"
  | "inkColor"
  | "inkWidth"
  | "bgColor"
  | "themes"
  | "fonts"
  | "effects"
  | "bgStyles"
  | "slideSize"
  | "arrange"
  | "icons"
  | "symbols"
  | "trSound"
  | "charSpace"
  | "changeCase"
  | "lineSpacing"
  | "textEffects"
  | "zoom"
  | "thesaurus"
  | "spellPanel"
  | "animStart"
  | "animDuration"
  | "animDelay"
  | "animationPane"
  | "animMore"
  | "wordCount"
  | "quickStyles"
  | "setUpShow"
  | "find"
  | "replace"
  | "commentList"
  | "helpTopics"
  | "helpGuide"
  | "helpKeys"
  | "feedback"
  | "about"
  | "accessibility"
  | "deckInfo"
  | "file"
  | null;

const BLANK_SLIDE: SlideData = {
  id: 1,
  title: "",
  content: "",
  contentRight: "",
  layout: "blank",
  transition: "none",
  animation: "none",
  animationDuration: 0.6,
  animationStart: "onClick",
  bg: "#ffffff",
  notes: "",
  elements: [],
  transitionDuration: 0.7,
  transitionSound: "",
  transitionSoundLoop: false,
  advanceOnClick: true,
  advanceAfter: null,
};

const small = "w-9 h-8 rounded flex items-center justify-center text-gray-700 hover:bg-[#e1e7f5]";

// Keeps the text selection alive: without this, mousedown blurs the text box
// and the selection collapses before the command runs.
const keepSelection = { onMouseDown: (e: React.MouseEvent) => e.preventDefault() };


const sbtn =
  "w-[50px] h-[30px] rounded flex flex-col items-center justify-center gap-0.5 px-0.5 text-gray-700 hover:bg-[#e1e7f5] shrink-0";
const sbtnActive =
  "w-[50px] h-[30px] rounded flex flex-col items-center justify-center gap-0.5 px-0.5 text-gray-700 bg-[#d5e3f7] hover:bg-[#caddf4] shrink-0";

const boxBtn =
  "h-[30px] rounded flex items-center justify-center text-gray-700 hover:bg-[#e1e7f5]";

function Row({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center gap-0.5 ${className}`}>{children}</div>;
}

function Col({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-0.5 ${className}`}>{children}</div>;
}

function Group({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between shrink-0 pl-2 pr-2 border-r border-gray-200">
      <div className="flex items-center gap-1.5 min-h-[98px] py-1">{children}</div>
      <span className="text-[10px] text-gray-600 uppercase tracking-wide text-center pb-1 leading-tight">
        {name}
      </span>
    </div>
  );
}

function SBtn({
  label,
  active = false,
  onClick,
  btnRef,
  children,
  className = "",
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  btnRef?: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      ref={btnRef}
      title={label}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      className={`${active ? sbtnActive : sbtn} ${className}`}
    >
      <span className="h-4 flex items-center justify-center">{children}</span>
      <span className="text-[9px] leading-[10px] text-center w-full truncate">{label}</span>
    </button>
  );
}

function ThemePreview({
  bg,
  accent,
  title,
  body,
  active,
  label,
  onClick,
  decor = "none",
}: {
  bg: string;
  accent: string;
  title: string;
  body: string;
  active?: boolean;
  label: string;
  onClick: () => void;
  decor?: string;
}) {
  const line = mixWhite(body, 0.55);
  const soft = accent + "55";
  const Decor = () => {
    if (decor === "band-bottom")
      return (
        <>
          <span className="absolute left-0 bottom-0 h-[10%] w-full" style={{ backgroundColor: accent }} />
        </>
      );
    if (decor === "band-left")
      return (
        <>
          <span className="absolute left-0 top-0 h-full w-[6%]" style={{ backgroundColor: accent }} />
        </>
      );
    if (decor === "corner-bl")
      return (
        <span
          className="absolute left-[-16%] bottom-[-40%] h-[90%] w-[55%] rotate-45"
          style={{ backgroundColor: accent }}
        />
      );
    if (decor === "wedge")
      return (
        <>
          <span
            className="absolute right-[-10%] top-[-25%] h-[75%] w-[45%] rotate-[30deg]"
            style={{ backgroundColor: soft }}
          />
          <span
            className="absolute right-[-6%] top-[-6%] h-[28%] w-[32%] rotate-[30deg]"
            style={{ backgroundColor: accent }}
          />
        </>
      );
    return null;
  };
  return (
    <button
      title={label}
      onClick={onClick}
      className={`shrink-0 w-[74px] rounded overflow-hidden border bg-white hover:ring-2 hover:ring-blue-500 ${
        active ? "ring-2 ring-[#185abd]" : "border-gray-300"
      }`}
    >
      <span className="block relative w-full h-[44px] overflow-hidden" style={{ backgroundColor: bg }}>
        <span
          className="absolute left-[7%] top-[13%] h-[13%] w-[50%] rounded-[1px]"
          style={{ backgroundColor: title }}
        />
        <span className="absolute left-[7%] top-[38%] h-[6%] w-[66%]" style={{ backgroundColor: line }} />
        <span className="absolute left-[7%] top-[52%] h-[6%] w-[56%]" style={{ backgroundColor: line }} />
        <span className="absolute left-[7%] top-[66%] h-[6%] w-[60%]" style={{ backgroundColor: line }} />
        <span
          className="absolute right-[8%] top-[36%] h-[30%] w-[22%] rounded-[2px]"
          style={{ backgroundColor: accent }}
        />
        <Decor />
      </span>
      <span className="block text-[9px] leading-[12px] text-gray-600 truncate px-0.5">{label}</span>
    </button>
  );
}

function TallBtn({
  label,
  onClick,
  btnRef,
  children,
}: {
  label: string;
  onClick?: () => void;
  btnRef?: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
}) {
  return (
    <button
      ref={btnRef}
      title={label}
      onClick={onClick}
      className="w-[52px] h-[62px] rounded flex flex-col items-center justify-center gap-1 text-gray-800 hover:bg-[#e1e7f5] shrink-0"
    >
      <span className="h-6 flex items-center justify-center">{children}</span>
      <span className="text-[10px] leading-tight text-center w-full px-0.5 truncate">{label}</span>
    </button>
  );
}

function BigBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-[60px] h-[62px] rounded hover:bg-[#e1e7f5] text-gray-800 shrink-0"
    >
      <span className="h-6 flex items-center justify-center">{children}</span>
      <span className="text-[10px] mt-1 leading-tight text-center w-full px-0.5 truncate">{label}</span>
    </button>
  );
}

const VARIANT_MIXES = [
  { name: "Light", accent: 0.55, bg: 0.08, title: 0.35, body: 0.35 },
  { name: "Warm", accent: 0.2, bg: 0.1, title: 0.25, body: 0.2 },
  { name: "Cool", accent: 0.2, bg: 0.06, title: 0.3, body: 0.25 },
  { name: "Deep", accent: 0.1, bg: 0.22, title: 0.45, body: 0.4 },
];

function TransitionThumb({
  def,
  active,
  playing: forcePlaying,
  onClick,
  onPreview,
}: {
  def: TransitionDef;
  active: boolean;
  playing?: boolean;
  onClick: () => void;
  onPreview: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [tick, setTick] = useState(0);
  const playing = (hover || forcePlaying === true) && def.id !== "none";
  useEffect(() => {
    if (hover) setTick((t) => t + 1);
  }, [hover]);
  return (
    <button
      title={`${def.name}${def.stars ? ` (${"★".repeat(def.stars)}${"☆".repeat(4 - def.stars)})` : ""}`}
      onClick={onClick}
      onDoubleClick={onPreview}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`w-[40px] rounded border p-0.5 shrink-0 ${
        active ? "border-[#185abd] ring-1 ring-[#185abd]" : "border-gray-300 hover:border-blue-500"
      }`}
    >
      <span
        key={`${def.id}-${tick}`}
        className={`block relative w-full h-[26px] overflow-hidden rounded-[2px] ${
          playing ? `tr tr-${def.id} tr-anim` : ""
        }`}
        style={
          playing
            ? ({ "--tr-dur": "1.1s" } as React.CSSProperties)
            : { background: "linear-gradient(135deg,#ffffff 0%,#dfe6ef 100%)" }
        }
      >
        <span className="absolute left-[9%] top-[14%] h-[13%] w-[52%] rounded-[1px] bg-[#8a94a6]" />
        <span className="absolute left-[9%] top-[40%] h-[8%] w-[70%] rounded-[1px] bg-[#c3ccd9]" />
        <span className="absolute left-[9%] top-[56%] h-[8%] w-[60%] rounded-[1px] bg-[#c3ccd9]" />
        <span className="absolute left-[9%] top-[72%] h-[8%] w-[64%] rounded-[1px] bg-[#c3ccd9]" />
        <span className="absolute right-[8%] bottom-[10%] h-[26%] w-[20%] rounded-[1px] bg-[#2f5b8f]" />
      </span>
      <span className="block text-[7px] leading-[9px] text-gray-600 truncate text-center">
        {def.name}
      </span>
    </button>
  );
}

const ANIMATION_LIST: { id: SlideAnimation; name: string; cls: string; group: string }[] = [
  { id: "none", name: "None", cls: "none", group: "None" },
  { id: "appear", name: "Appear", cls: "appear", group: "Entrance" },
  { id: "fade", name: "Fade", cls: "fade", group: "Subtle" },
  { id: "flyIn", name: "Fly In", cls: "flyIn", group: "Entrance" },
  { id: "floatIn", name: "Float In", cls: "floatIn", group: "Subtle" },
  { id: "wipe", name: "Wipe", cls: "wipe", group: "Subtle" },
  { id: "zoom", name: "Zoom", cls: "zoom", group: "Subtle" },
  { id: "split", name: "Split", cls: "split", group: "Subtle" },
  { id: "push", name: "Push", cls: "push", group: "Exciting" },
  { id: "glitter", name: "Glitter", cls: "glitter", group: "Exciting" },
  { id: "spin", name: "Spin", cls: "spin", group: "Exciting" },
  { id: "bounce", name: "Bounce", cls: "bounce", group: "Exciting" },
  { id: "pulse", name: "Pulse", cls: "pulse", group: "Dynamic Content" },
];

const QUICK_STYLES: {
  name: string;
  fill?: string;
  outline?: string;
  outlineWidth?: number;
  effect?: ElementEffect;
  textColor?: string;
}[] = [
  { name: "Accent 1", fill: "#4472c4", outline: "#2f5597", outlineWidth: 1 },
  { name: "Accent 2", fill: "#ed7d31", outline: "#c55a11", outlineWidth: 1 },
  { name: "Accent 3", fill: "#a5a5a5", outline: "#7f7f7f", outlineWidth: 1 },
  { name: "Green", fill: "#70ad47", outline: "#507e32", outlineWidth: 1 },
  { name: "Light Fill", fill: "#dae3f3", outline: "#8faadc", outlineWidth: 1 },
  { name: "Dark Fill", fill: "#1f3864", outline: "#000000", outlineWidth: 1 },
  { name: "Outlined", fill: "transparent", outline: "#4472c4", outlineWidth: 2.5 },
  { name: "Shadow", fill: "#4472c4", outline: "#2f5597", outlineWidth: 1, effect: { boxShadow: "4px 4px 9px rgba(0,0,0,0.4)" } },
  { name: "Glow", fill: "#4472c4", outline: "#2f5597", outlineWidth: 1, effect: { filter: "drop-shadow(0 0 8px #4472c4)" } },
  { name: "Reflection", fill: "#4472c4", outline: "#2f5597", outlineWidth: 1, effect: { reflect: true } },
  { name: "Bevel", fill: "#4472c4", outline: "#2f5597", outlineWidth: 1, effect: { boxShadow: "inset 2px 2px 3px rgba(255,255,255,0.75), inset -2px -2px 3px rgba(0,0,0,0.45)" } },
  { name: "Text Accent", textColor: "#4472c4" },
];

const TEXT_EFFECTS: { group: string; items: { name: string; css: Record<string, string> }[] }[] = [
  {
    group: "Shadow",
    items: [
      { name: "No Shadow", css: { "text-shadow": "none" } },
      { name: "Soft", css: { "text-shadow": "1px 1px 2px rgba(0,0,0,0.55)" } },
      { name: "Offset", css: { "text-shadow": "2px 2px 0 rgba(0,0,0,0.55)" } },
      { name: "Far", css: { "text-shadow": "4px 4px 6px rgba(0,0,0,0.5)" } },
    ],
  },
  {
    group: "Reflection",
    items: [
      { name: "No Reflection", css: { "-webkit-box-reflect": "none" } },
      {
        name: "Tight",
        css: {
          display: "inline-block",
          "-webkit-box-reflect": "below 0px linear-gradient(transparent, rgba(255,255,255,0.5))",
        },
      },
      {
        name: "Half",
        css: {
          display: "inline-block",
          "-webkit-box-reflect": "below 1px linear-gradient(transparent 55%, rgba(255,255,255,0.6))",
        },
      },
    ],
  },
  {
    group: "Glow",
    items: [
      { name: "No Glow", css: { "text-shadow": "none" } },
      { name: "Soft", css: { "text-shadow": "0 0 4px currentColor" } },
      { name: "Strong", css: { "text-shadow": "0 0 4px currentColor, 0 0 12px currentColor" } },
      { name: "Neon", css: { "text-shadow": "0 0 3px #fff, 0 0 8px #6aa8ff, 0 0 16px #4472c4" } },
    ],
  },
  {
    group: "Bevel",
    items: [
      { name: "None", css: { "text-shadow": "none" } },
      {
        name: "Emboss",
        css: { "text-shadow": "-1px -1px 0 rgba(255,255,255,0.9), 1px 1px 0 rgba(0,0,0,0.5)" },
      },
      {
        name: "Cool",
        css: { "text-shadow": "1px 1px 0 #fff, -1px -1px 0 rgba(0,0,0,0.45), 0 0 3px rgba(0,0,0,0.3)" },
      },
    ],
  },
  {
    group: "3-D Rotation",
    items: [
      { name: "None", css: {} },
      { name: "Offset Deep", css: { "text-shadow": "1px 1px 0 #b9c4d6, 2px 2px 0 #93a3bd, 3px 3px 0 #6d7f9d, 4px 4px 6px rgba(0,0,0,0.4)" } },
      { name: "Tilt", css: { display: "inline-block", transform: "skewY(-6deg) scaleY(1.05)" } },
    ],
  },
  {
    group: "Outline",
    items: [
      { name: "No Outline", css: { "-webkit-text-stroke": "0" } },
      { name: "Thin", css: { "-webkit-text-stroke": "1px currentColor" } },
      { name: "Thick", css: { "-webkit-text-stroke": "2px currentColor" } },
      { name: "Hollow", css: { "-webkit-text-stroke": "1.5px currentColor", color: "transparent" } },
    ],
  },
  {
    group: "WordArt",
    items: [
      {
        name: "Gradient",
        css: {
          display: "inline-block",
          "background-image": "linear-gradient(90deg, #d3306e, #f59e0b, #22c55e, #1d4ed8)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          color: "transparent",
        },
      },
      { name: "Metallic", css: { display: "inline-block", "background-image": "linear-gradient(180deg,#e6e6e6,#9aa3ad,#f2f2f2,#6b7280)", "-webkit-background-clip": "text", "background-clip": "text", color: "transparent" } },
    ],
  },
];


function AnimationThumb({
  label,
  cls,
  active,
  onClick,
}: {
  label: string;
  cls: string;
  active: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (hover) setTick((t) => t + 1);
  }, [hover]);
  return (
    <button
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`w-[42px] shrink-0 rounded border p-0.5 ${
        active ? "border-[#185abd] ring-1 ring-[#185abd]" : "border-gray-300 hover:border-blue-500"
      }`}
    >
      <span className="relative block h-[26px] overflow-hidden rounded-[2px] bg-white border border-gray-200">
        <span
          key={`${cls}-${tick}`}
          className={`absolute left-1 top-1 w-4 h-1.5 rounded-sm bg-[#4472c4] anim-${cls}`}
        />
        <span className="absolute left-1 top-4 w-6 h-1 rounded-sm bg-[#9dc3e6]" />
      </span>
      <span className="block text-[9px] text-center text-gray-700 truncate mt-0.5">{label}</span>
    </button>
  );
}

function Chip({
  label,
  onClick,
  active = false,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-9 rounded border text-[11px] ${
        active
          ? "border-[#185abd] bg-[#d5e3f7] text-[#185abd]"
          : "border-gray-300 hover:border-blue-500 hover:text-blue-600"
      }`}
    >
      {label}
    </button>
  );
}

const SHAPE_ICONS: Record<ShapeType, React.FC<{ size?: number; className?: string }>> = {
  rect: RectIcon,
  circle: CircleIcon,
  triangle: TriangleIcon,
  diamond: DiamondIcon,
  arrow: ArrowIcon,
  line: LineIcon,
  star: StarIcon,
  hexagon: HexagonIcon,
  cloud: CloudIcon,
  heart: HeartIcon,
  canvas: CanvasIcon,
};

const LAYOUTS: { key: LayoutType; label: string; icon: React.FC<any> }[] = [
  { key: "title", label: "Title Slide", icon: TitleLayoutIcon },
  { key: "titleContent", label: "Title and Content", icon: TitleContentLayoutIcon },
  { key: "twoContent", label: "Two Content", icon: TwoContentLayoutIcon },
  { key: "blank", label: "Blank", icon: BlankLayoutIcon },
  { key: "sectionHeader", label: "Section Header", icon: SectionLayoutIcon },
];

/** Small offline thesaurus used by Review › Thesaurus. */
const THESAURUS: Record<string, string[]> = {
  good: ["great", "excellent", "fine", "nice", "superior", "positive"],
  bad: ["poor", "terrible", "awful", "inferior", "negative", "harmful"],
  big: ["large", "huge", "enormous", "massive", "vast"],
  small: ["little", "tiny", "compact", "miniature"],
  fast: ["quick", "rapid", "swift", "speedy"],
  slow: ["gradual", "sluggish", "leisurely"],
  happy: ["glad", "cheerful", "pleased", "delighted"],
  sad: ["unhappy", "sorrowful", "downcast"],
  smart: ["clever", "bright", "intelligent", "shrewd"],
  important: ["significant", "crucial", "essential", "key"],
  help: ["assist", "support", "aid"],
  show: ["display", "present", "exhibit"],
  make: ["create", "build", "produce"],
  use: ["utilize", "employ", "apply"],
  start: ["begin", "commence", "launch"],
  end: ["finish", "complete", "conclude"],
  new: ["fresh", "recent", "modern"],
  old: ["aged", "former", "outdated"],
};

const INK_COLORS = ["#c00000", "#0070c0", "#00b050", "#7030a0", "#000000", "#ffc000"];
const TEXT_COLORS = ["#000000", "#7f7f7f", "#c00000", "#0070c0", "#00b050", "#7030a0", "#ff8000"];
const HILITE_COLORS = ["#ffff00", "#ffe172", "#c6e0b4", "#ddebf7", "#ffd8d8"];


const mixWhite = (hex: string, t: number) => {
  const a = parseInt(hex.slice(1), 16);
  const r = Math.round(((a >> 16) & 255) + (255 - ((a >> 16) & 255)) * t);
  const g = Math.round(((a >> 8) & 255) + (255 - ((a >> 8) & 255)) * t);
  const b = Math.round((a & 255) + (255 - (a & 255)) * t);
  return `#${(((r << 16) | (g << 8) | b) & 0xffffff).toString(16).padStart(6, "0")}`;
};
const mixHex = (hex: string, target: string, t: number) => {
  const a = parseInt(hex.slice(1), 16);
  const tg = parseInt(target.slice(1), 16);
  const r = Math.round(((a >> 16) & 255) + (((tg >> 16) & 255) - ((a >> 16) & 255)) * t);
  const g = Math.round(((a >> 8) & 255) + (((tg >> 8) & 255) - ((a >> 8) & 255)) * t);
  const b = Math.round((a & 255) + ((tg & 255) - (a & 255)) * t);
  return `#${(((r << 16) | (g << 8) | b) & 0xffffff).toString(16).padStart(6, "0")}`;
};

export default function PptRibbon() {
  const activeTab = usePresentationStore((s) => s.activeTab);
  const setActiveTab = usePresentationStore((s) => s.setActiveTab);
  const setActiveSlide = usePresentationStore((s) => s.setActiveSlide);
  const activeIndex = usePresentationStore((s) => s.activeIndex);
  const format = usePresentationStore((s) => s.format);
const slides = usePresentationStore((s) => s.slides);
  const slideW = usePresentationStore((s) => s.slideW);
  const slideH = usePresentationStore((s) => s.slideH);
  const insertTool = usePresentationStore((s) => s.insertTool);
  const setInsertTool = usePresentationStore((s) => s.setInsertTool);
  const insertElement = usePresentationStore((s) => s.insertElement);
  const insertElements = usePresentationStore((s) => s.insertElements);
  const selectElement = usePresentationStore((s) => s.selectElement);
  const addSlide = usePresentationStore((s) => s.addSlide);
  const duplicateSlide = usePresentationStore((s) => s.duplicateSlide);
  const deleteSlide = usePresentationStore((s) => s.deleteSlide);
  const setLayout = usePresentationStore((s) => s.setLayout);
  const setTransition = usePresentationStore((s) => s.setTransition);
  const setElementAnimation = usePresentationStore((s) => s.setElementAnimation);
  const setElementAnimationDuration = usePresentationStore((s) => s.setElementAnimationDuration);
  const setElementAnimationDelay = usePresentationStore((s) => s.setElementAnimationDelay);
  const setElementAnimationStart = usePresentationStore((s) => s.setElementAnimationStart);
  const applyElementAnimationToAll = usePresentationStore((s) => s.applyElementAnimationToAll);
  const removeElementAnimation = usePresentationStore((s) => s.removeElementAnimation);
  const previewElementAnimation = usePresentationStore((s) => s.previewElementAnimation);
  const setThemeColor = usePresentationStore((s) => s.setThemeColor);
  const slideBg = usePresentationStore(
    (s) => s.slides[s.activeIndex]?.bg ?? "#ffffff"
  );
  const applyTheme = usePresentationStore((s) => s.applyTheme);
  const applyVariant = usePresentationStore((s) => s.applyVariant);
  const themeAccent = usePresentationStore((s) => s.themeAccent);
  const designFont = usePresentationStore((s) => s.designFont);
  const designTitleColor = usePresentationStore((s) => s.designTitleColor);
  const designBodyColor = usePresentationStore((s) => s.designBodyColor);
  const themeDecor = usePresentationStore((s) => s.themeDecor);
  const themeName = usePresentationStore((s) => s.themeName);
  const printTheme = {
    accent: themeAccent,
    decor: themeDecor,
    title: designTitleColor,
    body: designBodyColor,
    font: designFont,
  };
  const setDesignFont = usePresentationStore((s) => s.setDesignFont);
  const setBgStyle = usePresentationStore((s) => s.setBgStyle);
  const setComments = usePresentationStore((s) => s.setComments);
  const commentsEnabled = usePresentationStore((s) => s.commentsEnabled);
  const comments = usePresentationStore((s) => s.comments);
  const activeCommentId = usePresentationStore((s) => s.activeCommentId);
  const addComment = usePresentationStore((s) => s.addComment);
  const setActiveComment = usePresentationStore((s) => s.setActiveComment);
  const clearResolvedComments = usePresentationStore((s) => s.clearResolvedComments);
  const bringForward = usePresentationStore((s) => s.bringForward);
  const sendBackward = usePresentationStore((s) => s.sendBackward);
  const removeElement = usePresentationStore((s) => s.removeElement);
  const selectedElementId = usePresentationStore((s) => s.selectedElementId);
  const activeTb = (() => {
    const found = slides[activeIndex]?.elements.find(
      (el) => el.id === selectedElementId && el.kind === "textbox"
    );
    return found && found.kind === "textbox" ? found : null;
  })();
  const setInkColor = usePresentationStore((s) => s.setInkColor);
  const inkColor = usePresentationStore((s) => s.inkColor);
  const inkWidth = usePresentationStore((s) => s.inkWidth);
  const setInkWidth = usePresentationStore((s) => s.setInkWidth);
  const startShow = usePresentationStore((s) => s.startShow);
  const startRehearsal = usePresentationStore((s) => s.startRehearsal);
  const applyTransitionToAll = usePresentationStore((s) => s.applyTransitionToAll);
  const setTransitionDuration = usePresentationStore((s) => s.setTransitionDuration);
  const setTransitionSound = usePresentationStore((s) => s.setTransitionSound);
  const setTransitionSoundLoop = usePresentationStore((s) => s.setTransitionSoundLoop);
  const setAdvanceOnClick = usePresentationStore((s) => s.setAdvanceOnClick);
  const setAdvanceAfter = usePresentationStore((s) => s.setAdvanceAfter);
  const replayInk = usePresentationStore((s) => s.replayInk);
  const zoom = usePresentationStore((s) => s.zoom);
  const setZoom = usePresentationStore((s) => s.setZoom);
  const zoomIn = usePresentationStore((s) => s.zoomIn);
  const zoomOut = usePresentationStore((s) => s.zoomOut);
  const viewMode = usePresentationStore((s) => s.viewMode);
  const setViewMode = usePresentationStore((s) => s.setViewMode);
  const propertiesOpen = usePresentationStore((s) => s.propertiesOpen);
  const setPropertiesOpen = usePresentationStore((s) => s.setPropertiesOpen);
  const [loopShow, setLoopShow] = useState(false);
  const showRuler = usePresentationStore((s) => s.showRuler);
  const showGridlines = usePresentationStore((s) => s.showGridlines);
  const setShowRuler = usePresentationStore((s) => s.setShowRuler);
  const setShowGridlines = usePresentationStore((s) => s.setShowGridlines);
  const selectedAnim =
    slides[activeIndex]?.elements.find((e) => e.id === selectedElementId)?.animation ?? null;
  const animDuration = selectedAnim?.duration ?? 0.6;
  const animDelay = selectedAnim?.delay ?? 0;
  const animStart = selectedAnim?.start ?? "onClick";

  const startShowPreview = () => startShow(activeIndex, { preview: true });

  const editNotesPage = () => {
    const s = slides[activeIndex];
    if (!s) return;
    const notes = window.prompt(
      `Speaker notes — slide ${activeIndex + 1}:`,
      s.notes ?? ""
    );
    if (notes === null) return;
    usePresentationStore.getState().setNotes(activeIndex, notes);
    showToast(`Notes saved for slide ${activeIndex + 1}`);
  };
  const previewTransition = usePresentationStore((s) => s.previewTransition);
  const previewingTransition = usePresentationStore((s) => s.previewingTransition);
  const clearPreview = usePresentationStore((s) => s.clearPreview);

  const [open, setOpen] = useState<Menu>(null);
  const [backstage, setBackstage] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const picInput = useRef<HTMLInputElement>(null);
  const openInput = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuAnchor = useRef<Partial<Record<Exclude<Menu, null>, HTMLButtonElement | null>>>({});
  const [panelLeft, setPanelLeft] = useState(12);

  const [findQuery, setFindQuery] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [findCase, setFindCase] = useState(false);
  const [findResult, setFindResult] = useState("");

  const stripTags = (html: string) =>
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&");

  const slideHaystacks = () =>
    slides.map((s, i) => ({
      index: i,
      parts: [
        stripTags(s.title),
        stripTags(s.content),
        stripTags(s.contentRight),
        s.notes,
        ...s.elements.map((el) =>
          "text" in el ? stripTags(String((el as { text?: string }).text ?? "")) : ""
        ),
      ],
    }));

  const findCursor = useRef({ slide: -1, part: -1, offset: -1 });
  const feedbackRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!backstage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBackstage(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [backstage]);

  const runFind = () => {
    const q = findQuery;
    if (!q.trim()) {
      setFindResult("Type something to search for.");
      return;
    }
    const needle = findCase ? q : q.toLowerCase();
    const rows = slideHaystacks();
    const { slide, part, offset } = findCursor.current;
    const startSlide = slide < 0 ? 0 : slide;
    for (let si = startSlide; si < rows.length; si++) {
      const row = rows[si];
      const startPart = si === startSlide ? Math.max(0, part) : 0;
      const startOff = si === startSlide && part === row.parts.length - 1 ? offset + 1 : 0;
      for (let pi = startPart; pi < row.parts.length; pi++) {
        const raw = row.parts[pi];
        const hay = findCase ? raw : raw.toLowerCase();
        const at = hay.indexOf(needle, pi === startPart ? startOff : 0);
        if (at >= 0) {
          findCursor.current = { slide: si, part: pi, offset: at };
          setActiveSlide(si);
          setOpen(null);
          setFindResult(
            `Found “${q}” on slide ${si + 1}${
              si === rows.length - 1 && pi === row.parts.length - 1 ? " (end of search)" : ""
            }.`
          );
          return;
        }
      }
    }
    findCursor.current = { slide: -1, part: -1, offset: -1 };
    setFindResult(`“${q}” was not found in this presentation.`);
  };

  const runReplace = () => {
    const q = findQuery;
    if (!q.trim()) {
      setFindResult("Type the text you want to replace.");
      return;
    }
    let total = 0;
    const next = slides.map((s) => {
      const copy = { ...s, elements: s.elements.map((el) => ({ ...el })) };
      const swap = (v: string) => {
        if (!v) return v;
        const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), findCase ? "g" : "gi");
        const hits = v.match(re);
        if (hits) total += hits.length;
        return v.replace(re, replaceWith);
      };
      copy.title = swap(copy.title);
      copy.content = swap(copy.content);
      copy.contentRight = swap(copy.contentRight);
      copy.notes = swap(copy.notes);
      copy.elements = copy.elements.map((el) =>
        "text" in el && typeof (el as { text?: string }).text === "string"
          ? ({ ...el, text: swap(String((el as { text?: string }).text)) } as SlideElement)
          : (el as SlideElement)
      );
      return copy;
    });
    usePresentationStore.setState({ slides: next });
    findCursor.current = { slide: -1, part: -1, offset: -1 };
    setOpen(null);
    setFindResult(
      total === 0
        ? `“${q}” was not found — nothing replaced.`
        : `Replaced ${total} occurrence${total === 1 ? "" : "s"} of “${q}”.`
    );
  };

  const SPELLING_RULES: { re: RegExp; msg: string }[] = [
    { re: /\bteh\b/gi, msg: "“teh” — did you mean “the”?" },
    { re: /\brecieve\b/gi, msg: "“recieve” — did you mean “receive”?" },
    { re: /\bseperate\b/gi, msg: "“seperate” — did you mean “separate”?" },
    { re: /\bdefinately\b/gi, msg: "“definately” — did you mean “definitely”?" },
    { re: /\boccured\b/gi, msg: "“occured” — did you mean “occurred”?" },
    { re: /\bwich\b/gi, msg: "“wich” — did you mean “which”?" },
    { re: /\bthier\b/gi, msg: "“thier” — did you mean “their”?" },
    { re: /\bthankyou\b/gi, msg: "“thankyou” — did you mean “thank you”?" },
    { re: /\bPowerpint\b/gi, msg: "“Powerpint” — did you mean “PowerPoint”?" },
    { re: /\bpowerpiont\b/gi, msg: "“powerpiont” — did you mean “PowerPoint”?" },
    { re: /\bslidees\b/gi, msg: "“slidees” — did you mean “slides”?" },
    { re: /\bpresentationn\b/gi, msg: "“presentationn” — did you mean “presentation”?" },
  ];

  const runSpellCheck = () => {
    const found: { id: string; slide: number; msg: string }[] = [];
    slides.forEach((s, i) => {
      const text = [stripTags(s.title), stripTags(s.content), stripTags(s.contentRight), s.notes].join("\n");
      SPELLING_RULES.forEach((rule, ri) => {
        const hits = text.match(rule.re);
        if (hits) found.push({ id: `s${i}-${ri}`, slide: i, msg: rule.msg });
      });
    });
    return found;
  };

  const [reviewList, setReviewList] = useState<
    { id: string; slide: number; msg: string }[]
  >([]);

  const startComment = () => {
    const text = window.prompt("New comment for this slide:", "");
    if (text === null || !text.trim()) {
      showToast("Comment cancelled");
      return;
    }
    addComment({ slide: activeIndex, x: 604, y: 8, text: text.trim(), author: "Reviewer" });
    showToast("Comment added to this slide");
  };

  const cycleComment = (dir: -1 | 1) => {
    const list = comments;
    if (list.length === 0) {
      showToast("No comments yet — use New Comment");
      return;
    }
    const idx = list.findIndex((c) => c.id === activeCommentId);
    const next = list[(((idx + dir) % list.length) + list.length) % list.length];
    setActiveSlide(next.slide);
    setActiveComment(next.id);
    setComments(true);
    showToast(`Comment on slide ${next.slide + 1}: ${next.text || "(empty)"}`);
  };

  const countWords = () =>
    slides.reduce((n, s) => {
      const t = [stripTags(s.title), stripTags(s.content), stripTags(s.contentRight), s.notes].join(" ");
      return n + (t.trim() ? t.trim().split(/\s+/).length : 0);
    }, 0);

  const accessibilityIssues = () => {
    const out: { id: string; slide: number; msg: string; level: "error" | "warning" }[] = [];
    slides.forEach((s, i) => {
      const textish = [stripTags(s.title), stripTags(s.content), stripTags(s.contentRight)].join("").trim();
      if (s.layout !== "blank" && !stripTags(s.title).trim())
        out.push({ id: `t${i}`, slide: i, msg: "Slide has no title", level: "warning" });
      const hasContentEl = s.elements.some((e) => e.kind !== "shape" || (e.text ?? "").trim());
      if (!textish && !hasContentEl)
        out.push({ id: `e${i}`, slide: i, msg: "Slide is empty", level: "warning" });
      s.elements.forEach((el, ei) => {
        if (el.kind === "image")
          out.push({
            id: `a${i}-${ei}`,
            slide: i,
            msg: "Picture is missing alternative text",
            level: "error",
          });
      });
    });
    return out;
  };

  const showToast = (msg: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const formatPaintRef = useRef<Record<string, string> | null>(null);
  const [painterArmed, setPainterArmed] = useState(false);

  const captureFormat = (el: HTMLElement): Record<string, string> => {
    const cs = window.getComputedStyle(el);
    const decl: Record<string, string> = {
      "font-family": cs.fontFamily,
      "font-size": cs.fontSize,
      "font-weight": cs.fontWeight,
      "font-style": cs.fontStyle,
      color: cs.color,
      "letter-spacing": cs.letterSpacing,
      "line-height": cs.lineHeight,
    };
    if (cs.textDecorationLine && cs.textDecorationLine !== "none")
      decl["text-decoration"] = cs.textDecorationLine;
    if (cs.textShadow && cs.textShadow !== "none") decl["text-shadow"] = cs.textShadow;
    return decl;
  };

  const formatPainter = () => {
    if (painterArmed && formatPaintRef.current) {
      const active = document.activeElement as HTMLElement | null;
      if (!active?.isContentEditable) {
        showToast("Click into text, then click Format Painter to apply");
        return;
      }
      const ok = editorCommands.styleSelection(formatPaintRef.current);
      formatPaintRef.current = null;
      setPainterArmed(false);
      showToast(ok ? "Format applied" : "Nothing to apply the format to");
      return;
    }
    const active = document.activeElement as HTMLElement | null;
    let source: HTMLElement | null = null;
    if (active?.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const n = sel.getRangeAt(0).startContainer;
        source = n.nodeType === Node.ELEMENT_NODE ? (n as HTMLElement) : n.parentElement;
      }
    }
    if (!source && selectedElementId) {
      source = document.querySelector<HTMLElement>(
        `[data-element-id="${selectedElementId}"],[data-textbox-id="${selectedElementId}"]`
      );
    }
    if (!source) {
      showToast("Click in formatted text or select an object first");
      return;
    }
    formatPaintRef.current = captureFormat(source);
    setPainterArmed(true);
    showToast("Format copied — select text, then click Format Painter to apply");
  };

  const applyElementEffect = (kind: string) => {
    setOpen(null);
    if (!selectedElementId) {
      showToast(`Select an object on the slide, then apply ${kind}`);
      return;
    }
    const map: Record<string, ElementEffect> = {
      Shadow: { boxShadow: "6px 6px 10px rgba(0,0,0,0.45)" },
      Glow: { filter: `drop-shadow(0 0 8px ${themeAccent})` },
      Reflection: { reflect: true },
      "Soft Edges": { filter: "blur(1.4px)" },
      Bevel: {
        boxShadow:
          "inset 2px 2px 3px rgba(255,255,255,0.75), inset -2px -2px 3px rgba(0,0,0,0.45)",
      },
      "3-D Format": {
        boxShadow: "5px 7px 13px rgba(0,0,0,0.5)",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))",
      },
    };
    const effect = map[kind] ?? {};
    usePresentationStore.getState().updateElement(selectedElementId, {
      effect,
    } as Partial<SlideElement>);
    showToast(`${kind} applied to the selected object`);
  };

  const insert3DModel = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fbcf5"/><stop offset="1" stop-color="#4a80d0"/></linearGradient>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f5aa8"/><stop offset="1" stop-color="#24478a"/></linearGradient>
    <linearGradient id="r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b8ed6"/><stop offset="1" stop-color="#3f6fbf"/></linearGradient>
  </defs>
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 100 108" to="360 100 108" dur="7s" repeatCount="indefinite"/>
    <polygon points="100,28 172,68 100,108 28,68" fill="url(#t)"/>
    <polygon points="28,68 100,108 100,180 28,140" fill="url(#l)"/>
    <polygon points="172,68 100,108 100,180 172,140" fill="url(#r)"/>
  </g>
</svg>`;
    const src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    insertElement(makeImage(src));
    showToast("3D model inserted — it rotates on the slide");
  };

  const applyQuickStyle = (q: (typeof QUICK_STYLES)[number]) => {
    const id = selectedElementId;
    if (!id) {
      showToast("Select a shape or text box first, then choose a Quick Style");
      return;
    }
    const el = slides[activeIndex]?.elements.find((e) => e.id === id);
    if (!el) return;
    const patch: Record<string, unknown> = {};
    if (el.kind === "shape") {
      if (q.fill) patch.color = q.fill;
      if (q.outline) patch.outline = q.outline;
      if (q.outlineWidth != null) patch.outlineWidth = q.outlineWidth;
      if (q.effect) patch.effect = q.effect;
    } else if (el.kind === "textbox") {
      if (q.textColor) patch.color = q.textColor;
      if (q.fill && q.fill !== "transparent") patch.fill = q.fill;
      if (q.effect) patch.effect = q.effect;
    } else {
      if (q.effect) patch.effect = q.effect;
    }
    usePresentationStore.getState().updateElement(id, patch as Partial<SlideElement>);
    setOpen(null);
    showToast(`Quick Style "${q.name}" applied`);
  };

  const setElementAction = () => {
    const target = window.prompt("Action — enter a slide number (e.g. 3) or a web address:", "");
    if (target === null || !target.trim()) return;
    const t = target.trim();
    const isSlide = /^\d+$/.test(t);
    const value = isSlide ? t : /^https?:\/\//i.test(t) ? t : `https://${t}`;
    if (selectedElementId) {
      usePresentationStore.getState().updateElement(selectedElementId, {
        action: { kind: isSlide ? "slide" : "url", value },
      } as Partial<SlideElement>);
      showToast(
        isSlide
          ? `Action set: jump to slide ${t} when the object is clicked`
          : `Action set: open ${value} when the object is clicked`
      );
      return;
    }
    const active = document.activeElement as HTMLElement | null;
    if (active?.isContentEditable) {
      document.execCommand("createLink", false, value);
      showToast("Action applied to the selected text");
      return;
    }
    showToast("Select an object or some text first, then choose Action");
  };



  const anchor = (m: Exclude<Menu, null>) => (el: HTMLButtonElement | null) => {
    menuAnchor.current[m] = el;
  };

  const toggleMenu = (m: Exclude<Menu, null>) =>
    setOpen((cur) => {
      if (cur === m) return null;
      const wrap = wrapRef.current;
      const el = menuAnchor.current[m];
      if (wrap && el) {
        const wr = wrap.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        setPanelLeft(Math.max(8, Math.min(r.left - wr.left + r.width / 2 - 40, wr.width - 180)));
      } else {
        setPanelLeft(12);
      }
      return m;
    });

  const handlePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      insertElement(makeImage(String(reader.result)));
      showToast("Picture inserted");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const themeInput = useRef<HTMLInputElement>(null);
  const handleThemeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result)) as Record<string, unknown>;
        const accent = String(raw.accent ?? raw.themeAccent ?? "");
        if (!/^#[0-9a-f]{3,8}$/i.test(accent)) throw new Error("bad theme");
        applyTheme({
          accent,
          bg: String(raw.bg ?? "#ffffff"),
          title: String(raw.title ?? "#1f3864"),
          body: String(raw.body ?? "#404040"),
          decor: typeof raw.decor === "string" ? raw.decor : "none",
          name: typeof raw.name === "string" ? raw.name : file.name.replace(/\.json$/i, ""),
        });
        showToast(`Theme “${raw.name ?? file.name}” loaded from file`);
      } catch {
        showToast("That file is not a valid theme (.json with an accent color)");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const escHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const focusTextBox = (bx: SlideElement) => {
    insertElement(bx);
    selectElement(bx.id);
    const focusIt = () => {
      const node = document.querySelector<HTMLElement>(`[data-textbox-id="${bx.id}"]`);
      if (!node) return;
      node.focus();
      try {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch {
        /* noop */
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(focusIt));
  };

  const insertSmartArt = () => {
    const labels = ["Step 1", "Step 2", "Step 3", "Step 4"];
    const els = labels.map((label, i) =>
      makeShape({
        type: "rect",
        x: 40 + i * 190,
        y: 185,
        w: 140,
        h: 62,
        color: "#4472c4",
        text: label,
        outline: "#2f5aa8",
        outlineWidth: 1,
        z: i + 1,
      })
    );
    for (let i = 0; i < 3; i++) {
      els.push(
        makeShape({
          type: "arrow",
          x: 182 + i * 190,
          y: 206,
          w: 45,
          h: 22,
          color: "#7f7f7f",
          text: "",
          outline: "#7f7f7f",
          outlineWidth: 1,
          z: i + 4,
        })
      );
    }
    insertElements(els);
    showToast("SmartArt added — click + double-click any shape to edit its text");
  };

  const insertHyperlink = () => {
    const url = window.prompt("Hyperlink URL:", "https://");
    if (!url) return;
    const label = window.prompt("Display text:", url) || url;
    const active = document.activeElement as HTMLElement | null;
    if (active?.isContentEditable) {
      document.execCommand("createLink", false, url);
      showToast("Hyperlink added to the selected text");
    } else {
      focusTextBox(
        makeTextBox(
          300,
          200,
          `<span style="color:#0563c1;text-decoration:underline">${escHtml(label)}</span>`,
          "Calibri",
          18,
          "#0563c1",
          "transparent",
          240,
          46
        )
      );
      showToast("Hyperlink text box added");
    }
  };

  const insertHeaderFooter = () => {
    const text = window.prompt("Footer text:", "Your footer text");
    if (text === null || !text.trim()) return;
    focusTextBox(makeTextBox(60, 424, escHtml(text.trim()), "Calibri", 12, "#595959", "transparent", 300, 26));
    showToast("Footer added at the bottom of the slide");
  };

  const insertWordArt = () => {
    const text = window.prompt("WordArt text:", "Your Text Here");
    if (text === null || !text.trim()) return;
    focusTextBox(makeTextBox(250, 160, escHtml(text.trim()), "Arial Black", 42, "#0072c6", "#e8f2fb", 380, 96));
    showToast("WordArt added — resize or add an outline in the Properties panel");
  };

  const insertDate = () => {
    const d = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    focusTextBox(makeTextBox(690, 12, escHtml(d), "Calibri", 12, "#595959", "transparent", 124, 22));
    showToast("Date & time added (top-right)");
  };

  const insertSlideNumber = () => {
    focusTextBox(makeTextBox(762, 430, String(activeIndex + 1), "Calibri", 12, "#595959", "transparent", 52, 22));
    showToast("Slide number added at the bottom-right, like PowerPoint");
  };

  const insertEquation = () => {
    const expr = window.prompt("Equation (plain text):", "E = mc\u00B2");
    if (expr === null || !expr.trim()) return;
    focusTextBox(makeTextBox(250, 175, escHtml(expr.trim()), "Cambria Math", 30, "#1a1a1a", "transparent", 360, 84));
    showToast("Equation text box added");
  };

  const insertSymbol = (ch: string) => {
    const active = document.activeElement as HTMLElement | null;
    if (active?.isContentEditable) {
      document.execCommand("insertText", false, ch);
    } else {
      focusTextBox(makeTextBox(430, 170, ch, "Calibri", 28, "#1a1a1a", "transparent", 84, 70));
      showToast(`${ch} inserted as a text box`);
    }
    setOpen(null);
  };

  /** Embeds a local media file as an element on the slide. */
  const insertMediaFile = (kind: "audio" | "video") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const el = {
        id: `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        kind: kind === "audio" ? ("audio" as const) : ("video" as const),
        x: 260,
        y: 210,
        w: kind === "audio" ? 260 : 360,
        h: kind === "audio" ? 46 : 220,
        z: zTopNow(),
        src,
        name: file.name,
        autoplay: false,
        controls: true,
        loop: false,
      } as unknown as SlideElement;
      insertElement(el);
      selectElement(el.id);
      showToast(
        `${kind === "audio" ? "Audio" : "Video"} embedded — use Playback on the Show tab or click it on the slide`
      );
    };
    reader.readAsDataURL(file);
  };

  const audioInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  /** Records the screen (or a window/tab) with getDisplayMedia and embeds it as a video. */
  const toggleScreenRecording = async () => {
    const active = recorderRef.current;
    if (active && active.state !== "inactive") {
      active.stop();
      return;
    }
    const md = navigator.mediaDevices as MediaDevices | undefined;
    if (!md?.getDisplayMedia) {
      showToast("Screen recording needs a browser with getDisplayMedia support");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await md.getDisplayMedia({ video: true, audio: true });
    } catch {
      showToast("Screen recording cancelled");
      return;
    }
    const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    const mimeType =
      candidates.find((m) => {
        try {
          return MediaRecorder.isTypeSupported(m);
        } catch {
          return false;
        }
      }) ?? "";
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      showToast("This browser cannot record that stream");
      return;
    }
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      recorderRef.current = null;
      const blob = new Blob(chunks, { type: mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      const el = {
        id: `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        kind: "video" as const,
        x: 240,
        y: 170,
        w: 400,
        h: 240,
        z: zTopNow(),
        src: url,
        name: "Screen Recording.webm",
        autoplay: false,
        controls: true,
        loop: false,
      } as unknown as SlideElement;
      insertElement(el);
      selectElement(el.id);
      showToast("Screen recording inserted — click the video to play it");
    };
    stream.getVideoTracks()[0]?.addEventListener("ended", () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") rec.stop();
    });
    rec.start();
    recorderRef.current = rec;
    showToast("Recording… click Recording again (or Stop sharing) to finish");
  };


  const zTopNow = () => {
    const st = usePresentationStore.getState();
    const els = st.slides[st.activeIndex]?.elements ?? [];
    return els.reduce((m, e) => Math.max(m, (e as { z?: number }).z ?? 1), 1) + 1;
  };

  const lastInk = () =>
    [...(slides[activeIndex]?.elements ?? [])]
      .reverse()
      .find((el) => el.kind === "ink");

  const toggleDrawTool = (tool: "ink" | "pencil" | "highlighter" | "eraser") => () => {
    setInsertTool(insertTool === tool ? null : tool);
    showToast(
      insertTool === tool
        ? "Tool off"
        : tool === "pencil"
        ? "Pencil active — draw thin strokes"
        : tool === "highlighter"
        ? "Highlighter active"
        : tool === "eraser"
        ? "Eraser — click a pen stroke to remove it"
        : "Pen active — draw on the slide"
    );
  };

  const inkToText = () => {
    const ink = lastInk();
    if (!ink || ink.kind !== "ink" || ink.stroke.length < 2) {
      showToast("Draw a pen stroke first, then convert it to text");
      return;
    }
    const xs = ink.stroke.map((pt) => pt.x);
    const ys = ink.stroke.map((pt) => pt.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const w = Math.max(90, maxX - minX + 10);
    const h = Math.max(26, maxY - minY + 10);
    removeElement(ink.id);
    focusTextBox(
      makeTextBox(Math.max(0, minX), Math.max(0, minY), "", "Calibri", 20, "#1a1a1a", "transparent", w, h)
    );
    showToast("Stroke converted to a text box — type your text");
  };

  const inkToShape = () => {
    const ink = lastInk();
    if (!ink || ink.kind !== "ink" || ink.stroke.length < 2) {
      showToast("Draw a pen stroke first, then convert it to a shape");
      return;
    }
    const xs = ink.stroke.map((pt) => pt.x);
    const ys = ink.stroke.map((pt) => pt.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const w = Math.max(40, maxX - minX);
    const h = Math.max(30, maxY - minY);
    const thin = Math.max(w, h) > Math.min(w, h) * 4;
    removeElement(ink.id);
    const el = makeShape(
      thin
        ? { type: "line", x: minX, y: minY, w, h, color: ink.color, outline: ink.color, outlineWidth: 2 }
        : { type: "rect", x: minX, y: minY, w, h, color: ink.color, outline: ink.color, outlineWidth: 2 }
    );
    insertElement({ ...el, z: zTopNow() });
    selectElement(el.id);
    showToast(thin ? "Stroke converted to a line" : "Stroke converted to a rectangle shape");
  };

  const saveJson = async () => {
    const st = usePresentationStore.getState();
    persistAutosave(st.slides, st.comments);
    const ok = await saveBritslide(st.slides, FILENAME, st.comments);
    if (ok) showToast(`Saved as ${FILENAME}`);
  };

  const openPresentation = async () => {
    if (isDesktopApp()) {
      const f = await openBritslideFile();
      if (f) handleOpenText(f.name, f.text);
    } else {
      openInput.current?.click();
    }
  };

  const handleOpenText = (name: string, text: string) => {
    try {
      const { slides: mapped, comments } = parseBritslide(text);
      usePresentationStore.setState({
        slides: mapped,
        comments,
        activeCommentId: null,
        activeIndex: 0,
        past: [],
        future: [],
        selectedElementId: null,
      });
      showToast(`Opened ${name}`);
    } catch {
      showToast("Could not open that file");
    }
  };

  const handleOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleOpenText(file.name, String(reader.result));
    reader.readAsText(file);
    e.target.value = "";
  };

  const newPresentation = () => {
    if (window.confirm("Start a new presentation? Unsaved changes will be lost.")) {
      usePresentationStore.setState({
        slides: [{ ...BLANK_SLIDE, id: Date.now() }],
        activeIndex: 0,
        past: [],
        future: [],
        selectedElementId: null,
      });
      showToast("New presentation created");
    }
  };

  const panelWrap = (menu: Menu, panel: React.ReactNode) =>
    open === menu && (
      <>
        <div className="fixed inset-0 z-30" onClick={() => setOpen(null)} />
        <div
          className="absolute top-full z-40 mt-1.5 bg-white border border-gray-300 shadow-xl rounded p-2"
          style={{ left: panelLeft }}
        >
          {panel}
        </div>
      </>
    );

  const FilePanel = (
    <div className="w-64 py-1">
      {[
        { label: "New", icon: "\u2728", action: newPresentation },
        { label: "Open (.britslide)", icon: "\uD83D\uDCC2", action: () => openPresentation() },
        { label: `Save As (${FILENAME})`, icon: "\uD83D\uDCBE", action: saveJson },
        { label: "Export PDF", icon: "\uD83D\uDDA8", action: () => exportPdf(slides, printTheme) },
        { label: "Print", icon: "\uD83D\uDCC4", action: () => window.print() },
      ].map((item) => (
        <button
          key={item.label}
          onClick={() => {
            setOpen(null);
            item.action();
          }}
          className="w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800 flex items-center gap-3"
        >
          <span className="text-base">{item.icon}</span>
          {item.label}
        </button>
      ))}
      {getRecent().length > 0 && (
        <>
          <div className="mt-2 pt-2 border-t border-gray-200 px-3 pb-1 text-[10px] uppercase tracking-wide text-gray-400">
            Recent
          </div>
          {getRecent().map((r) => (
            <div key={r.name} className="px-3 py-1 text-xs text-gray-600">
              <span className="font-medium">{r.name}</span>
              <span className="block text-[10px] text-gray-400">{r.time}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const ShapesPanel = (
    <div className="grid grid-cols-5 gap-1 w-64">
      {SHAPE_LIST.map((type) => {
        const Icon = SHAPE_ICONS[type];
        return (
          <button
            key={type}
            title={type}
            onClick={() => {
              setOpen(null);
              setInsertTool(type);
              showToast(`Click & drag on the slide to draw a ${type}`);
            }}
            className="h-11 rounded flex items-center justify-center hover:bg-[#e1e7f5] text-[#4472c4]"
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );

  const IconPanel = (
    <div className="grid grid-cols-5 gap-1 w-64">
      {SHAPE_LIST.slice(2).map((type) => {
        const Icon = SHAPE_ICONS[type];
        return (
          <button
            key={type}
            title={type}
            onClick={() => {
              setOpen(null);
              setInsertTool(type);
              showToast(`Inserting a ${type} shape`);
            }}
            className="h-11 rounded flex items-center justify-center hover:bg-[#e1e7f5] text-[#4472c4]"
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );

  const SymbolPanel = (
    <div className="grid grid-cols-7 gap-1 p-1">
      {[
        "\u00A9", "\u00AE", "\u2122", "\u00B6", "\u00A7", "\u2020", "\u2021",
        "\u2013", "\u2014", "\u2022", "\u2192", "\u2190", "\u21D2", "\u25B8",
        "\u221E", "\u2211", "\u221A", "\u03C0", "\u03A6", "\u0394", "\u03A9",
        "\u00BD", "\u2153", "\u00B2", "\u00B3", "\u2264", "\u2265", "\u2248",
      ].map((ch) => (
        <button
          key={ch}
          title={`Insert ${ch}`}
          onClick={() => insertSymbol(ch)}
          className="h-8 w-8 rounded hover:bg-[#e1e7f5] text-gray-800 text-base leading-none flex items-center justify-center"
        >
          {ch}
        </button>
      ))}
    </div>
  );

  const LayoutPanel = (
    <div className="w-44 py-1">
      {LAYOUTS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => {
            setOpen(null);
            setLayout(key);
            showToast(`Layout: ${label}`);
          }}
          className="w-full text-left px-2 py-1.5 rounded hover:bg-[#e1e7f5] flex items-center gap-3 text-sm text-gray-800"
        >
          <Icon size={18} className="text-[#4472c4]" />
          {label}
        </button>
      ))}
    </div>
  );

  const FontPanel = (
    <div className="w-44 max-h-64 overflow-y-auto py-1">
      {FONTS.map((f) => (
        <button
          key={f}
          {...keepSelection}
          onClick={() => {
            editorCommands.fontName(f);
            setOpen(null);
          }}
          className="w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800"
          style={{ fontFamily: f }}
        >
          {f}
        </button>
      ))}
    </div>
  );

  const SizePanel = (
    <div className="w-24 max-h-64 overflow-y-auto py-1">
      {FONT_SIZES.map((s) => (
        <button
          key={s}
          {...keepSelection}
          onClick={() => {
            editorCommands.fontSize(String(s));
            setOpen(null);
          }}
          className="w-full text-left px-3 py-1 rounded hover:bg-[#e1e7f5] text-sm text-gray-800"
        >
          {s}
        </button>
      ))}
    </div>
  );

  const InkWidthPanel = (
    <div className="w-40 py-1">
      {[1, 2, 3, 4, 6, 8].map((w) => (
        <button
          key={w}
          onClick={() => {
            setInkWidth(w);
            if (!insertTool || insertTool === "eraser" || insertTool === "lasso") setInsertTool("ink");
            setOpen(null);
          }}
          className="w-full flex items-center gap-3 px-3 py-1.5 rounded hover:bg-[#e1e7f5]"
        >
          <span className="w-9 h-5 flex items-center justify-center">
            <span
              className="bg-gray-800 rounded-full"
              style={{ width: Math.min(20, 4 + w * 2), height: Math.max(2, w) }}
            />
          </span>
          <span className="text-xs text-gray-700">{w} pt</span>
        </button>
      ))}
    </div>
  );

  const ThemesPanel = (
    <div className="w-64 py-1">
      {THEMES.map((t) => (
        <button
          key={t.name}
          onClick={() => {
            applyTheme(t);
            setOpen(null);
            showToast(`${t.name} theme applied`);
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-[#e1e7f5]"
        >
          <span
            className="w-12 h-7 rounded-sm border border-gray-300 relative overflow-hidden shrink-0"
            style={{ backgroundColor: t.bg }}
          >
            <span className="absolute left-1 top-1 h-1 w-6 rounded-sm" style={{ backgroundColor: t.title }} />
            <span className="absolute left-1 bottom-1 h-1 w-4 rounded-sm" style={{ backgroundColor: t.accent }} />
            <span className="absolute right-1 top-1.5 h-4 w-2 rounded-sm" style={{ backgroundColor: t.accent }} />
          </span>
          <span className="text-xs text-gray-700">{t.name}</span>
        </button>
      ))}
      <button
        onClick={() => {
          setOpen(null);
          themeInput.current?.click();
        }}
        className="w-full text-left px-3 py-2 rounded hover:bg-[#e1e7f5] text-xs text-gray-600"
      >
        Browse for Themes…
      </button>
    </div>
  );

  const FontsPanel = (
    <div className="w-56 max-h-64 overflow-y-auto py-1">
      {FONTS.map((f) => (
        <button
          key={f}
          onClick={() => {
            setDesignFont(f);
            setOpen(null);
            showToast("Theme fonts updated");
          }}
          className="w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800"
          style={{ fontFamily: f }}
        >
          {f}
        </button>
      ))}
    </div>
  );

  const BgStylesPanel = (
    <div className="w-48 py-1">
      {(["solid", "gradient"] as const).map((s) => (
        <button
          key={s}
          onClick={() => {
            setBgStyle(s);
            setOpen(null);
            showToast("Background style applied");
          }}
          className="w-full text-left px-3 py-2 rounded hover:bg-[#e1e7f5] text-sm capitalize text-gray-800"
        >
          {s}
        </button>
      ))}
    </div>
  );

  const EffectsPanel = (
    <div className="w-56 py-1">
      {["Shadow", "Glow", "Reflection", "Soft Edges", "Bevel", "3-D Format"].map((e) => (
        <button
          key={e}
          onClick={() => applyElementEffect(e)}
          className="w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800"
        >
          {e}
        </button>
      ))}
    </div>
  );

const SlideSizePanel = (
    <div className="w-56 py-1">
      {(
        [
          { name: "Widescreen (16:9)", w: 820, h: 461 },
          { name: "Standard (4:3)", w: 820, h: 615 },
          { name: "On-screen Show (16:10)", w: 820, h: 512 },
        ] as const
      ).map((s) => (
        <button
          key={s.name}
          onClick={() => {
            setOpen(null);
            usePresentationStore.getState().setSlideSize(s.w, s.h);
            showToast(`Slide size set to ${s.name}`);
          }}
          className={`w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800 flex items-center justify-between ${
            slides[activeIndex] && slideW === s.w && slideH === s.h ? "font-semibold" : ""
          }`}
        >
          <span>{s.name}</span>
          <span className="text-[10px] text-gray-400">
            {s.w} × {s.h}
          </span>
        </button>
      ))}
    </div>
  );

  const ColorPanel = ({ colors, onPick }: { colors: string[]; onPick: (c: string) => void }) => (
    <div className="w-44">
      <div className="grid grid-cols-4 gap-1">
        {colors.map((c) => (
          <button
            key={c}
            {...keepSelection}
            onClick={() => {
              onPick(c);
              setOpen(null);
            }}
            className="h-8 rounded border border-gray-200 hover:ring-2 ring-blue-500"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <label className="flex items-center gap-2 mt-2 px-1 py-1 rounded hover:bg-[#e1e7f5] text-xs text-gray-600 cursor-pointer">
        More colors\u2026
        <input
          type="color"
          className="w-6 h-6"
          onChange={(e) => {
            onPick(e.target.value);
            setOpen(null);
          }}
        />
      </label>
    </div>
  );

  const ArrangePanel = (
    <div className="w-44 py-1">
      <button
        className="w-full text-left px-3 py-2 rounded hover:bg-[#e1e7f5] text-sm text-gray-800"
        onClick={() => {
          bringForward();
          setOpen(null);
        }}
      >
        Bring Forward
      </button>
      <button
        className="w-full text-left px-3 py-2 rounded hover:bg-[#e1e7f5] text-sm text-gray-800"
        onClick={() => {
          sendBackward();
          setOpen(null);
        }}
      >
        Send Backward
      </button>
      <button
        className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-sm text-red-600"
        onClick={() => {
          if (selectedElementId) removeElement(selectedElementId);
          setOpen(null);
        }}
      >
        Delete Selected
      </button>
    </div>
  );

/*__RIBBON__*/
  const RibbonContent = (() => {
    switch (activeTab) {
      case "File":
        return (
          <Group name="File">
            <BigBtn label="New" onClick={newPresentation}>
              <span className="text-lg leading-none">{"\u2728"}</span>
            </BigBtn>
            <BigBtn label="Open" onClick={() => openPresentation()}>
              <span className="text-lg leading-none">{"\uD83D\uDCC2"}</span>
            </BigBtn>
            <SBtn label="Save" onClick={saveJson}>
              <span className="text-sm leading-none">{"\uD83D\uDCBE"}</span>
            </SBtn>
            <SBtn label="Save As" onClick={saveJson}>
              <span className="text-sm leading-none">{"\uD83D\uDCBE"}</span>
            </SBtn>
            <SBtn label="Info" btnRef={anchor("deckInfo")} onClick={() => toggleMenu("deckInfo")}>
              <span className="text-sm leading-none">{"\u2139\uFE0F"}</span>
            </SBtn>
            <SBtn label="Print" onClick={() => window.print()}>
              <span className="text-sm leading-none">{"\uD83D\uDCC4"}</span>
            </SBtn>
            <SBtn label="Export" onClick={() => exportPdf(slides, printTheme)}>
              <span className="text-sm leading-none">{"\uD83D\uDDA8"}</span>
            </SBtn>
            <SBtn
              label="Options"
              onClick={() =>
                showToast("Options — this clone saves .britslide JSON and exports PDF from File › Export")
              }
            >
              <span className="text-sm leading-none">{"\u2699\uFE0F"}</span>
            </SBtn>
          </Group>
        );

      case "Home":
        return (
          <>
            <Group name="Clipboard">
              <BigBtn label="Paste" onClick={() => editorCommands.paste()}>
                <PasteIcon size={22} />
              </BigBtn>
              <Col>
                <Row>
                  <SBtn label="Cut" onClick={() => editorCommands.cut()}>
                    <CutIcon size={15} />
                  </SBtn>
                  <SBtn label="Copy" onClick={() => editorCommands.copy()}>
                    <CopyIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn
                    label="Format Painter"
                    active={painterArmed}
                    onClick={formatPainter}
                  >
                    <FormatPainterIcon size={15} />
                  </SBtn>
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>

            <Group name="Slides">
              <TallBtn label="New Slide" onClick={addSlide}>
                <NewSlideIcon size={20} />
              </TallBtn>
              <SBtn label="Duplicate" onClick={duplicateSlide}>
                <CopyIcon size={15} />
              </SBtn>
              <SBtn label="Delete" onClick={() => deleteSlide(activeIndex)}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M9 3h6l1 2h4v2H4V5h4l1-2zM6 8h12l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 8z" />
                </svg>
              </SBtn>
              <Col>
                <Row>
                  <SBtn label="Layout" btnRef={anchor("layout")} onClick={() => toggleMenu("layout")}>
                    <LayoutIcon size={15} />
                  </SBtn>
                  <SBtn
                    label="Reset"
                    onClick={() => {
                      const s = slides[activeIndex];
                      if (!s) return;
                      usePresentationStore.setState({
                        slides: slides.map((x, i) =>
                          i === activeIndex
                            ? { ...x, title: "", content: "", contentRight: "", elements: [], transition: "none", animation: "none", transitionSound: "", transitionSoundLoop: false, advanceOnClick: true, advanceAfter: null }
                            : x
                        ),
                      });
                      showToast("Slide layout reset");
                    }}
                  >
                    <ResetIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn
                    label="Section"
                    onClick={() => {
                      addSlide();
                      setLayout("sectionHeader");
                      showToast("Section added");
                    }}
                  >
                    <SectionLayoutIcon size={15} />
                  </SBtn>
                  <SBtn
                    label="Notes"
                    onClick={() => {
                      const notes = window.prompt(
                        "Speaker notes for this slide:",
                        slides[activeIndex]?.notes ?? ""
                      );
                      if (notes === null) return;
                      usePresentationStore.setState({
                        slides: slides.map((x, i) => (i === activeIndex ? { ...x, notes } : x)),
                      });
                      showToast("Speaker notes saved");
                    }}
                  >
                    <TextIcon size={15} />
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Font">
              <Col>
                <Row>
                  <button
                    title="Font"
                    {...keepSelection}
                    className="w-24 h-[30px] text-[11px] text-left px-1.5 hover:bg-[#e1e7f5] rounded"
                    ref={anchor("font")}
                    onClick={() => toggleMenu("font")}
                  >
                    {activeTb?.font ?? "Calibri"} {"\u25BE"}
                  </button>
                  <button
                    title="Font size"
                    {...keepSelection}
                    className="w-11 h-[30px] text-[11px] text-left px-1 hover:bg-[#e1e7f5] rounded"
                    ref={anchor("size")}
                    onClick={() => toggleMenu("size")}
                  >
                    {activeTb?.size ?? FONT_SIZES[4]} {"\u25BE"}
                  </button>
                  <button
                    title="Increase font size"
                    {...keepSelection}
                    className={`${boxBtn} w-9`}
                    onClick={() => editorCommands.increaseFont()}
                  >
                    <FontSizeIncIcon size={14} />
                  </button>
                  <button
                    title="Decrease font size"
                    {...keepSelection}
                    className={`${boxBtn} w-9`}
                    onClick={() => editorCommands.decreaseFont()}
                  >
                    <FontSizeDecIcon size={14} />
                  </button>
                </Row>
                <Row className="mt-0.5">
                  <button
                    title="Bold"
                    {...keepSelection}
                    className={`${boxBtn} w-8 ${format.bold ? "bg-[#d5e3f7]" : ""}`}
                    onClick={() => editorCommands.bold()}
                  >
                    <span className="font-bold text-sm">B</span>
                  </button>
                  <button
                    title="Italic"
                    {...keepSelection}
                    className={`${boxBtn} w-8 ${format.italic ? "bg-[#d5e3f7]" : ""}`}
                    onClick={() => editorCommands.italic()}
                  >
                    <span className="italic text-sm">I</span>
                  </button>
                  <button
                    title="Underline"
                    {...keepSelection}
                    className={`${boxBtn} w-8 ${format.underline ? "bg-[#d5e3f7]" : ""}`}
                    onClick={() => editorCommands.underline()}
                  >
                    <span className="underline text-sm">U</span>
                  </button>
                  <button
                    title="Strikethrough"
                    {...keepSelection}
                    className={`${boxBtn} w-8 ${format.strike ? "bg-[#d5e3f7]" : ""}`}
                    onClick={() => editorCommands.strike()}
                  >
                    <span className="line-through text-sm">S</span>
                  </button>
                  <button
                    title="Text Effects and Typography"
                    {...keepSelection}
                    ref={anchor("textEffects")}
                    className={`${boxBtn} w-8`}
                    onClick={() => toggleMenu("textEffects")}
                  >
                    <span
                      className="text-[15px] font-semibold leading-none"
                      style={{
                        color: "#2f5496",
                        textShadow:
                          "0 0 3px rgba(68,114,196,0.85), 1px 1px 1px rgba(0,0,0,0.45)",
                      }}
                    >
                      A
                    </span>
                  </button>
                  <button
                    title="Character spacing"
                    {...keepSelection}
                    ref={anchor("charSpace")}
                    className={boxBtn}
                    onClick={() => toggleMenu("charSpace")}
                  >
                    <span className="text-[11px] font-semibold tracking-[0.2em]">AV</span>
                  </button>
                  <button
                    title="Change case"
                    {...keepSelection}
                    ref={anchor("changeCase")}
                    className={boxBtn}
                    onClick={() => toggleMenu("changeCase")}
                  >
                    <span className="text-sm font-semibold leading-none">
                      <span className="text-[10px] align-super">a</span>A
                    </span>
                  </button>
                  <button
                    title="Clear all formatting"
                    {...keepSelection}
                    className={`${boxBtn} w-8`}
                    onClick={() => editorCommands.clearFormatting()}
                  >
                    <RemoveFormatIcon size={15} />
                  </button>
                </Row>
              </Col>
              <Col className="justify-center">
                <button
                  title="Text highlight color"
                  {...keepSelection}
                  className={small}
                  ref={anchor("hilite")}
                  onClick={() => toggleMenu("hilite")}
                >
                  <HighlighterColorIcon size={17} />
                </button>
                <button
                  title="Font color"
                  {...keepSelection}
                  className={small}
                  ref={anchor("fontColor")}
                  onClick={() => toggleMenu("fontColor")}
                >
                  <FontColorIcon size={17} />
                </button>
              </Col>
            </Group>

            <Group name="Paragraph">
              <Col>
                <Row>
                  <SBtn label="Bullets" active={format.list} onClick={() => editorCommands.bullets()}>
                    <ListBulletsIcon size={15} />
                  </SBtn>
                  <SBtn label="Numbering" onClick={() => editorCommands.numbering()}>
                    <NumberingIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn label="Decrease list level" onClick={() => editorCommands.outdent()}>
                    <OutdentIcon size={15} />
                  </SBtn>
                  <SBtn label="Increase list level" onClick={() => editorCommands.indent()}>
                    <IndentIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn
                    label="Line spacing"
                    btnRef={anchor("lineSpacing")}
                    onClick={() => toggleMenu("lineSpacing")}
                  >
                    <LineSpacingIcon size={15} />
                  </SBtn>
                </Row>
              </Col>
              <Col>
                <Row>
                  <SBtn
                    label="Align Left"
                    active={format.align === "left"}
                    onClick={() => editorCommands.align("left")}
                  >
                    <AlignLeftIcon size={15} />
                  </SBtn>
                  <SBtn
                    label="Center"
                    active={format.align === "center"}
                    onClick={() => editorCommands.align("center")}
                  >
                    <AlignCenterIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn
                    label="Align Right"
                    active={format.align === "right"}
                    onClick={() => editorCommands.align("right")}
                  >
                    <AlignRightIcon size={15} />
                  </SBtn>
                  <SBtn
                    label="Justify"
                    active={format.align === "justify"}
                    onClick={() => editorCommands.align("justify")}
                  >
                    <AlignJustifyIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>

            <Group name="Drawing">
              <Col>
                <TallBtn label="Shapes" btnRef={anchor("shapes")} onClick={() => toggleMenu("shapes")}>
                  <ShapesIcon size={20} />
                </TallBtn>
              </Col>
              <Col className="justify-center">
                <Row>
                  <SBtn
                    label="Text Box"
                    onClick={() => {
                      setInsertTool("textbox");
                      showToast("Click the slide to add a text box");
                    }}
                  >
                    <TextIcon size={15} />
                  </SBtn>
                  <SBtn label="Arrange" btnRef={anchor("arrange")} onClick={() => toggleMenu("arrange")}>
                    <ShapesGalleryIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
<SBtn label="Quick Styles" btnRef={anchor("quickStyles")} onClick={() => toggleMenu("quickStyles")}>
                    <span
                      className="w-4 h-4 rounded-full border border-gray-400"
                      style={{ background: "linear-gradient(135deg,#4472c4,#ed7d31,#70ad47)" }}
                    />
                  </SBtn>
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>

            <Group name="Editing">
              <Col>
                <Row>
                  <SBtn label="Find" btnRef={anchor("find")} onClick={() => toggleMenu("find")}>
                    <FindIcon size={15} />
                  </SBtn>
                  <SBtn
                    label="Select"
                    onClick={() => {
                      if (!selectAllInEditable())
                        showToast("Select All: double-click a shape or pick a text box first");
                    }}
                  >
                    <SelectIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn label="Replace" btnRef={anchor("replace")} onClick={() => toggleMenu("replace")}>
                    <ReplaceIcon size={15} />
                  </SBtn>
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>
          </>
        );

      case "Insert":
        return (
          <>
            <Group name="Slides">
              <Col>
                <Row>
                  <BigBtn label="New Slide" onClick={() => addSlide()}>
                    <NewSlideIcon size={20} />
                  </BigBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Tables">
              <Col>
                <Row>
                  <SBtn label="Table" onClick={() => insertElement(makeTable())}>
                    <TableIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>

            <Group name="Illustrations">
              <Col>
                <Row>
                  <SBtn label="Pictures" onClick={() => picInput.current?.click()}>
                    <PictureIcon size={15} />
                  </SBtn>
                  <SBtn label="3D Models" onClick={insert3DModel}>
                    <ThreeDIcon size={15} />
                  </SBtn>
                  <SBtn label="Icons" btnRef={anchor("icons")} onClick={() => toggleMenu("icons")}>
                    <span className="text-sm font-bold">{"\u25C6"}</span>
                  </SBtn>
                </Row>
                <Row>
                  <SBtn label="Shapes" btnRef={anchor("shapes")} onClick={() => toggleMenu("shapes")}>
                    <ShapesGalleryIcon size={15} />
                  </SBtn>
                  <SBtn label="SmartArt" onClick={insertSmartArt}>
                    <SmartArtIcon size={15} />
                  </SBtn>
                  <SBtn label="Chart" onClick={() => insertElement(makeChart())}>
                    <ChartIcon size={15} />
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Add-ins">
              <Col>
                <Row>
                  <SBtn
                    label="Get Add-ins"
                    onClick={() =>
                      showToast("Office Add-ins (the online store) are not available in the clone")
                    }
                  >
                    <AddinsIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn
                    label="My Add-ins"
                    onClick={() =>
                      showToast("No installed Add-ins yet \u2014 add-ins need the full Office suite")
                    }
                  >
                    <AddinsIcon size={15} />
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Links">
              <Col>
                <Row>
                  <SBtn label="Link" onClick={insertHyperlink}>
                    <LinkIcon size={15} />
                  </SBtn>
                  <SBtn label="Action" onClick={setElementAction}>
                    <ActionIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <div className="w-[50px] h-[30px]" />
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>

            <Group name="Comments">
              <Col>
                <Row>
                  <SBtn
                    label="Comment"
                    active={commentsEnabled}
                    onClick={() => {
                      setComments(true);
                      showToast("Comments pane open");
                    }}
                  >
                    <CommentIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>

            <Group name="Text">
              <Col>
                <Row>
                  <SBtn
                    label="Text Box"
                    onClick={() => {
                      setInsertTool("textbox");
                      showToast("Click the slide to add a text box");
                    }}
                  >
                    <TextIcon size={15} />
                  </SBtn>
                  <SBtn label="Header &amp; Footer" onClick={insertHeaderFooter}>
                    <HeaderFooterIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn label="WordArt" onClick={insertWordArt}>
                    <WordArtIcon size={15} />
                  </SBtn>
                  <SBtn label="Date &amp; Time" onClick={insertDate}>
                    <DateIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn label="Slide #" onClick={insertSlideNumber}>
                    <SlideNumberIcon size={15} />
                  </SBtn>
                  <SBtn
                    label="Object"
                    onClick={() =>
                      showToast("Insert Object (OLE) is not available in the clone")
                    }
                  >
                    <ObjectIcon size={15} />
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Symbols">
              <Col>
                <Row>
                  <SBtn label="Equation" onClick={insertEquation}>
                    <EquationIcon size={15} />
                  </SBtn>
                  <SBtn label="Symbol" btnRef={anchor("symbols")} onClick={() => toggleMenu("symbols")}>
                    <SymbolIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <div className="w-[50px] h-[30px]" />
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>

            <Group name="Media">
              <Col>
                <Row>
                  <SBtn label="Video" onClick={() => videoInput.current?.click()}>
                    <VideoIcon size={15} />
                  </SBtn>
                  <SBtn label="Audio" onClick={() => audioInput.current?.click()}>
                    <AudioIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn
                    label="Recording"
                    onClick={toggleScreenRecording}
                  >
                    <ScreenRecIcon size={15} />
                  </SBtn>
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>
          </>
        );

      case "Draw":
        return (
          <>
            <Group name="Pens">
              <Col>
                <Row>
                  <SBtn label="Pen" active={insertTool === "ink"} onClick={toggleDrawTool("ink")}>
                    <PenIcon size={15} />
                  </SBtn>
                  <SBtn label="Pencil" active={insertTool === "pencil"} onClick={toggleDrawTool("pencil")}>
                    <PencilIcon size={15} />
                  </SBtn>
                  <SBtn label="Highlighter" active={insertTool === "highlighter"} onClick={toggleDrawTool("highlighter")}>
                    <HighlighterIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn label="Ink Color" btnRef={anchor("inkColor")} onClick={() => toggleMenu("inkColor")}>
                    <span className="w-4 h-4 rounded-full border border-gray-400" style={{ backgroundColor: inkColor }} />
                  </SBtn>
                  <SBtn label="Thickness" btnRef={anchor("inkWidth")} onClick={() => toggleMenu("inkWidth")}>
                    <span
                      className="w-6 rounded-full bg-gray-700"
                      style={{ height: Math.max(2, inkWidth) }}
                    />
                  </SBtn>
                  <SBtn label="Eraser" active={insertTool === "eraser"} onClick={toggleDrawTool("eraser")}>
                    <EraserIcon size={15} />
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Replay">
              <Col>
                <Row>
                  <SBtn
                    label="Ink Replay"
                    onClick={() => {
                      const strokes = (slides[activeIndex]?.elements ?? []).filter(
                        (e) => e.kind === "ink"
                      ).length;
                      if (strokes === 0) {
                        showToast("Draw a pen stroke first, then replay it");
                        return;
                      }
                      replayInk();
                      showToast(`Replaying ${strokes} ink stroke${strokes === 1 ? "" : "s"}`);
                    }}
                  >
                    <InkReplayIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>

            <Group name="Convert">
              <Col>
                <Row>
                  <SBtn label="Ink to Text" onClick={inkToText}>
                    <InkToTextIcon size={15} />
                  </SBtn>
                  <SBtn label="Ink to Shape" onClick={inkToShape}>
                    <InkToShapeIcon size={15} />
                  </SBtn>
                  <SBtn
                    label="Ink to Math"
                    onClick={insertEquation}
                  >
                    <InkToMathIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn label="Drawing Canvas" active={insertTool === "canvas"} onClick={() => {
                    setInsertTool(insertTool === "canvas" ? null : "canvas");
                    showToast("Click & drag on the slide to place a drawing canvas");
                  }}>
                    <CanvasIcon size={15} />
                  </SBtn>
                  <div className="w-[50px] h-[30px]" />
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>

            <Group name="Tools">
              <Col>
                <Row>
                  <SBtn label="Lasso Select" active={insertTool === "lasso"} onClick={() => {
                    setInsertTool(insertTool === "lasso" ? null : "lasso");
                    showToast("Lasso Select \u2014 drag around objects to select the top one");
                  }}>
                    <LassoIcon size={15} />
                  </SBtn>
                  <div className="w-[50px] h-[30px]" />
                </Row>
                <Row>
                  <div className="w-[50px] h-[30px]" />
                  <div className="w-[50px] h-[30px]" />
                </Row>
              </Col>
            </Group>
          </>
        );

      case "Design":
        return (
          <>
            <Group name="Themes">
              <div className="flex items-start gap-1.5">
                {THEMES.map((t) => (
                  <ThemePreview
                    key={t.name}
                    bg={t.bg}
                    accent={t.accent}
                    title={t.title}
                    body={t.body}
                    label={t.name}
                    decor={t.decor}
                    active={themeAccent === t.accent}
                    onClick={() => {
                      applyTheme(t);
                      showToast(`${t.name} theme applied`);
                    }}
                  />
                ))}
                <SBtn label="More" btnRef={anchor("themes")} onClick={() => toggleMenu("themes")}>
                  <MoreIcon size={15} />
                </SBtn>
              </div>
            </Group>

            <Group name="Variants">
              <div className="flex items-start gap-1.5">
                <ThemePreview
                  bg={slideBg}
                  accent={themeAccent}
                  title={designTitleColor}
                  body={designBodyColor}
                  label={themeName}
                  decor={themeDecor}
                  onClick={() => {
                    setThemeColor(slideBg);
                    showToast("Variant applied");
                  }}
                />
                {VARIANT_MIXES.map((m) => {
                  const vAccent = mixHex(themeAccent, "#ffffff", m.accent);
                  const vBg = mixHex(slideBg, themeAccent, m.bg);
                  const vTitle = mixHex(designTitleColor, themeAccent, m.title);
                  const vBody = mixHex(designBodyColor, themeAccent, m.body);
                  return (
                    <ThemePreview
                      key={m.name}
                      bg={vBg}
                      accent={vAccent}
                      title={vTitle}
                      body={vBody}
                      label={m.name}
                      onClick={() => {
                        applyVariant(vAccent, vBg, vTitle, vBody);
                        showToast(`${m.name} variant applied`);
                      }}
                    />
                  );
                })}
                <div className="flex flex-col gap-0.5">
                  <SBtn label="Fonts" btnRef={anchor("fonts")} onClick={() => toggleMenu("fonts")}>
                    <FontsIcon size={15} />
                  </SBtn>
                  <SBtn label="Effects" btnRef={anchor("effects")} onClick={() => toggleMenu("effects")}>
                    <EffectsIcon size={15} />
                  </SBtn>
                </div>
              </div>
            </Group>

            <Group name="Customize">
              <Col>
                <Row>
                  <SBtn label="Slide Size" btnRef={anchor("slideSize")} onClick={() => toggleMenu("slideSize")}>
                    <SlideSizeIcon size={15} />
                  </SBtn>
                  <SBtn label="Bg Style" btnRef={anchor("bgStyles")} onClick={() => toggleMenu("bgStyles")}>
                    <PaintIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn label="Format BG" btnRef={anchor("bgColor")} onClick={() => toggleMenu("bgColor")}>
                    <PaintIcon size={15} />
                  </SBtn>
                </Row>
              </Col>
            </Group>
          </>
        );

      case "Transitions": {
        const slide = slides[activeIndex];
        const curTr = slide?.transition ?? "none";
        const dur = slide?.transitionDuration ?? 0.7;
        const sound = slide?.transitionSound ?? "";
        const loop = slide?.transitionSoundLoop ?? false;
        const onClick = slide?.advanceOnClick !== false;
        const after = slide?.advanceAfter ?? null;
        const runPreview = (id?: string) => {
          const target = id ?? curTr;
          if (target === "none") {
            showToast("This slide has no transition to preview");
            return;
          }
          playTransitionSound(target, sound);
          previewTransition(target);
          showToast(`Previewing ${transitionName(target)} on the slide`);
        };
        return (
          <>
            <Group name="Transition">
              <div className="flex flex-col gap-1">
                <div className="flex items-start gap-1">
                  <button
                    onClick={() => {
                      setTransition("none");
                      showToast("Transition removed");
                    }}
                    title="None"
                    className={`h-[42px] w-[30px] rounded border shrink-0 flex flex-col items-center justify-center ${
                      curTr === "none"
                        ? "border-[#185abd] ring-1 ring-[#185abd]"
                        : "border-gray-300 hover:border-blue-500"
                    }`}
                  >
                    <span className="w-3.5 h-2.5 rounded-[1px] border border-gray-400 bg-white" />
                  </button>
                  <div className="w-[172px] overflow-x-auto overflow-y-hidden">
                    <div className="flex gap-1 w-max">
                      {TRANSITION_LIST.filter((t) => t.group !== "None").map((t) => (
                        <TransitionThumb
                          key={t.id}
                          def={t}
                          active={curTr === t.id}
                          playing={curTr === t.id && previewingTransition === t.id}
                          onClick={() => {
                            setTransition(t.id);
                            playTransitionSound(t.id, sound);
                            showToast(`${t.name} applied — previewing on the slide`);
                          }}
                          onPreview={() => runPreview(t.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Row className="pl-[34px]">
                  <button
                    onClick={() => runPreview()}
                    className="w-[26px] h-[20px] rounded border border-gray-300 hover:bg-[#e1e7f5] text-gray-600 flex items-center justify-center"
                    title="Preview — replays the transition on the slide in the editing view"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const other = slides.findIndex((s, i) => i !== activeIndex && s.transition === curTr);
                      if (other >= 0 && slides[other]) {
                        setActiveSlide(other);
                        runPreview(curTr);
                      } else {
                        showToast("No other slide uses this transition");
                      }
                    }}
                    className="w-[20px] h-[20px] rounded border border-gray-300 hover:bg-[#e1e7f5] text-gray-600 flex items-center justify-center"
                    title="Preview next occurrence"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <path d="M5 5h9v2H7v3H5zm5 8v-2h7V8h2v5z" />
                    </svg>
                  </button>
                  <span className="text-[10px] text-gray-500 ml-1 self-center">
                    Hover to preview
                  </span>
                </Row>
              </div>
            </Group>

            <Group name="Effect Options">
              <Col>
                <SBtn
                  label="Effect Options"
                  onClick={() =>
                    showToast(
                      curTr === "none"
                        ? "Select a transition first"
                        : `${transitionName(curTr)} runs with the on-screen animation and honors Duration`
                    )
                  }
                >
                  <EffectsIcon size={15} />
                </SBtn>
                <SBtn
                  label={sound ? "Sound: set" : "Sound"}
                  btnRef={anchor("trSound")}
                  onClick={() => toggleMenu("trSound")}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M4 9h4l5-4v14l-5-4H4zm12.5 3a3.5 3.5 0 00-2-3.2v6.4a3.5 3.5 0 002-3.2z" />
                  </svg>
                </SBtn>
                <label className="flex items-center gap-1 text-[10px] text-gray-700 px-1 py-0.5">
                  <input
                    type="checkbox"
                    checked={loop}
                    disabled={!sound}
                    onChange={(e) => {
                      setTransitionSoundLoop(e.target.checked);
                      showToast(e.target.checked ? "Sound will loop until the next slide" : "Sound loop turned off");
                    }}
                    className="disabled:opacity-40"
                  />
                  Loop
                </label>
              </Col>
            </Group>

            <Group name="Timing">
              <Col>
                <Row>
                  <label className="text-[10px] text-gray-700 w-[46px]">Duration</label>
                  <input
                    type="number"
                    min={0.1}
                    max={59}
                    step={0.1}
                    value={dur}
                    onChange={(e) => setTransitionDuration(Number(e.target.value) || 0.1)}
                    className="w-[50px] h-[22px] border border-gray-300 rounded px-1 text-xs"
                  />
                </Row>
                <SBtn label="Apply To All" onClick={() => {
                  applyTransitionToAll();
                  showToast(`Transition applied to all ${slides.length} slides`);
                }}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z" />
                  </svg>
                </SBtn>
              </Col>
            </Group>

            <Group name="Advance Slide">
              <Col className="gap-1">
                <label className="flex items-center gap-1 text-[10px] text-gray-700">
                  <input
                    type="checkbox"
                    checked={onClick}
                    onChange={(e) => setAdvanceOnClick(e.target.checked)}
                  />
                  On Mouse Click
                </label>
                <label className="flex items-center gap-1 text-[10px] text-gray-700">
                  <input
                    type="checkbox"
                    checked={after !== null}
                    onChange={(e) => setAdvanceAfter(e.target.checked ? 5 : null)}
                  />
                  After
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={after ?? 5}
                    disabled={after === null}
                    onChange={(e) => setAdvanceAfter(Number(e.target.value) || 0)}
                    className="w-[42px] h-[20px] border border-gray-300 rounded px-1 text-xs disabled:bg-gray-100"
                  />
                </label>
              </Col>
            </Group>
          </>
        );
      }

      case "Animations": {
        const slide = slides[activeIndex];
        const selEl = slide?.elements.find((e) => e.id === selectedElementId) ?? null;
        const curAnim = selectedAnim?.type ?? "none";
        return (
          <>
            <Group name="Animations">
              <div className="flex items-start gap-1.5">
                {ANIMATION_LIST.map((a) => (
                  <AnimationThumb
                    key={a.id}
                    label={a.name}
                    cls={a.id}
                    active={curAnim === a.id}
                    onClick={() => {
                      if (!selEl) {
                        showToast("Select an object on the slide first, then choose an animation");
                        return;
                      }
                      setElementAnimation(a.id);
                      previewElementAnimation(selEl.id);
                      showToast(`${a.name} applied to the selected object`);
                    }}
                  />
                ))}
                <SBtn label="More" btnRef={anchor("animMore")} onClick={() => toggleMenu("animMore")}>
                  <MoreIcon size={15} />
                </SBtn>
              </div>
              {!selEl && (
                <div className="text-[11px] text-gray-500 mt-1.5 pl-1">
                  Select a text box, shape, or object on the slide to animate it.
                </div>
              )}
            </Group>

            <Group name="Animation Pane">
              <Col>
                <Row>
                  <SBtn label="Animation Pane" btnRef={anchor("animationPane")} onClick={() => toggleMenu("animationPane")}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M3 4h18v4H3zm0 6h18v10H3zm3 2v6h2v-6zm4 0v6h6v-6z" />
                    </svg>
                  </SBtn>
                  <SBtn label="Preview" onClick={startShowPreview}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </SBtn>
                </Row>
                <Row>
                  <SBtn label="Start" btnRef={anchor("animStart")} onClick={() => toggleMenu("animStart")}>
                    <span className="text-[10px] font-semibold">Start</span>
                  </SBtn>
                  <SBtn
                    label="Duration"
                    btnRef={anchor("animDuration")}
                    onClick={() => toggleMenu("animDuration")}
                  >
                    <span className="text-[10px] font-semibold">{animDuration}s</span>
                  </SBtn>
                  <SBtn label="Delay" btnRef={anchor("animDelay")} onClick={() => toggleMenu("animDelay")}>
                    <span className="text-[10px] font-semibold">{animDelay}s</span>
                  </SBtn>
                </Row>
                <Row>
                  <SBtn
                    label="Apply To All"
                    onClick={() => {
                      if (!selectedAnim) {
                        showToast("Select an animated object first, then Apply To All");
                        return;
                      }
                      applyElementAnimationToAll();
                      showToast("Animation applied to all objects on this slide");
                    }}
                  >
                    <span className="text-[10px] font-semibold">All</span>
                  </SBtn>
                  <SBtn
                    label="Remove"
                    onClick={() => {
                      if (!selEl) {
                        showToast("Select an object first, then Remove");
                        return;
                      }
                      removeElementAnimation();
                      showToast("Animation removed from the selected object");
                    }}
                  >
                    <span className="text-[10px] font-semibold">{"\u2715"}</span>
                  </SBtn>
                </Row>
              </Col>
            </Group>
          </>
        );
      }

      case "Slide Show":
        return (
          <>
            <Group name="Slide Show">
              <BigBtn label="From Start" onClick={() => startShow(0, { loop: loopShow })}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </BigBtn>
              <BigBtn label="From Current" onClick={() => startShow(activeIndex, { loop: loopShow })}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5-6.3 4.5L8 13.8l-6-4.6h7.6z" />
                </svg>
              </BigBtn>
            </Group>

            <Group name="Set Up Show">
              <Col>
                <Row>
                  <SBtn label="Set Up Show" onClick={() => toggleMenu("setUpShow")}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M12 8a4 4 0 110 8 4 4 0 010-8zm9 4l-2-2v4h-4l2-2-4-4a7 7 0 1010 0l-4 4h4z" />
                    </svg>
                  </SBtn>
                </Row>
                <Row>
                  <SBtn
                    label="Rehearse"
                    onClick={() => {
                      if (slides.length === 0) {
                        showToast("Add a slide before rehearsing");
                        return;
                      }
                      startRehearsal();
                      showToast("Rehearsing — advance at your pace, press Esc to save timings");
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M12 3a9 9 0 109 9h-2a7 7 0 11-7-7zm1 3h-2v6l4.8 2.9 1-1.7-3.8-2.3z" />
                    </svg>
                  </SBtn>
                  <SBtn label="Presenter View" onClick={() => {
                    const w = openPresenterView();
                    if (!w) {
                      showToast("Allow pop-ups to use Presenter View — playing full screen instead");
                    }
                    startShow(0, { loop: loopShow });
                    if (w) showToast("Presenter View opened — notes, next slide and timer in a second window");
                  }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M3 4h18v12H3zm2 2v8h14V6zm1 10h12v2H6z" />
                    </svg>
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Start Slide Show">
              <Col>
                <Row>
                  <SBtn
                    label="Broadcast"
                    onClick={() =>
                      showToast("Broadcast to online viewers needs the PowerPoint service — not available offline")
                    }
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M12 10a4 4 0 110 8 4 4 0 010-8zM4 4h16v4h-4l6 8H6l6-8H4z" />
                    </svg>
                  </SBtn>
                  <SBtn
                    label="Accessibility"
                    onClick={() => setOpen("accessibility")}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <circle cx="12" cy="4" r="2" />
                      <path d="M4 8h16v2h-6v3h5v2h-5v6h-2v-6H7v6H5v-6H2v-2h5V10H4z" />
                    </svg>
                  </SBtn>
                </Row>
              </Col>
            </Group>
          </>
        );


      case "Review":
        return (
          <>
            <Group name="Proofing">
              <Col>
                <Row>
                  <SBtn
                    label="Spelling & Grammar"
                    btnRef={anchor("spellPanel")}
                    onClick={() => toggleMenu("spellPanel")}
                  >
                    <SpellIcon size={15} />
                  </SBtn>
                  <SBtn label="Thesaurus" btnRef={anchor("thesaurus")} onClick={() => toggleMenu("thesaurus")}>
                    <TextIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn
                    label="Word Count"
                    btnRef={anchor("wordCount")}
                    onClick={() => toggleMenu("wordCount")}
                  >
                    <span className="text-[10px] font-semibold">123</span>
                  </SBtn>
                  <SBtn
                    label="Check Issues"
                    onClick={() => {
                      const found = runSpellCheck();
                      if (found.length === 0) {
                        setOpen(null);
                        showToast("No spelling or grammar issues found");
                        return;
                      }
                      setReviewList(found);
                      setOpen("spellPanel");
                    }}
                  >
                    <CheckIcon size={15} />
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Accessibility">
              <Col>
                <Row>
                  <SBtn
                    label="Check Accessibility"
                    btnRef={anchor("accessibility")}
                    onClick={() => toggleMenu("accessibility")}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <circle cx="12" cy="4" r="2" />
                      <path d="M4 8h16v2h-6v3h5v2h-5v6h-2v-6H7v6H5v-6H2v-2h5V10H4z" />
                    </svg>
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Comments">
              <Col>
                <Row>
                  <SBtn label="New Comment" onClick={() => startComment()}>
                    <CommentIcon size={15} />
                  </SBtn>
                  <SBtn
                    label="Comments"
                    active={commentsEnabled}
                    onClick={() => setComments(!commentsEnabled)}
                  >
                    <CommentIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn label="Prev" onClick={() => cycleComment(-1)}>
                    <span className="text-xs">{"\u25B2"}</span>
                  </SBtn>
                  <SBtn label="Next" onClick={() => cycleComment(1)}>
                    <span className="text-xs">{"\u25BC"}</span>
                  </SBtn>
                </Row>
                <Row>
                  <SBtn label="Show All" onClick={() => toggleMenu("commentList")}>
                    <span className="text-xs">{comments.length}</span>
                  </SBtn>
                  <SBtn label="Clear Resolved" onClick={clearResolvedComments}>
                    <span className="text-xs">{"\u2713"}</span>
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Presentation Info">
              <Col>
                <Row>
                  <SBtn label="Slide Info" btnRef={anchor("deckInfo")} onClick={() => toggleMenu("deckInfo")}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M4 3h16v18H4zm2 2v14h12V5zm2 2h8v2H8zm0 4h8v2H8zm0 4h5v2H8z" />
                    </svg>
                  </SBtn>
                </Row>
              </Col>
            </Group>
          </>
        );

      case "View":
        return (
          <>
            <Group name="Presentation Views">
              <Col>
                <Row>
                  <SBtn
                    label="Normal"
                    active={viewMode === "normal"}
                    onClick={() => setViewMode("normal")}
                  >
                    <LayoutIcon size={15} />
                  </SBtn>
                  <SBtn
                    label="Slide Sorter"
                    active={viewMode === "sorter"}
                    onClick={() => setViewMode("sorter")}
                  >
                    <TablePlusIcon size={15} />
                  </SBtn>
                  <SBtn
                    label="Reading View"
                    active={viewMode === "reading"}
                    onClick={() => setViewMode("reading")}
                  >
                    <TextIcon size={15} />
                  </SBtn>
                </Row>
                <Row>
                  <SBtn
                    label="Slide Master"
                    onClick={() => setViewMode("master")}
                  >
                    <ShapesGalleryIcon size={15} />
                  </SBtn>
                  <SBtn label="Notes Page" onClick={() => editNotesPage()}>
                    <TextIcon size={15} />
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Show">
              <Col>
                <Row>
                  <SBtn label="From Start" onClick={() => startShow(0)}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </SBtn>
                  <SBtn label="Current" onClick={() => startShow(activeIndex)}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M3 5h18v12H3zm2 2v8h14V7z" />
                    </svg>
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Zoom">
              <Row>
                <SBtn label="Zoom" btnRef={anchor("zoom")} onClick={() => toggleMenu("zoom")}>
                  <span className="text-[10px] font-semibold">{Math.round(zoom * 100)}%</span>
                </SBtn>
              </Row>
              <Row>
                <SBtn label="Zoom Out" onClick={zoomOut}>
                  <FontSizeDecIcon size={15} />
                </SBtn>
                <SBtn label="Zoom In" onClick={zoomIn}>
                  <FontSizeIncIcon size={15} />
                </SBtn>
              </Row>
              <Row>
                <SBtn label="Fit to Window" onClick={() => setZoom(1)}>
                  <span className="text-[10px] font-semibold">Fit</span>
                </SBtn>
              </Row>
            </Group>

            <Group name="Window">
              <Col>
                <Row>
                  <SBtn
                    label="Ruler"
                    active={showRuler}
                    onClick={() => setShowRuler(!showRuler)}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M2 4h20v2H2zm0 5h20v2H2zm0 5h20v2H2zm0 5h20v2H2z" />
                    </svg>
                  </SBtn>
                  <SBtn
                    label="Gridlines"
                    active={showGridlines}
                    onClick={() => setShowGridlines(!showGridlines)}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
                    </svg>
                  </SBtn>
                </Row>
                <Row>
                  <SBtn
                    label="Snap to Grid"
                    active={showGridlines}
                    onClick={() => {
                      setShowGridlines(!showGridlines);
                      showToast(
                        showGridlines ? "Snap to grid off" : "Snap to grid on — objects align to the 40px grid"
                      );
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M4 2h2v20H4zm14 0h2v20h-2z" />
                    </svg>
                  </SBtn>
                  <SBtn
                    label="Properties"
                    active={propertiesOpen}
                    onClick={() => setPropertiesOpen(!propertiesOpen)}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M3 5h18v6H3zm0 8h18v6H3z" />
                    </svg>
                  </SBtn>
                </Row>
              </Col>
            </Group>
          </>
        );

      case "Help":
        return (
          <>
            <Group name="Help">
              <Col>
                <Row>
                  <SBtn label="Contact Support" onClick={() => setOpen("helpTopics")}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M12 2a9 9 0 019 9v4a3 3 0 01-3 3h-1v-6h1a2 2 0 002-2v-1a8 8 0 10-16 0v1a2 2 0 002 2h1v6H7a3 3 0 01-3-3v-4a9 9 0 019-9z" />
                    </svg>
                  </SBtn>
                  <SBtn label="Feedback" onClick={() => setOpen("feedback")}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M4 3h16v13H8l-4 4z" />
                    </svg>
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="Help Topics">
              <Col>
                <Row>
                  <SBtn
                    label="Getting Started"
                    onClick={() => setOpen("helpGuide")}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M4 4h16v16H4zm2 3v2h12V7zm0 4v2h12v-2zm0 4v2h8v-2z" />
                    </svg>
                  </SBtn>
                  <SBtn label="Keyboard" onClick={() => setOpen("helpKeys")}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M3 6h18v12H3zm2 2v8h14V8zm2 1h3v2H7zm5 0h3v2h-3zm5 0h2v2h-2zM7 13h2v2H7zm4 0h6v2h-6z" />
                    </svg>
                  </SBtn>
                </Row>
              </Col>
            </Group>

            <Group name="About">
              <Col>
                <Row>
                  <BigBtn
                    label="About"
                    onClick={() =>
                      setOpen("about")
                    }
                  >
                    <span className="text-lg leading-none">?</span>
                  </BigBtn>
                </Row>
              </Col>
            </Group>
          </>
        );

      default:
        return null;
    }
  })();

  return (
    <div ref={wrapRef} className="relative">
      <div className="border-b border-gray-300 bg-gradient-to-b from-[#f6f7f9] to-[#e5e8ee]">
        <div className="flex px-1 -mb-px relative">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === "File") {
                  setActiveTab("Home");
                  setBackstage(true);
                  setOpen(null);
                  return;
                }
                setBackstage(false);
                setActiveTab(tab);
              }}
              className={`px-3 py-1 text-[13px] border-x border-transparent -mb-px ${
                activeTab === tab
                  ? "bg-white border-gray-300 font-semibold text-gray-900 rounded-t"
                  : "text-gray-700 hover:bg-white/60 hover:border-gray-200 rounded-t"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="bg-white border-t border-gray-300 overflow-x-auto overflow-y-hidden relative z-10">
          <div className="flex items-stretch w-full px-1 relative">{RibbonContent}</div>
        </div>
      </div>

      {backstage && (
        <FileBackstage
          onClose={() => setBackstage(false)}
          onOpen={() => openPresentation()}
          onNew={newPresentation}
          onExportPdf={() => exportPdf(slides, printTheme)}
          onPrint={() => window.print()}
          onToast={showToast}
        />
      )}


      {panelWrap("layout", LayoutPanel)}
      {panelWrap("shapes", ShapesPanel)}
      {panelWrap("icons", IconPanel)}
      {panelWrap("symbols", SymbolPanel)}
      {panelWrap("font", FontPanel)}
      {panelWrap("size", SizePanel)}
      {panelWrap("fontColor", ColorPanel({ colors: TEXT_COLORS, onPick: editorCommands.fontColor }))}
      {panelWrap("hilite", ColorPanel({ colors: HILITE_COLORS, onPick: editorCommands.highlight }))}
      {panelWrap("inkColor", ColorPanel({ colors: INK_COLORS, onPick: (c) => {
      setInkColor(c);
      if (!insertTool || insertTool === "eraser" || insertTool === "lasso") setInsertTool("ink");
    } }))}
      {panelWrap("inkWidth", InkWidthPanel)}
      {panelWrap("bgColor", ColorPanel({ colors: THEME_COLORS, onPick: setThemeColor }))}
      {panelWrap("arrange", ArrangePanel)}
      {panelWrap("file", FilePanel)}
      {panelWrap("themes", ThemesPanel)}
      {panelWrap("fonts", FontsPanel)}
      {panelWrap("effects", EffectsPanel)}
      {panelWrap("bgStyles", BgStylesPanel)}
      {panelWrap("slideSize", SlideSizePanel)}
      {panelWrap(
        "charSpace",
        (
          <div className="w-44 py-1">
            {[
              { v: 0, label: "Default" },
              { v: 0.5, label: "Very Tight" },
              { v: 1, label: "Tight" },
              { v: 2, label: "Loose" },
              { v: 4, label: "Very Loose" },
            ].map((o) => (
              <button
                key={o.v}
                {...keepSelection}
                onClick={() => {
                  const ok =
                    o.v === 0
                      ? editorCommands.styleSelection({ "letter-spacing": "normal" })
                      : editorCommands.characterSpacing(o.v);
                  setOpen(null);
                  showToast(ok ? `Character spacing: ${o.label}` : "Select some text first");
                }}
                className="w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800"
              >
                <span style={{ letterSpacing: o.v ? `${o.v}px` : "normal" }}>{o.label}</span>
              </button>
            ))}
          </div>
        )
      )}
      {panelWrap(
        "changeCase",
        (
          <div className="w-44 py-1">
            {[
              { k: "lower" as const, label: "lowercase" },
              { k: "upper" as const, label: "UPPERCASE" },
              { k: "title" as const, label: "Capitalize Each Word" },
            ].map((o) => (
              <button
                key={o.k}
                {...keepSelection}
                onClick={() => {
                  const ok = editorCommands.changeCase(o.k);
                  setOpen(null);
                  showToast(ok ? `Changed case to ${o.label}` : "Select some text first");
                }}
                className="w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800"
              >
                {o.label}
              </button>
            ))}
          </div>
        )
      )}
      {panelWrap(
        "lineSpacing",
        (
          <div className="w-40 py-1">
            {[
              { v: 1, label: "1.0" },
              { v: 1.15, label: "1.15" },
              { v: 1.5, label: "1.5" },
              { v: 2, label: "2.0" },
              { v: 2.5, label: "2.5" },
              { v: 3, label: "3.0" },
            ].map((o) => (
              <button
                key={o.v}
                {...keepSelection}
                onClick={() => {
                  const ok = editorCommands.lineSpacing(o.v);
                  setOpen(null);
                  showToast(ok ? `Line spacing set to ${o.label}` : "Select some text first");
                }}
                className="w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800 flex items-center gap-2"
              >
                <span style={{ lineHeight: o.v }} className="inline-block">
                  Ag
                </span>
                {o.label}
              </button>
            ))}
          </div>
        )
      )}
      {panelWrap(
        "textEffects",
        (
          <div className="w-[360px] max-h-[360px] overflow-y-auto p-2">
            <div className="px-1 pb-1 text-sm font-semibold text-gray-900">
              Text Effects and Typography
            </div>
            {TEXT_EFFECTS.map((section) => (
              <div key={section.group} className="mb-2">
                <div className="px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {section.group}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {section.items.map((eff) => (
                    <button
                      key={eff.name}
                      title={eff.name}
                      {...keepSelection}
                      onClick={() => {
                        const ok = editorCommands.styleSelection(eff.css);
                        setOpen(null);
                        showToast(
                          ok
                            ? `${eff.name} text effect applied`
                            : "Select some text first, then pick an effect"
                        );
                      }}
                      className="group rounded border border-gray-200 hover:border-blue-500 hover:bg-[#eef3fb] py-1.5 flex flex-col items-center gap-1"
                    >
                      <span
                        className="text-lg font-semibold leading-none text-[#2f5496]"
                        style={eff.css as unknown as React.CSSProperties}
                      >
                        A
                      </span>
                      <span className="text-[9px] text-gray-600 truncate w-full text-center px-0.5">
                        {eff.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {panelWrap(
        "find",
        (
          <div className="w-72 p-3">
            <div className="text-xs text-gray-700 mb-2">Find in this presentation</div>
            <input
              autoFocus
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runFind();
              }}
              placeholder="Type text to find"
              className="w-full h-7 border border-gray-300 rounded px-2 text-sm"
            />
            <div className="flex items-center gap-2 mt-2">
              <label className="flex items-center gap-1 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={findCase}
                  onChange={(e) => setFindCase(e.target.checked)}
                />
                Match case
              </label>
            </div>
            <div className="mt-2 text-xs text-gray-600 min-h-[32px]">{findResult}</div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={runFind}
                className="px-3 h-7 rounded bg-[#185abd] text-white text-xs hover:bg-[#134a9e]"
              >
                Find Next
              </button>
              <button
                onClick={() => {
                  setFindQuery("");
                  setFindResult("");
                }}
                className="px-3 h-7 rounded border border-gray-300 text-xs hover:bg-[#e1e7f5]"
              >
                Cancel
              </button>
            </div>
          </div>
        )
      )}
      {panelWrap(
        "replace",
        (
          <div className="w-72 p-3">
            <div className="text-xs text-gray-700 mb-2">Replace text in this presentation</div>
            <input
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              placeholder="Find what"
              className="w-full h-7 border border-gray-300 rounded px-2 text-sm mb-2"
            />
            <input
              value={replaceWith}
              onChange={(e) => setReplaceWith(e.target.value)}
              placeholder="Replace with"
              className="w-full h-7 border border-gray-300 rounded px-2 text-sm mb-2"
            />
            <label className="flex items-center gap-1 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={findCase}
                onChange={(e) => setFindCase(e.target.checked)}
              />
              Match case
            </label>
            <div className="flex gap-2 mt-2">
              <button
                onClick={runReplace}
                className="px-3 h-7 rounded bg-[#185abd] text-white text-xs hover:bg-[#134a9e]"
              >
                Replace All
              </button>
              <button
                onClick={runFind}
                className="px-3 h-7 rounded border border-gray-300 text-xs hover:bg-[#e1e7f5]"
              >
                Find Next
              </button>
            </div>
          </div>
        )
      )}
      {panelWrap(
        "helpGuide",
        (
          <div className="w-80 p-3 text-xs text-gray-700 space-y-2">
            <div className="text-sm font-semibold text-gray-900">Getting started</div>
            <div>
              <b>1. Create a slide</b> — Home › New Slide, then pick a layout from the Layout
              gallery.
            </div>
            <div>
              <b>2. Add content</b> — Insert › Text Box, Pictures, Table or Chart. Drag the blue
              handles to resize, drag inside to move.
            </div>
            <div>
              <b>3. Style it</b> — Design › Themes applies a theme, font pair and background. Home ›
              Font and Paragraph format the selected text.
            </div>
            <div>
              <b>4. Add motion</b> — Transitions › gallery applies and previews a transition;
              Animations › gallery animates the slide in a show.
            </div>
            <div>
              <b>5. Present</b> — Slide Show › From Start. Press Esc to exit. Set an "After" time
              under Transitions › Advance Slide to run a timed show.
            </div>
            <div>
              <b>6. Save</b> — File › Save downloads a .britslide file; autosave also keeps a copy
              on the backend after every change.
            </div>
          </div>
        )
      )}
      {panelWrap(
        "helpKeys",
        (
          <div className="w-72 p-3 text-xs text-gray-700">
            <div className="text-sm font-semibold text-gray-900 mb-1">Keyboard shortcuts</div>
            {[
              ["Ctrl+S / Cmd+S", "Save the presentation"],
              ["Ctrl+Z / Cmd+Z", "Undo"],
              ["Ctrl+Y / Cmd+Shift+Z", "Redo"],
              ["Ctrl+C / X / V", "Copy, cut, paste"],
              ["Ctrl+D", "Duplicate the selected object"],
              ["Ctrl+A", "Select all text in the active text box"],
              ["Delete", "Remove the selected object"],
              ["Arrow keys", "Nudge the selected object"],
              ["Esc", "Close a menu, or exit the slide show"],
              ["Space / →", "Next slide during a show"],
              ["←", "Previous slide"],
              ["Home / End", "First / last slide during a show"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 py-0.5">
                <span className="w-36 shrink-0 font-mono text-[11px] text-gray-900">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        )
      )}
      {panelWrap(
        "helpTopics",
        (
          <div className="w-64 py-1">
            {[
              { m: "helpGuide" as const, l: "Getting started guide" },
              { m: "helpKeys" as const, l: "Keyboard shortcuts" },
              { m: "feedback" as const, l: "Send feedback" },
              { m: "about" as const, l: "About this clone" },
            ].map((o) => (
              <button
                key={o.m}
                onClick={() => setOpen(o.m)}
                className="w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800"
              >
                {o.l}
              </button>
            ))}
          </div>
        )
      )}
      {panelWrap(
        "feedback",
        (
          <div className="w-80 p-3 text-xs text-gray-700 space-y-2">
            <div className="text-sm font-semibold text-gray-900">Send feedback</div>
            <div>
              This is an offline clone with no telemetry, so feedback cannot be sent anywhere. Note
              what you were trying to do and share it with whoever maintains this build.
            </div>
            <textarea
              ref={feedbackRef}
              placeholder="Describe the problem or the feature you want…"
              className="w-full h-24 border border-gray-300 rounded p-2 text-xs outline-none focus:border-[#185abd]"
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const note = feedbackRef.current?.value.trim() ?? "";
                  if (!note) {
                    showToast("Write something first, then copy it");
                    return;
                  }
                  try {
                    await navigator.clipboard.writeText(note);
                    setOpen(null);
                    feedbackRef.current!.value = "";
                    showToast("Copied your notes to the clipboard");
                  } catch {
                    showToast("Clipboard blocked — select the text and copy manually");
                  }
                }}
                className="px-3 h-7 rounded bg-[#185abd] text-white text-xs hover:bg-[#134a9e]"
              >
                Copy notes
              </button>
              <button
                onClick={() => setOpen(null)}
                className="px-3 h-7 rounded border border-gray-300 text-xs hover:bg-[#e1e7f5]"
              >
                Close
              </button>
            </div>
          </div>
        )
      )}
      {panelWrap(
        "about",
        (
          <div className="w-72 p-3 text-xs text-gray-700 space-y-1">
            <div className="text-sm font-semibold text-gray-900">PowerPoint Clone</div>
            <div>Version 1.0 \u2014 offline browser clone</div>
            <div>Built with React, Tailwind CSS and FastAPI</div>
            <div>Slides: {slides.length}</div>
            <div>Storage: local autosave plus downloadable .britslide files</div>
          </div>
        )
      )}
      {panelWrap(
        "commentList",
        (
          <div className="w-72 max-h-72 overflow-y-auto py-1">
            <div className="px-3 py-1 text-[11px] text-gray-500">
              {comments.length === 0 ? "No comments in this presentation" : "Comments in this deck"}
            </div>
            {comments.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveSlide(c.slide);
                  setActiveComment(c.id);
                  setComments(true);
                  setOpen(null);
                }}
                className={`w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-xs ${
                  c.id === activeCommentId ? "bg-[#e1e7f5]" : ""
                }`}
              >
                <span className="text-gray-500">
                  Slide {c.slide + 1} \u00B7 {c.author}
                  {c.resolved ? " \u00B7 resolved" : ""}
                </span>
                <span className="block text-gray-800 truncate">{c.text || "(empty)"}</span>
              </button>
            ))}
          </div>
        )
      )}
      {panelWrap(
        "accessibility",
        (
          <div className="w-80 max-h-80 overflow-y-auto p-3">
            <div className="text-xs text-gray-700 mb-2">
              Accessibility checker — reports issues across every slide.
            </div>
            {(() => {
              const issues = accessibilityIssues();
              if (issues.length === 0) {
                return (
                  <div className="text-sm text-[#107c10]">
                    No accessibility issues found. Titles are present, images have alt text and
                    reading order looks fine.
                  </div>
                );
              }
              return (
                <ul className="space-y-1">
                  {issues.map((it) => (
                    <li key={it.id} className="flex gap-2 items-start">
                      <span
                        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                          it.level === "error" ? "bg-[#c00000]" : "bg-[#b8860b]"
                        }`}
                      />
                      <button
                        onClick={() => {
                          setActiveSlide(it.slide);
                          setActiveTab("Home");
                          setOpen(null);
                        }}
                        className="text-left text-xs text-[#185abd] hover:underline"
                      >
                        Slide {it.slide + 1}: {it.msg}
                      </button>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>
        )
      )}
      {panelWrap(
        "deckInfo",
        (
          <div className="w-72 p-3">
            <div className="text-sm text-gray-800 mb-2">{FILENAME || "Presentation"}</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Slides: {slides.length}</div>
              <div>Shapes and objects: {slides.reduce((n, s) => n + s.elements.length, 0)}</div>
              <div>Words: {countWords()}</div>
              <div>Theme: {themeName}</div>
              <div>Transitioned slides: {slides.filter((s) => s.transition !== "none").length}</div>
            </div>
          </div>
        )
      )}
      {panelWrap(
        "zoom",
        (
          <div className="w-56 p-3">
            <div className="text-xs text-gray-700 mb-2">
              Zoom to: {Math.round(zoom * 100)}%
            </div>
            <input
              type="range"
              min={10}
              max={400}
              value={Math.round(zoom * 100)}
              onChange={(e) => setZoom(Number(e.target.value) / 100)}
              className="w-full"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setZoom(zoom - 0.1)}
                className="w-6 h-6 rounded border border-gray-300 hover:bg-[#e1e7f5]"
              >
                −
              </button>
              <input
                type="number"
                min={10}
                max={400}
                value={Math.round(zoom * 100)}
                onChange={(e) => setZoom(Number(e.target.value) / 100)}
                className="w-14 h-6 border border-gray-300 rounded px-1 text-xs"
              />
              <button
                onClick={() => setZoom(zoom + 0.1)}
                className="w-6 h-6 rounded border border-gray-300 hover:bg-[#e1e7f5]"
              >
                +
              </button>
            </div>
            <div className="flex gap-1 mt-3">
              {[
                { l: "Fit", v: 1 },
                { l: "100%", v: 1 },
                { l: "200%", v: 2 },
              ].map((o) => (
                <button
                  key={o.l}
                  onClick={() => setZoom(o.v)}
                  className="px-2 py-1 rounded border border-gray-300 hover:bg-[#e1e7f5] text-xs"
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        )
      )}
      {panelWrap(
        "animMore",
        (
          <div className="w-64 max-h-80 overflow-y-auto p-3">
            <div className="text-sm font-semibold text-gray-900 mb-2">
              More Animations
            </div>
            {!selectedElementId && (
              <div className="text-[11px] text-gray-500 mb-2">
                Select an object on the slide first, then pick an animation to apply to it.
              </div>
            )}
            {["Subtle", "Exciting", "Dynamic Content", "Entrance"].map((grp) => (
              <div key={grp} className="mb-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  {grp}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {ANIMATION_LIST.filter((a) => a.group === grp).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        if (!selectedElementId) {
                          showToast("Select an object on the slide first, then choose an animation");
                          return;
                        }
                        setElementAnimation(a.id);
                        previewElementAnimation(selectedElementId);
                        setOpen(null);
                        showToast(`${a.name} applied to the selected object`);
                      }}
                      className={`text-left px-2 py-1.5 rounded border text-xs ${
                        selectedAnim?.type === a.id
                          ? "border-[#185abd] bg-[#e1e7f5]"
                          : "border-gray-200 hover:bg-[#e1e7f5]"
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {panelWrap(
        "quickStyles",
        (
          <div className="w-72 p-3">
            <div className="text-sm font-semibold text-gray-900 mb-2">Quick Styles</div>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_STYLES.map((q) => (
                <button
                  key={q.name}
                  onClick={() => applyQuickStyle(q)}
                  title={q.name}
                  className="flex flex-col items-center gap-1 p-1 rounded hover:bg-[#e1e7f5]"
                >
                  <span
                    className="w-12 h-9 rounded flex items-center justify-center text-[11px] font-semibold"
                    style={{
                      backgroundColor:
                        q.fill && q.fill !== "transparent" ? q.fill : "#ffffff",
                      border: `${q.outlineWidth ?? 1}px solid ${q.outline ?? "#c8c8c8"}`,
                      boxShadow: q.effect?.boxShadow,
                      filter: q.effect?.filter,
                      WebkitBoxReflect: q.effect?.reflect
                        ? "below 2px linear-gradient(transparent 60%, rgba(0,0,0,0.28))"
                        : undefined,
                      color: q.textColor ?? "#ffffff",
                    }}
                  >
                    Aa
                  </span>
                  <span className="text-[10px] text-gray-600 truncate w-12 text-center">
                    {q.name}
                  </span>
                </button>
              ))}
            </div>
            {!selectedElementId && (
              <div className="mt-2 text-[11px] text-gray-500">
                Select a shape or text box, then click a style to apply it.
              </div>
            )}
          </div>
        )
      )}
      {panelWrap(
        "wordCount",
        (() => {
          const totals = slides.reduce(
            (acc, s) => {
              const text = stripTags(
                s.elements
                  .map((el) => (el.kind === "textbox" ? el.text : ""))
                  .join(" ")
              );
              const words = text.trim() ? text.trim().split(/\s+/).length : 0;
              acc.words += words;
              acc.chars += text.replace(/\s/g, "").length;
              return acc;
            },
            { words: 0, chars: 0 }
          );
          return (
            <div className="w-80 max-h-80 overflow-y-auto p-3">
              <div className="text-sm font-semibold text-gray-900 mb-2">Word Count</div>
              <div className="text-xs text-gray-700 mb-3">
                {totals.words.toLocaleString()} words, {totals.chars.toLocaleString()} characters
                (no spaces) across {slides.length} slide{slides.length === 1 ? "" : "s"}
              </div>
              <ul className="space-y-1">
                {slides.map((s, i) => (
                  <li key={s.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Slide {i + 1}</span>
                    <span className="text-gray-800 font-medium">
                      {(() => {
                        const text = stripTags(
                          s.elements
                            .map((el) => (el.kind === "textbox" ? el.text : ""))
                            .join(" ")
                        );
                        return text.trim() ? text.trim().split(/\s+/).length : 0;
                      })()}{" "}
                      words
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[11px] text-gray-500">
                The status bar can show live counts in the corner of the window.
              </div>
            </div>
          );
        })()
      )}
      {panelWrap(
        "animationPane",
        (
          <div className="w-80 max-h-80 overflow-y-auto p-3">
            <div className="text-sm font-semibold text-gray-900 mb-1">Animation Pane</div>
            <div className="text-[11px] text-gray-500 mb-2">
              Objects on this slide that have an animation.
            </div>
            {(() => {
              const animated = slides[activeIndex]?.elements.filter((e) => e.animation) ?? [];
              if (animated.length === 0)
                return (
                  <div className="text-xs text-gray-500 py-2">
                    No animations on this slide yet — select an object and pick one from the gallery.
                  </div>
                );
              return (
                <ul className="space-y-1">
                  {animated.map((el) => {
                    const anim = el.animation!;
                    const label =
                      el.kind === "textbox"
                        ? (stripTags(el.text) || "Text box").slice(0, 40)
                        : el.kind === "shape"
                        ? (stripTags(el.text ?? "") || "Shape").slice(0, 40)
                        : "Object";
                    return (
                      <li key={el.id}>
                        <button
                          onClick={() => {
                            usePresentationStore.getState().selectElement(el.id);
                            setOpen(null);
                          }}
                          className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 ${
                            el.id === selectedElementId ? "bg-[#e1e7f5]" : "hover:bg-[#e1e7f5]"
                          }`}
                        >
                          <span className="text-[10px] font-bold text-[#185abd] w-4">
                            {ANIMATION_LIST.find((a) => a.id === anim.type)?.name?.[0] ?? "•"}
                          </span>
                          <span className="text-xs text-gray-800 flex-1 truncate">
                            {label}
                          </span>
                          <span className="text-[10px] text-gray-500">{anim.duration.toFixed(2)}s</span>
                          <span className="text-[10px] text-gray-500 w-16 text-right truncate">
                            {anim.start === "onClick"
                              ? "On Click"
                              : anim.start === "withPrevious"
                              ? "With Prev"
                              : "After Prev"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </div>
        )
      )}
      {panelWrap(
        "animStart",
        (
          <div className="w-56 py-1">
            <div className="px-3 pt-1 pb-1 text-[11px] text-gray-500">
              {selectedAnim ? "Start" : "Start — select an animated object first"}
            </div>
            {[
              { k: "onClick" as const, l: "On Click" },
              { k: "withPrevious" as const, l: "With Previous" },
              { k: "afterPrevious" as const, l: "After Previous" },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => {
                  if (!selectedAnim) {
                    setOpen(null);
                    showToast("Select an animated object first, then set Start");
                    return;
                  }
                  setElementAnimationStart(o.k);
                  setOpen(null);
                  showToast(`Animation start: ${o.l}`);
                }}
                className="w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800 flex items-center gap-2"
              >
                <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                  {animStart === o.k && <span className="w-2 h-2 rounded-full bg-[#185abd]" />}
                </span>
                {o.l}
              </button>
            ))}
          </div>
        )
      )}
      {panelWrap(
        "animDuration",
        (
          <div className="w-56 p-3">
            <div className="text-xs text-gray-700 mb-2">Duration: {animDuration.toFixed(2)}s</div>
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.05}
              value={animDuration}
              onChange={(e) => {
                if (!selectedAnim) return;
                setElementAnimationDuration(Number(e.target.value));
              }}
              className="w-full"
            />
          </div>
        )
      )}
      {panelWrap(
        "animDelay",
        (
          <div className="w-56 p-3">
            <div className="text-xs text-gray-700 mb-2">Delay: {animDelay.toFixed(2)}s</div>
            <input
              type="range"
              min={0}
              max={3}
              step={0.1}
              value={animDelay}
              onChange={(e) => {
                if (!selectedAnim) return;
                setElementAnimationDelay(Number(e.target.value));
              }}
              className="w-full"
            />
          </div>
        )
      )}
      {panelWrap(
        "setUpShow",
        (
          <div className="w-80 p-3 text-xs text-gray-700 space-y-2">
            <div className="text-sm font-semibold text-gray-900">Set Up Show</div>
            <div className="flex items-center gap-2">
              <span className="w-24">Show type</span>
              <select
                value={slides.every((s) => s.advanceOnClick !== false) ? "click" : "timed"}
                onChange={(e) => {
                  const timed = e.target.value === "timed";
                  usePresentationStore.setState({
                    slides: slides.map((s) => ({
                      ...s,
                      advanceOnClick: !timed,
                      advanceAfter: timed ? s.advanceAfter ?? 5 : null,
                    })),
                  });
                  showToast(timed ? "Timed show: 5s per slide" : "Show advances on click");
                }}
                className="h-7 border border-gray-300 rounded px-1 text-xs"
              >
                <option value="click">Presented by a speaker (full screen)</option>
                <option value="timed">Browsed at a kiosk (timed)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24">Loop</span>
              <input
                type="checkbox"
                checked={loopShow}
                onChange={(e) => {
                  setLoopShow(e.target.checked);
                  showToast(e.target.checked ? "Show will loop" : "Loop disabled");
                }}
              />
              <span>Repeat the show until stopped</span>
            </div>
            <button
              onClick={() => {
                setOpen(null);
                startShow(0, { loop: loopShow });
                showToast(
                  loopShow
                    ? "Starting the show in loop mode — it restarts after the last slide"
                    : "Starting the show from slide 1"
                );
              }}
              className="w-full h-8 rounded bg-[#185abd] text-white text-xs hover:bg-[#134a9e]"
            >
              Start show{loopShow ? " (looping)" : ""}
            </button>
            <div className="text-[11px] text-gray-500">
              Slide advances:{" "}
              {slides.filter((s) => s.advanceOnClick !== false).length} on click,{" "}
              {slides.filter((s) => s.advanceAfter !== null).length} on a timer.
            </div>
          </div>
        )
      )}
      {panelWrap(
        "spellPanel",
        (
          <div className="w-80 max-h-80 overflow-y-auto p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-700">
                Proofing results for this presentation
              </span>
              <button
                onClick={() => {
                  setReviewList(runSpellCheck());
                  showToast("Rechecked all slides");
                }}
                className="px-2 h-6 rounded bg-[#185abd] text-white text-[11px] hover:bg-[#134a9e]"
              >
                Recheck
              </button>
            </div>
            {reviewList.length === 0 ? (
              <div className="text-sm text-[#107c10]">
                No issues found. The checker looks for common misspellings across titles, body text
                and notes.
              </div>
            ) : (
              <ul className="space-y-1">
                {reviewList.map((it) => (
                  <li key={it.id}>
                    <button
                      onClick={() => {
                        setActiveSlide(it.slide);
                        setActiveTab("Home");
                        setOpen(null);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-[#e1e7f5]"
                    >
                      <span className="text-[11px] text-gray-500">Slide {it.slide + 1}</span>
                      <span className="block text-xs text-gray-800">{it.msg}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      )}
      {panelWrap(
        "thesaurus",
        (
          <div className="w-64 max-h-72 overflow-y-auto py-1">
            <div className="px-3 py-1 text-[11px] text-gray-500">
              Synonyms for the selected word
            </div>
            {(() => {
              const sel = (window.getSelection()?.toString() ?? "").trim();
              if (!sel) {
                return (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    Select a word on the slide to see synonyms.
                  </div>
                );
              }
              const list = THESAURUS[sel.toLowerCase()] ?? [];
              if (list.length === 0) {
                return (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    No synonyms stored for “{sel}”. Try:{" "}
                    {Object.keys(THESAURUS).slice(0, 6).join(", ")}.
                  </div>
                );
              }
              return list.map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    const ok = editorCommands.replaceSelection(w);
                    setOpen(null);
                    showToast(ok ? `Replaced with “${w}”` : "Select a single word first");
                  }}
                  className="w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800"
                >
                  {w}
                </button>
              ));
            })()}
          </div>
        )
      )}
      {panelWrap(
        "trSound",
        (
          <div className="w-56 py-1">
            <div className="px-3 pt-1 pb-1 text-[11px] text-gray-500">
              Pick a sound to hear it immediately
            </div>
            {SOUND_LIST.map((s) => (
              <button
                key={s.id || "none"}
                onClick={() => {
                  setTransitionSound(s.id);
                  setOpen(null);
                  if (!s.id) {
                    showToast("Sound removed");
                    return;
                  }
                  const played = playSoundCue(s.id);
                  showToast(
                    played
                      ? `${s.label} applied and playing`
                      : `${s.label} applied, but this browser blocked audio`
                  );
                }}
                className="w-full text-left px-3 py-1.5 rounded hover:bg-[#e1e7f5] text-sm text-gray-800 flex items-center gap-2"
              >
                <span
                  className={`w-3 h-3 rounded-full border shrink-0 ${
                    (slides[activeIndex]?.transitionSound ?? "") === s.id
                      ? "border-[#185abd] bg-[#185abd]"
                      : "border-gray-400"
                  }`}
                />
                <span className="flex-1">{s.label}</span>
                {!s.bundled && <span className="text-[10px] text-gray-400">no audio</span>}
                {s.id && s.bundled && (
                  <span
                    className="text-[11px] text-gray-500"
                    title="Tap to hear"
                    onClick={(e) => {
                      e.stopPropagation();
                      const played = playSoundCue(s.id);
                      if (!played) showToast("This browser blocked audio playback");
                    }}
                  >
                    &#9835;
                  </span>
                )}
              </button>
            ))}
          </div>
        )
      )}

      <input ref={picInput} type="file" accept="image/*" className="hidden" onChange={handlePicture} />
      <input ref={audioInput} type="file" accept="audio/*" className="hidden" onChange={insertMediaFile("audio")} />
      <input ref={videoInput} type="file" accept="video/*" className="hidden" onChange={insertMediaFile("video")} />
      <input ref={openInput} type="file" accept=".json,application/json" className="hidden" onChange={handleOpen} />
      <input ref={themeInput} type="file" accept=".json,application/json" className="hidden" onChange={handleThemeFile} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#323130] text-white text-sm px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
