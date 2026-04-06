import {Link} from 'react-router';

const shopLinks = [
  {label: 'Scooters', to: '/collections/scooters', color: 'hover:text-cyan'},
  {label: 'Toys', to: '/collections/toys', color: 'hover:text-green'},
  {label: 'Tools & Kits', to: '/collections/tools-kits', color: 'hover:text-orange'},
  {label: 'Home & Nature', to: '/collections/home-nature', color: 'hover:text-cyan'},
  {label: 'Specials', to: '/collections/specials', color: 'hover:text-orange'},
];

const companyLinks = [
  {label: 'About Us', to: '/about'},
  {label: 'My Account', to: '/account'},
];

const brands = [
  {name: 'Ribbon Fair', color: 'bg-orange/20 text-orange'},
  {name: 'Euro Scooter', color: 'bg-cyan/20 text-cyan'},
  {name: 'Funny Gears', color: 'bg-green/20 text-green'},
  {name: 'Magic Sand', color: 'bg-orange/20 text-orange'},
  {name: 'Puzzle Car', color: 'bg-cyan/20 text-cyan'},
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      {/* Colorful top border */}
      <div className="flex h-1">
        <div className="flex-1 bg-orange" />
        <div className="flex-1 bg-green" />
        <div className="flex-1 bg-cyan" />
        <div className="flex-1 bg-orange" />
        <div className="flex-1 bg-green" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Column 1: Brand */}
          <div>
            <img
              src="/images/logo.jpg"
              alt="Global Show Products"
              className="h-10 w-auto rounded bg-white p-1"
            />
            <p className="mt-4 text-sm text-white/70">
              Home of Ribbon Fair Crafts & Games and Euro Scooters. Quality products, friendly service, reliable shipping.
            </p>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-cyan">
              Shop
            </h4>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`text-sm text-white/70 transition-colors ${link.color}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-cyan">
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
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-white/50">Our Brands:</span>
            {brands.map((brand) => (
              <span
                key={brand.name}
                className={`rounded-full px-3 py-1 text-xs font-bold ${brand.color}`}
              >
                {brand.name}
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
