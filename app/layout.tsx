import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PowerPoint Clone',
  description: 'A modern, premium PowerPoint-like presentation editor.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-gradient-to-br from-primary to-accent min-h-screen flex items-center justify-center p-4">
        {children}
      </body>
    </html>
  );
}