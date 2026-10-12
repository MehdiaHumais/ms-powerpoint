import { ReactNode } from 'react';

export default function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/90 backdrop-filter backdrop-blur-lg rounded-3xl shadow-card p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-dark mb-2">{title}</h3>
      <p className="text-sm text-dark/70">{description}</p>
    </div>
  );
}