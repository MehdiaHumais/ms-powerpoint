export type ThemeDef = {
  name: string;
  accent: string;
  bg: string;
  title: string;
  body: string;
  decor: string;
};

/** Theme gallery shared by the Design tab and the Slide Master view. */
export const THEMES: ThemeDef[] = [
  { name: "Office", accent: "#4472c4", bg: "#ffffff", title: "#1f3864", body: "#404040", decor: "none" },
  { name: "Slate", accent: "#44546a", bg: "#eef1f5", title: "#1f2a37", body: "#3f4a5a", decor: "band-bottom" },
  { name: "Azure", accent: "#2f5b8f", bg: "#e8f1fb", title: "#12385f", body: "#2d4a68", decor: "band-left" },
  { name: "Forest", accent: "#3a7d44", bg: "#eaf5ec", title: "#1e4d26", body: "#33553a", decor: "corner-bl" },
  { name: "Sunset", accent: "#d35400", bg: "#fdefe4", title: "#8a3200", body: "#5c3a28", decor: "wedge" },
  { name: "Royal", accent: "#7030a0", bg: "#f2e9fa", title: "#4a1f70", body: "#4b3a5e", decor: "band-bottom" },
];
