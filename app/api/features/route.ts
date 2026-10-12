import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const features = [
    {
      id: 1,
      title: 'Real‑time Collaboration',
      description: 'Edit together with teammates, see changes instantly.',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.M12 10h.M16 10h.M9 14h6M9 18h6" />
        </svg>
      `,
    },
    {
      id: 2,
      title: 'Rich Media Support',
      description: 'Insert images, videos, and charts with ease.',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" />
        </svg>
      `,
    },
    {
      id: 3,
      title: 'Template Library',
      description: 'Start from professionally designed templates.',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      `,
    },
  ];

  return NextResponse.json(features);
}