import React from "react";

type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const SaveIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

export const UndoIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
  </svg>
);

export const RedoIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
  </svg>
);

export const CutIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

export const CopyIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const PasteIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

export const NewSlideIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="4" width="18" height="16" rx="1" />
    <rect x="5" y="17" width="14" height="1" />
    <line x1="12" y1="8" x2="12" y2="14" />
    <line x1="9" y1="11" x2="15" y2="11" />
  </svg>
);

export const AlignLeftIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <line x1="3" y1="6" x2="17" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="13" y2="18" />
  </svg>
);

export const AlignCenterIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

export const AlignRightIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <line x1="7" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="11" y1="18" x2="21" y2="18" />
  </svg>
);

export const AlignJustifyIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const ListBulletsIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <line x1="9" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="9" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const ShapesIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="8" cy="8" r="4" />
    <path d="M18 8h4l-2 5-2-5z" />
    <rect x="6" y="16" width="10" height="7" rx="1" />
  </svg>
);

export const ZoomInIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const PlayIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export const ShapesGalleryIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
);

export const PictureIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const TableIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </svg>
);

export const TextIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 7V4h16v3" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="8" y1="20" x2="16" y2="20" />
  </svg>
);

export const SpellIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="9" cy="9" r="6" />
    <path d="M13.5 13.5L21 21" />
    <path d="M7.5 7.5h3M9 6v3" />
  </svg>
);

export const PenIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

export const PencilIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    <path d="M15 5l4 4" />
  </svg>
);

export const InkToTextIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 17c4 4 2-4 9-4h4" />
    <path d="M12 13v5" />
    <path d="M3 3l18 18" opacity="0.45" strokeDasharray="2 2" />
  </svg>
);

export const InkToShapeIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 15c3 3 2-9 10-8" />
    <rect x="9" y="9" width="12" height="12" rx="1" />
  </svg>
);

export const InkToMathIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 16c3 3 3-10 10-8" />
    <path d="M13 13l4 4" />
    <path d="M17 13l-4 4" />
  </svg>
);

export const LassoIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3a9 9 0 0 0-9 9c0 5 4.5 8 9 8 1 0 2-.2 3-.7" />
    <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9c0 .9-.2 1.8-.5 2.6" />
    <path d="M12 12a1.5 1.5 0 1 0 2.6-1.5A4.5 4.5 0 0 1 21 12" />
  </svg>
);

export const InkReplayIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 12a9 9 0 1 1 2.6 6.4" />
    <path d="M3 6v6h6" />
    <path d="M8 17c3 3 2-5 8-5" />
  </svg>
);

export const CanvasIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="1" strokeDasharray="4 3" />
    <path d="M7 9h10" />
    <path d="M7 13h6" />
  </svg>
);

export const FontsIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 6l-2 12" />
    <path d="M4 15h6" />
    <path d="M14 18l4.5-12L23 18" />
    <path d="M15 14h7" />
  </svg>
);

export const EffectsIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="8" width="14" height="10" rx="1" />
    <path d="M19 6v3M19 15v3M17.5 7.5l2 2M17.5 16.5l2 2" />
  </svg>
);

export const SlideSizeIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="4" width="18" height="10" rx="1" />
    <path d="M3 18h18" />
    <path d="M7 18v2M17 18v2" />
  </svg>
);

export const PaintIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 13l7 7 9-9a1.6 1.6 0 0 0 0-2.2l-3.8-3.8a1.6 1.6 0 0 0-2.2 0l-10 8z" />
    <path d="M13 6l5 5" />
    <path d="M4 13l7 7" />
    <path d="M15 21h6" strokeWidth={1.2} />
  </svg>
);

export const MoreIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const HighlighterIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M9 11l4 4" />
    <path d="M17 3l4 4-8 8H9l-1-1v-4l9-9z" />
    <path d="M3 21l6-1" />
  </svg>
);

export const LayoutIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="9" x2="9" y2="21" />
  </svg>
);

export const TrashIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const ChartIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const CheckIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const ChevronDownIcon = ({ size = 12, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const EraserIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 20h8M10 15l6-6 4 4-6 7H6" />
    <path d="M19 6a2 2 0 0 0-3-2L5 14" />
  </svg>
);

export const FontSizeIncIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <polyline points="18 20 22 12 14 12 18 20 22 12 14 12" />
    <path d="M4 20l5.5-13M9.5 7H4M6 15h7" />
    <polyline points="8 3 8 6 5.5 6" />
  </svg>
);

