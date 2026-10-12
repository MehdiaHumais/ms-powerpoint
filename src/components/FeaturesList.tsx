// src/components/FeaturesList.tsx
import type { ReactNode } from "react";

type Feature = {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
};

const features: Feature[] = [
  {
    id: 1,
    title: "Real‑time Collaboration",
    description: "Edit together with teammates, see changes instantly.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h8M12 10hM16 10hM9 14h6M9 18h6"
        />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Rich Media Support",
    description: "Insert images, videos, and charts with ease.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7h18M3 12h18M3 17h18"
        />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Template Library",
    description: "Start from professionally designed templates.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
  },
];

export default function FeaturesList() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((f) => (
        <div
          key={f.id}
          className="bg-cardBg rounded-xl shadow-card p-6 flex flex-col items-center text-center"
        >
          <div className="mb-4">{f.icon}</div>
          <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
          <p className="text-muted">{f.description}</p>
        </div>
      ))}
    </div>
  );
}