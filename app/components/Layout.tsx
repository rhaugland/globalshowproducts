import {useState, useEffect} from 'react';
import {Header} from './Header';
import {Footer} from './Footer';
import {DemoBadge} from './DemoBadge';
import {getCartCount} from '~/lib/cart';

export function AppLayout({children}: {children: React.ReactNode}) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    const interval = setInterval(() => {
      setCartCount(getCartCount());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-brand-gray">
      <Header cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <Footer />
      <DemoBadge />
    </div>
  );
}
