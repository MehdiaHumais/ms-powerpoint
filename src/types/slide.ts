// src/types/slide.ts
export interface Slide {
  id: number;
  presentation_id: number;
  order: number;
  title?: string | null;
  content: string;
}