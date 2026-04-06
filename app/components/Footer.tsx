import {Link} from 'react-router';

const helpLinks = [
  {label: 'My Account', to: '/account'},
  {label: 'Contact Us', to: '/about'},
  {label: 'Privacy Policy', to: '/about'},
  {label: 'Shipping Info', to: '/about'},
  {label: 'Terms of Use', to: '/about'},
];

const categoryLinks = [
  {label: 'Home & Nature', to: '/collections/home-nature'},
  {label: 'Scooters', to: '/collections/scooters'},
  {label: 'Specials', to: '/collections/specials'},
  {label: 'Tools & Kits', to: '/collections/tools-kits'},
  {label: 'Toys', to: '/collections/toys'},
];

const socialLinks = [
  {label: 'Facebook', icon: 'fb', href: '#'},
  {label: 'YouTube', icon: 'yt', href: '#'},
  {label: 'Pinterest', icon: 'pin', href: '#'},
  {label: 'Instagram', icon: 'ig', href: '#'},
  {label: 'Etsy', icon: 'etsy', href: '#'},
];

function SocialIcon({type}: {type: string}) {
  const icons: Record<string, string> = {
    fb: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
    yt: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z',
    pin: 'M12 2C6.48 2 2 6.48 2 12c0 4.25 2.67 7.9 6.44 9.34-.09-.78-.17-1.99.04-2.85.18-.78 1.2-5.1 1.2-5.1s-.31-.61-.31-1.52c0-1.42.82-2.49 1.85-2.49.87 0 1.29.66 1.29 1.44 0 .88-.56 2.19-.85 3.41-.24 1.02.51 1.85 1.52 1.85 1.82 0 3.22-1.92 3.22-4.69 0-2.45-1.76-4.17-4.27-4.17-2.91 0-4.62 2.18-4.62 4.44 0 .88.34 1.82.76 2.34.08.1.1.19.07.29l-.29 1.15c-.04.18-.15.22-.34.13-1.26-.59-2.05-2.42-2.05-3.9 0-3.17 2.3-6.08 6.64-6.08 3.49 0 6.19 2.49 6.19 5.81 0 3.46-2.18 6.25-5.21 6.25-1.02 0-1.98-.53-2.31-1.15l-.63 2.39c-.23.88-.85 1.98-1.27 2.66A10 10 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z',
    ig: 'M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm3.5-5.5a1 1 0 110-2 1 1 0 010 2z',
    etsy: 'M9.16 4.5C9.16 4.5 8 4.5 8 5.75v2.75H6.5v2h1.5v5c0 2 1 3 3.16 3H13v-2h-1.34c-.83 0-1-.42-1-1.04V10.5h2.5v-2h-2.5V4.5h-1.5z',
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d={icons[type] || icons.fb} />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-brand-gray text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Column 1: Help */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-red">
              How Can We Help?
            </h4>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Payment */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-red">
              Payment Methods
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Visa', 'MC', 'Amex', 'Discover', 'PayPal'].map((m) => (
                <span key={m} className="rounded bg-white/10 px-2 py-1 text-xs font-semibold text-white/60">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Column 3: Shipping */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-red">
              Shippers
            </h4>
            <div className="flex flex-wrap gap-2">
              {['USPS', 'UPS', 'FedEx'].map((s) => (
                <span key={s} className="rounded bg-white/10 px-2 py-1 text-xs font-semibold text-white/60">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Column 4: Follow Us */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-red">
              Follow Us
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="text-white/50 transition-colors hover:text-white"
                >
                  <SocialIcon type={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 5: Product Categories */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-red">
              Product Categories
            </h4>
            <ul className="space-y-2">
              {categoryLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <img src="/images/logo.jpg" alt="Global Show Products" className="h-8 w-auto rounded bg-white p-0.5" />
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Global Show Products. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
