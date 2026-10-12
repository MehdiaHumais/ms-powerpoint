'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import FeatureCard from './FeatureCard';

type Feature = {
  id: number;
  title: string;
  description: string;
  icon: string; // SVG string
};

export default function FeaturesList() {
  const [features, setFeatures] = useState<Feature[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/features')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch features');
        return res.json();
      })
      .then((data: Feature[]) => {
        setFeatures(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (features && features.length === 0)
    return (
      <p className="text-center text-white/70 py-8">
        No features available at the moment.
      </p>
    );

  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {features?.map((f) => (
        <FeatureCard
          key={f.id}
          title={f.title}
          description={f.description}
          icon={<span dangerouslySetInnerHTML={{ __html: f.icon }} />}
        />
      ))}
    </div>
  );
}