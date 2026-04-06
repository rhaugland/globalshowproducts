import {Link} from 'react-router';

const shopLinks = [
  {label: 'Scooters', to: '/collections/scooters'},
  {label: 'Toys', to: '/collections/toys'},
  {label: 'Tools & Kits', to: '/collections/tools-kits'},
  {label: 'Home & Nature', to: '/collections/home-nature'},
  {label: 'Specials', to: '/collections/specials'},
];

const companyLinks = [
  {label: 'About Us', to: '/about'},
  {label: 'My Account', to: '/account'},
];

const brands = [
  'Ribbon Fair',
  'Euro Scooter',
  'Funny Gears',
  'Magic Sand',
  'Puzzle Car',
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Column 1: Brand */}
          <div>
            <h3 className="text-lg font-bold">Global Show Products</h3>
            <p className="mt-2 text-sm text-white/70">
              Premium products for every showroom, delivered worldwide.
            </p>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
              Shop
            </h4>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 transition-colors hover:text-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
              Company
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 transition-colors hover:text-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom: Brands + copyright */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-xs text-white/50">Our Brands:</span>
            {brands.map((brand) => (
              <span
                key={brand}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"
              >
                {brand}
              </span>
            ))}
          </div>
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Global Show Products. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