export const FontSizeDecIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <polyline points="18 20 22 12 14 12 18 20 22 12 14 12" />
    <path d="M4 20l5.5-13M9.5 7H4M6 15h7" />
    <polyline points="6.5 3 8.5 3 4 3 5.5 6" />
  </svg>
);

export const FontColorIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3l-5 13M12 3l5 13M12 3v9" />
    <rect x="4" y="20" width="16" height="2" fill="currentColor" stroke="none" />
  </svg>
);

export const HighlighterColorIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M9 9l6 6L8 22l-6-6L9 9z" />
    <path d="M21 8L14 1l-6 7 6 6 7-6z" />
    <rect x="3" y="20" width="18" height="2" fill="currentColor" stroke="none" />
  </svg>
);

export const RemoveFormatIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M9 4h9l1 9" />
    <path d="M10 4l-1 5M5.5 22l6.5-15M21 5v13a2 2 0 0 1-2 2H5" />
  </svg>
);

export const IndentIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <polyline points="3 8 7 12 3 16" />
    <line x1="11" y1="6" x2="21" y2="6" />
    <line x1="11" y1="12" x2="21" y2="12" />
    <line x1="11" y1="18" x2="21" y2="18" />
  </svg>
);

export const OutdentIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <polyline points="7 8 3 12 7 16" />
    <line x1="11" y1="6" x2="21" y2="6" />
    <line x1="11" y1="12" x2="21" y2="12" />
    <line x1="11" y1="18" x2="21" y2="18" />
  </svg>
);

export const RectIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="1" fill="currentColor" opacity={0.6} />
  </svg>
);

export const CircleIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" fill="currentColor" opacity={0.6} />
  </svg>
);

export const TriangleIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <polygon points="12 3 22 20 2 20 12 3" fill="currentColor" opacity={0.6} />
  </svg>
);

export const DiamondIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="12" y="3" width="12.7" height="12.7" transform="rotate(45 12 3)" rx="1" fill="currentColor" opacity={0.6} />
  </svg>
);

export const ArrowIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 19l13-13M9 6h9v9" />
  </svg>
);

export const LineIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <line x1="3" y1="21" x2="21" y2="3" />
  </svg>
);

export const StarIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" opacity={0.6} />
  </svg>
);

export const HexagonIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" fill="currentColor" opacity={0.6} />
  </svg>
);

export const CloudIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 20a5 5 0 0 1 0-10 7 7 0 0 1 14 0 5 5 0 0 1 0 10H5z" fill="currentColor" opacity={0.5} />
  </svg>
);

export const HeartIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" opacity={0.5} />
  </svg>
);

export const TablePlusIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

export const CommentIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const ChartBarIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="3" y1="20" x2="21" y2="20" strokeWidth={2} />
  </svg>
);

export const TitleLayoutIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <rect x="6" y="7" width="12" height="4" fill="currentColor" opacity={0.5} />
  </svg>
);

export const TitleContentLayoutIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <rect x="6" y="6" width="12" height="3.5" fill="currentColor" opacity={0.5} />
    <rect x="6" y="11.5" width="12" height="7" fill="currentColor" opacity={0.2} />
  </svg>
);

export const TwoContentLayoutIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <rect x="6" y="6" width="12" height="3.5" fill="currentColor" opacity={0.5} />
    <rect x="6" y="11.5" width="5.5" height="7" fill="currentColor" opacity={0.2} />
    <rect x="12.5" y="11.5" width="5.5" height="7" fill="currentColor" opacity={0.2} />
  </svg>
);

export const BlankLayoutIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="1" />
  </svg>
);

export const SectionLayoutIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <rect x="6" y="8" width="12" height="3" fill="currentColor" opacity={0.5} />
    <rect x="6" y="13" width="9" height="2" fill="currentColor" opacity={0.3} />
  </svg>
);

export const FormatPainterIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 4h11v3H4z" />
    <path d="M6 7v7h7V7" />
    <path d="M9.5 14v6h-2" />
    <path d="M18 10l-1.2 2H22l-1.2-2z" stroke="none" fill="currentColor" />
    <path d="M15 10h5v3h-5z" fill="currentColor" strokeWidth={1.2} />
  </svg>
);

export const ResetIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <polyline points="20 2 20 8 14 8" />
  </svg>
);

export const NumberingIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <text x="2" y="8" fontSize="7" fontWeight="700" fill="currentColor" stroke="none" fontFamily="Segoe UI, Arial">1.</text>
    <text x="2" y="15" fontSize="7" fontWeight="700" fill="currentColor" stroke="none" fontFamily="Segoe UI, Arial">2.</text>
    <text x="2" y="22" fontSize="7" fontWeight="700" fill="currentColor" stroke="none" fontFamily="Segoe UI, Arial">3.</text>
    <line x1="9" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="9" y1="18" x2="21" y2="18" />
  </svg>
);

