import {useState, useCallback} from 'react';
import {Link} from 'react-router';
import {SearchOverlay} from './SearchOverlay';
import {CartDrawer} from './CartDrawer';

const navItems = [
  {
    label: 'Our Brands',
    to: '/collections',
    children: [
      {label: 'Euro Scooter', to: '/collections/scooters'},
      {label: 'Funny Gears', to: '/collections/toys'},
      {label: 'Ribbon Fair', to: '/collections/tools-kits'},
      {label: 'Magic Sand', to: '/collections/toys'},
    ],
  },
  {
    label: 'Store',
    to: '/collections',
    children: [
      {label: 'All Products', to: '/collections'},
      {label: 'Home & Nature', to: '/collections/home-nature'},
      {label: 'Scooters', to: '/collections/scooters'},
      {label: 'Specials', to: '/collections/specials'},
      {label: 'Tools & Kits', to: '/collections/tools-kits'},
      {label: 'Toys', to: '/collections/toys'},
    ],
  },
  {label: 'About', to: '/about'},
  {
    label: 'Interact',
    to: '/events',
    children: [
      {label: 'Upcoming Events', to: '/events'},
      {label: 'Videos', to: '/videos'},
      {label: 'Admin', to: '/admin'},
    ],
  },
  {label: 'Contact Us', to: '/contact'},
];

function DesktopDropdown({item}: {item: (typeof navItems)[0]}) {
  return (
    <div className="group relative">
      <Link
        to={item.to}
        className="flex items-center gap-1 py-4 text-sm font-semibold text-brand-gray transition-colors hover:text-brand-red"
      >
        {item.label}
        {item.children && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </Link>
      {item.children && (
        <div className="invisible absolute left-0 top-full z-50 min-w-[200px] rounded-b-lg border border-t-0 border-gray-200 bg-white py-2 shadow-lg opacity-0 transition-all group-hover:visible group-hover:opacity-100">
          {item.children.map((child) => (
            <Link
              key={child.label}
              to={child.to}
              className="block px-4 py-2 text-sm text-brand-gray transition-colors hover:bg-gray-50 hover:text-brand-red"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileAccordion({
  item,
  onNavigate,
}: {
  item: (typeof navItems)[0];
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!item.children) {
    return (
      <Link
        to={item.to}
        className="block border-b border-gray-100 px-4 py-3 text-sm font-semibold text-brand-gray hover:text-brand-red"
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-gray-100">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-brand-gray hover:text-brand-red"
        onClick={() => setOpen(!open)}
      >
        {item.label}
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="bg-gray-50 pb-2">
          {item.children.map((child) => (
            <Link
              key={child.label}
              to={child.to}
              className="block px-8 py-2 text-sm text-brand-gray-light hover:text-brand-red"
              onClick={onNavigate}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header({cartCount}: {cartCount: number}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  return (
    <header className="sticky top-0 z-40">
      {/* Tier 1: Utility bar */}
      <div className="bg-brand-gray text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div className="flex items-center gap-4">
            <Link to="/contact" className="text-xs text-white/70 transition-colors hover:text-white">
              Contact Us
            </Link>
            <span className="text-white/30">|</span>
            <Link to="/account" className="text-xs text-white/70 transition-colors hover:text-white">
              My Account
            </Link>
            <span className="text-white/30">|</span>
            <Link to="/wishlist" className="flex items-center gap-1 text-xs text-white/70 transition-colors hover:text-white">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Wishlist
            </Link>
          </div>
          {/* Search bar */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs text-white/60 transition hover:bg-white/20 hover:text-white/80"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <span className="hidden sm:inline">Search for products</span>
            <span className="sm:hidden">Search</span>
          </button>
        </div>
      </div>

      {/* Tier 2: Main nav */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center py-2">
            <img
              src="/images/logo.jpg"
              alt="Global Show Products"
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop nav + cart */}
          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <DesktopDropdown key={item.label} item={item} />
              ))}
            </nav>
            <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative p-2 text-brand-gray transition-colors hover:text-brand-red">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 5h12.8M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative p-2 text-brand-gray transition-colors hover:text-brand-red">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 5h12.8M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              <svg className="h-6 w-6 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-b border-gray-200 bg-white md:hidden">
          {navItems.map((item) => (
            <MobileAccordion
              key={item.label}
              item={item}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </nav>
      )}

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </header>
  );
}
