import Link from 'next/link';

export default function Hero() {
  return (
    <section className="text-center py-20 max-w-3xl mx-auto">
      <h2 className="text-5xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-accent">
        Create Stunning Presentations in Minutes
      </h2>
      <p className="text-lg text-white/90 mb-8">
        A premium, fast, and collaborative editor that feels like the real PowerPoint.
      </p>
      <Link href="#features">
        <a className="inline-block bg-accent text-dark font-semibold px-6 py-3 rounded-2xl shadow-button transform transition-transform hover:scale-105">
          Explore Features
        </a>
      </Link>
    </section>
  );
}