import {useState} from 'react';
import {Link} from 'react-router';

export function Header({cartCount}: {cartCount: number}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      {/* Top accent bar */}
      <div className="h-1 bg-fun-gradient" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/logo.jpg"
            alt="Global Show Products"
            className="h-10 w-auto"
          />
        </Link>

        {/* Center: Desktop nav */}
        <nav className="hidden gap-8 md:flex">
          <Link to="/collections" className="font-semibold text-charcoal transition-colors hover:text-orange">
            Shop
          </Link>
          <Link to="/collections/scooters" className="font-semibold text-charcoal transition-colors hover:text-cyan">
            Scooters
          </Link>
          <Link to="/collections/toys" className="font-semibold text-charcoal transition-colors hover:text-green">
            Toys
          </Link>
          <Link to="/about" className="font-semibold text-charcoal transition-colors hover:text-orange">
            About
          </Link>
        </nav>

        {/* Right: Icon links */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <Link to="/search" aria-label="Search" className="rounded-full p-2 text-charcoal transition-colors hover:bg-sage hover:text-cyan">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </Link>

          {/* Account */}
          <Link to="/account" aria-label="Account" className="rounded-full p-2 text-charcoal transition-colors hover:bg-sage hover:text-cyan">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>

          {/* Cart */}
          <Link to="/cart" aria-label="Cart" className="relative rounded-full p-2 text-charcoal transition-colors hover:bg-sage hover:text-cyan">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 5h12.8M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-bounce-in items-center justify-center rounded-full bg-orange text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-charcoal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <Link to="/collections" className="block py-2 font-semibold text-charcoal hover:text-orange" onClick={() => setMobileOpen(false)}>
            Shop All
          </Link>
          <Link to="/collections/scooters" className="block py-2 font-semibold text-charcoal hover:text-cyan" onClick={() => setMobileOpen(false)}>
            Scooters
          </Link>
          <Link to="/collections/toys" className="block py-2 font-semibold text-charcoal hover:text-green" onClick={() => setMobileOpen(false)}>
            Toys
          </Link>
          <Link to="/about" className="block py-2 font-semibold text-charcoal hover:text-orange" onClick={() => setMobileOpen(false)}>
            About
          </Link>
        </nav>
      )}
    </header>
  );
}
