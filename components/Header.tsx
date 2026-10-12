import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-6">
      <h1 className="text-3xl font-extrabold text-white drop-shadow-md">
        PowerPoint Clone
      </h1>
      <nav className="flex space-x-4">
        <Link href="#features">
          <a className="text-white hover:text-accent transition-colors">
            Features
          </a>
        </Link>
        <Link href="#contact">
          <a className="text-white hover:text-accent transition-colors">
            Contact
          </a>
        </Link>
      </nav>
    </header>
  );
}