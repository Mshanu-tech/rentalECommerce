import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight, ArrowUp, Mail, MapPin, MessageCircle, Phone, ShoppingBag } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import MobileBottomNav from '../components/MobileBottomNav';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const linkClass = 'text-stone-400 transition hover:text-white';

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <ScrollToTop />
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      <footer className="hidden bg-gray-900 text-sm text-gray-400 md:block">
        <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
          {/* Call to action */}
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-stone-800 pb-12">
            <h2 className="max-w-md font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Need a hand with something?
            </h2>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-400"
            >
              Message the shop <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
            <div>
              <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-white">
                <ShoppingBag className="h-5 w-5 text-primary-500" aria-hidden="true" />
                ShopEase
              </Link>
              <p className="mt-3 max-w-xs leading-relaxed">
                Quality products, honest prices and delivery you can track.
              </p>
            </div>

            <nav aria-label="Shop">
              <h3 className="font-semibold text-white">Shop</h3>
              <ul className="mt-4 space-y-2.5">
                <li><Link to="/products" className={linkClass}>All products</Link></li>
                <li><Link to="/wishlist" className={linkClass}>Wishlist</Link></li>
                <li><Link to="/cart" className={linkClass}>Cart</Link></li>
                <li><Link to="/orders" className={linkClass}>My orders</Link></li>
              </ul>
            </nav>

            <nav aria-label="Company">
              <h3 className="font-semibold text-white">Company</h3>
              <ul className="mt-4 space-y-2.5">
                <li><Link to="/about" className={linkClass}>About us</Link></li>
                <li><Link to="/contact" className={linkClass}>Contact us</Link></li>
                <li><Link to="/account" className={linkClass}>My account</Link></li>
                <li><Link to="/messages" className={linkClass}>Messages</Link></li>
              </ul>
            </nav>

            <div>
              <h3 className="font-semibold text-white">Get in touch</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <span className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 flex-shrink-0 text-primary-500" aria-hidden="true" /> dummy.com
                  </span>
                </li>
                <li>
                  <a href="tel:+917592825349" className={`${linkClass} flex items-center gap-2.5`}>
                    <Phone className="h-4 w-4 flex-shrink-0 text-primary-500" aria-hidden="true" /> 7592825349
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" aria-hidden="true" /> 123 Market Street, Your City
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-stone-500 sm:px-6">
            <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
            <p>Pay with Razorpay or Cash on Delivery</p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 font-medium text-stone-300 transition hover:text-white"
            >
              Back to top <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>

      <MobileBottomNav />

      <a
        href="https://wa.me/917592825349"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with ShopEase on WhatsApp"
        title="Chat with us on WhatsApp"
        className="group fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-900/20 transition duration-200 hover:scale-110 hover:bg-[#20BA5A] hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/30 motion-reduce:transition-none md:bottom-6 md:right-6"
      >
        <span className="pointer-events-none absolute -inset-1 rounded-full bg-[#25D366]/25 motion-safe:animate-pulse motion-reduce:animate-none" aria-hidden="true" />
        <span className="relative flex h-9 w-9 items-center justify-center transition-transform duration-200 group-hover:rotate-[-8deg] motion-reduce:transition-none" aria-hidden="true">
          <MessageCircle className="h-9 w-9 stroke-[2.5]" />
          <Phone className="absolute h-4 w-4 fill-[#25D366] stroke-white stroke-[2.8]" />
        </span>
        <span className="pointer-events-none absolute right-full mr-3 hidden -translate-x-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block">
          Chat with us on WhatsApp
        </span>
      </a>

    </div>
  );
}