export const LineSpacingIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <line x1="3" y1="5" x2="21" y2="5" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="3" y1="20" x2="21" y2="20" />
    <path d="M7 2v22" opacity={0.5} />
  </svg>
);

export const FindIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="10" cy="10" r="6" />
    <line x1="14.5" y1="14.5" x2="21" y2="21" />
    <line x1="7" y1="10" x2="13" y2="10" strokeDasharray="2 2" opacity={0.7} />
  </svg>
);

export const ReplaceIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 10v4M3 14l-2-2M3 14l2-2" />
    <path d="M21 6v2M21 6l-2 2M21 6l2 2" />
    <path d="M6 12h16" />
    <line x1="18" y1="8" x2="18" y2="12" />
  </svg>
);

export const SelectIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 3l14 6-6 2-2 6z" />
    <path d="M13 13l6 6" />
  </svg>
);

export const AppLogo = ({ size = 20 }: IconProps) => (
  <div
    style={{ width: size, height: size }}
    className="bg-gradient-to-b from-[#c13b3b] to-[#c13b3b] rounded-sm flex items-center justify-center shadow-sm"
  >
    <svg viewBox="0 0 24 24" width={size - 6} height={size - 6} fill="white">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="white" opacity={0} />
      <path d="M4 6h.01M8 6h.01M12 6h.01M16 6h.01M20 6h.01M4 10h.01M8 10h.01M12 10h.01M16 10h.01M20 10h.01M4 14h.01M8 14h.01M12 14h.01M16 14h.01M20 14h.01M4 18h.01M8 18h.01M12 18h.01M16 18h.01M20 18h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  </div>
);

export const ThreeDIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
    <path d="M12 3v9M12 12l8-4.5M12 12l-8-4.5M12 21v-9" opacity="0.6" />
  </svg>
);

export const SmartArtIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="4" width="6" height="5" rx="1" />
    <rect x="14" y="9.5" width="7" height="5" rx="1" />
    <rect x="3" y="15" width="6" height="5" rx="1" />
    <path d="M9 6.5h3M12 6.5l2 1.5M9 17.5h3M12 17.5l2-1.5" />
  </svg>
);

export const AddinsIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 13h18M8 13v8" opacity="0.6" />
    <path d="M7 7h2M7 10h5" opacity="0.5" />
  </svg>
);

export const ActionIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M11 4h9v4M20 4l-9 9" />
    <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
  </svg>
);

export const LinkIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.6 1.6" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19" />
  </svg>
);

export const HeaderFooterIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="M3 9h18M8 13h3M8 16h6" />
  </svg>
);

export const WordArtIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 5h10M4 5v6a2 2 0 0 0 2 2h8" />
    <path d="M20 8v11M20 8h-3M20 8l-4 7M20 12l-3-4" />
  </svg>
);

export const DateIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4M8 14h3M8 17h2M15 14h3M16 17h2" />
  </svg>
);

export const SlideNumberIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="M9 9v6M9 9h3M9 12h2" />
    <path d="M15 9l3 6M15 15l3-6" />
  </svg>
);

export const ObjectIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="7" cy="7" r="3" />
    <circle cx="17" cy="17" r="3" />
    <path d="M9 5l8 8M15 5l2 2M5 15l2 2M7 8v6" opacity="0.5" />
  </svg>
);

export const EquationIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 8h18M8 8a4 4 0 0 1 8-4M16 16a4 4 0 0 1-8 4M3 16h18" />
    <path d="M8 8v8M16 8v8" opacity="0.5" />
  </svg>
);

export const SymbolIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="9" r="6" />
    <path d="M12 15l-4 6M12 15l4 6M8 18h8" />
  </svg>
);

export const VideoIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="6" width="12" height="12" rx="2" />
    <path d="M15 11l6-3v8l-6-3z" />
  </svg>
);

export const AudioIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 14v-4a1 1 0 0 1 1-1h2l4-5v16l-4-5H5a1 1 0 0 1-1-1z" />
    <path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" opacity="0.7" />
  </svg>
);

export const ScreenRecIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="5" width="18" height="12" rx="2" />
    <path d="M12 5v12M12 5l-2 2M12 7l-2-2M12 5l2 2M12 7l2-2" opacity="0.3" />
    <circle cx="12" cy="11" r="2" fill="currentColor" stroke="none" />
    <path d="M9 20h6" />
  </svg>
);