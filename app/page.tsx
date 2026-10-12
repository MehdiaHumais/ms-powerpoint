import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturesList from '@/components/FeaturesList';

export default function HomePage() {
  return (
    <main className="w-full max-w-5xl mx-auto bg-white/90 backdrop-filter backdrop-blur-lg rounded-3xl shadow-card p-8">
      <Header />
      <Hero />
      <section id="features" className="py-12">
        <h2 className="text-3xl font-bold text-dark text-center mb-8">
          Features
        </h2>
        <FeaturesList />
      </section>
    </main>
  );
}