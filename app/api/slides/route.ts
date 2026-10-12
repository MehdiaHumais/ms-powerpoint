import { NextResponse } from "next/server";

export type Slide = {
  id: string;
  title: string;
  content: string;
};

const slides: Slide[] = [
  { id: "1", title: "Welcome", content: "Welcome to the presentation." },
  { id: "2", title: "Agenda", content: "1. Introduction\n2. Overview\n3. Q&A" },
];

export async function GET(request: Request) {
  // Simulate a slight delay for demo purposes
  await new Promise((resolve) => setTimeout(resolve, 500));
  return NextResponse.json(slides);
}