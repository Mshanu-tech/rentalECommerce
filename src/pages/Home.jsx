import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Headphones,
  ImageOff,
  RotateCcw,
  ShieldCheck,
  Tag,
  Truck,
} from 'lucide-react';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';
import { getImageUrl } from '../services/api';
import { discountPercent, formatPrice } from '../utils/format';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';

const FEATURES = [
  { icon: Truck, title: 'Fast delivery', text: 'Quick shipping with live order tracking.' },
  { icon: ShieldCheck, title: 'Secure payments', text: 'Razorpay or Cash on Delivery.' },
  { icon: RotateCcw, title: 'Easy cancellation', text: 'Cancel before it ships, hassle-free.' },
  { icon: Headphones, title: 'Friendly support', text: 'We reply to every message.' },
];

function primaryImage(product) {
  return product?.images?.find((i) => i.isPrimary) || product?.images?.[0];
}

function SectionHeading({ title, subtitle, to, linkLabel = 'View all' }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="inline-flex flex-shrink-0 items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
          {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function GridSkeleton({ count = 4 }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    Promise.all([
      productService.listProducts().catch(() => []),
      categoryService.listCategories().catch(() => []),
    ]).then(([p, c]) => {
      setProducts(p.filter((item) => item.is_active !== 0 && item.is_active !== false));
      setCategories(c);
      setLoading(false);
    });
  }, []);

  const { newArrivals, deals, topRated, featured, spotlight, maxDiscount } = useMemo(() => {
    const inStock = products.filter((p) => Number(p.stock_quantity) > 0);
    const withDiscount = inStock
      .map((p) => ({ p, d: discountPercent(p.price, p.compare_at_price) }))
      .filter((x) => x.d)
      .sort((a, b) => b.d - a.d);
    const rated = inStock.filter((p) => p.reviewCount > 0).sort((a, b) => b.ratingAverage - a.ratingAverage || b.reviewCount - a.reviewCount);
    // The "unique pick": the best-reviewed product, else the biggest discount, else the newest.
    // Admin-featured products (in stock) come first; the Editor's pick is the newest featured one.
    const featuredList = inStock.filter((p) => p.is_featured === 1 || p.is_featured === true);
    const pick = featuredList[0] || rated[0] || withDiscount[0]?.p || inStock[0] || null;
    return {
      newArrivals: products.slice(0, 8), // API already orders newest first
      deals: withDiscount.slice(0, 4).map((x) => x.p),
      topRated: rated.slice(0, 4),
      featured: featuredList.slice(0, 8),
      spotlight: pick,
      maxDiscount: withDiscount[0]?.d || null,
    };
  }, [products]);

  const heroImage = primaryImage(spotlight);
  const gallery = spotlight?.images?.slice(0, 5) || [];
  const shownImage = gallery[activeImage] || heroImage;
  const spotlightDiscount = spotlight ? discountPercent(spotlight.price, spotlight.compare_at_price) : null;
  const spotlightStock = spotlight ? Number(spotlight.stock_quantity) : 0;

  return (
    <div>
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-stone-50">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-14 pt-8 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:gap-12 md:pb-24 md:pt-16">
          <div className="w-full">
            <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-stone-900 sm:text-5xl lg:text-7xl">
              Find something you'll actually use every day.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-stone-600 sm:mt-6 sm:text-lg">
              Handpicked products at honest prices, with live tracking from checkout to your door.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2 sm:mt-8 sm:gap-3">
              <Link to="/products" className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-600 sm:gap-2 sm:px-7 sm:py-3.5 sm:text-sm">
                Shop the collection <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              </Link>
              {deals.length > 0 && (
                <Link to="/products" className="inline-flex items-center rounded-full border border-stone-300 px-4 py-3 text-xs font-semibold text-stone-800 transition hover:border-stone-900 sm:px-6 sm:py-3.5 sm:text-sm">
                  See today's deals
                </Link>
              )}
            </div>
{/* 
            {categories.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2 sm:mt-10">
                <span className="shrink-0 text-sm text-stone-500">Jump to</span>
                <div className="flex flex-wrap items-center gap-2">
                  {categories.slice(0, 5).map((c) => (
                    <Link
                      key={c.id}
                      to={`/products?categoryId=${c.id}`}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-700 ring-1 ring-stone-200 transition hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-300 sm:px-4 sm:text-sm"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )} */}
          </div>

          <div className="relative mx-auto hidden w-full max-w-md md:block">
            <div className="absolute -right-3 top-5 h-full w-full rounded-t-[999px] rounded-b-[2rem] bg-primary-500" aria-hidden="true" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-stone-200">
              {heroImage ? (
                <img src={getImageUrl(heroImage.url)} alt={spotlight.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-400"><ImageOff className="h-16 w-16" aria-hidden="true" /></div>
              )}
            </div>

            {maxDiscount && (
              <div className="absolute -left-3 top-16 flex h-24 w-24 rotate-[-10deg] flex-col items-center justify-center rounded-full bg-stone-900 text-center text-white shadow-lg sm:-left-8 sm:h-28 sm:w-28">
                <span className="text-xs text-stone-300">Up to</span>
                <span className="font-display text-3xl font-extrabold leading-none">{maxDiscount}%</span>
                <span className="text-xs text-stone-300">off</span>
              </div>
            )}

            {spotlight && (
              <Link
                to={`/products/${spotlight.id}`}
                className="absolute -bottom-5 left-3 right-3 flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-stone-100 transition hover:-translate-y-0.5 sm:left-auto sm:right-[-1.5rem] sm:w-64"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-stone-900">{spotlight.name}</span>
                  <span className="mt-0.5 flex items-baseline gap-2">
                    <span className="font-display text-lg font-bold text-primary-600">{formatPrice(spotlight.price)}</span>
                    {spotlight.compare_at_price > spotlight.price && (
                      <span className="text-xs text-stone-400 line-through">{formatPrice(spotlight.compare_at_price)}</span>
                    )}
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 flex-shrink-0 text-stone-400" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="hidden text-xs text-gray-500 sm:block">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:space-y-16 sm:px-6 sm:py-12">
        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <SectionHeading title="Shop by category" to="/products" />
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {categories.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  to={`/products?categoryId=${c.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-primary-300 hover:shadow-md sm:p-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 sm:text-base">{c.name}</p>
                    <p className="mt-0.5 text-[10px] text-primary-600 sm:text-xs">Browse →</p>
                  </div>
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white sm:h-10 sm:w-10 sm:text-lg">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Offers */}
        <section className="grid gap-4 md:grid-cols-3">
          <Link to="/products" className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 p-6 text-white transition hover:shadow-lg md:col-span-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium"><Tag className="h-3 w-3" aria-hidden="true" /> Limited-time offers</span>
            <h3 className="mt-3 text-2xl font-bold">{maxDiscount ? `Save up to ${maxDiscount}% today` : 'Fresh deals every week'}</h3>
            <p className="mt-1 text-sm text-white/75">Discounted picks across the store while stocks last.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-300">Grab the deals <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </Link>
          <div className="rounded-2xl bg-primary-50 p-6">
            <Truck className="h-7 w-7 text-primary-600" aria-hidden="true" />
            <h3 className="mt-3 text-lg font-bold text-gray-900">Track every order</h3>
            <p className="mt-1 text-sm text-gray-600">Live status updates by email and in-app notifications.</p>
          </div>
        </section>

        {/* Deals */}
        {(loading || deals.length > 0) && (
          <section>
            <SectionHeading title="Today's best deals" subtitle="Biggest discounts, in stock now." to="/products" />
            {loading ? <GridSkeleton /> : (
              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {deals.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </section>
        )}

        {/* Editor's pick */}
        {spotlight && (
          <section aria-labelledby="editors-pick" className="overflow-hidden rounded-[1.5rem] bg-stone-900 text-white sm:rounded-[2rem]">
            <div className="grid md:grid-cols-2">
              <div className="hidden p-3 sm:block sm:p-6">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-800 sm:rounded-3xl">
                  {shownImage ? (
                    <img src={getImageUrl(shownImage.url)} alt={spotlight.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-600"><ImageOff className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden="true" /></div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-primary-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow sm:left-4 sm:top-4 sm:px-3.5 sm:py-1.5 sm:text-sm">
                    Editor's pick
                  </span>
                </div>
                {gallery.length > 1 && (
                  <div className="mt-2.5 flex gap-2 sm:mt-3">
                    {gallery.map((img, i) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        aria-label={`Show photo ${i + 1}`}
                        aria-current={i === activeImage}
                        className={`h-12 w-12 overflow-hidden rounded-xl ring-2 transition sm:h-20 sm:w-20 ${i === activeImage ? 'ring-primary-500' : 'opacity-60 ring-transparent hover:opacity-100'}`}
                      >
                        <img src={getImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center p-4 sm:p-10 lg:p-14">
                {spotlight.category_name && <p className="text-xs font-medium text-primary-300 sm:text-sm">{spotlight.category_name}</p>}
                <h2 id="editors-pick" className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
                  {spotlight.name}
                </h2>
                {spotlight.reviewCount > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-stone-300 sm:mt-3 sm:text-sm">
                    <StarRating value={spotlight.ratingAverage} />
                    <span>{spotlight.ratingAverage.toFixed(1)} from {spotlight.reviewCount} {spotlight.reviewCount === 1 ? 'review' : 'reviews'}</span>
                  </div>
                )}
                {spotlight.description && <p className="mt-3 line-clamp-3 max-w-lg text-sm leading-relaxed text-stone-300 sm:mt-5 sm:text-base">{spotlight.description}</p>}

                <ul className="mt-4 space-y-2 text-xs text-stone-200 sm:mt-6 sm:space-y-2.5 sm:text-sm">
                  {spotlight.reviewCount > 0 && (
                    <li className="flex items-center gap-2.5"><Check className="h-3.5 w-3.5 flex-shrink-0 text-primary-400 sm:h-4 sm:w-4" aria-hidden="true" /> Among our best-reviewed products</li>
                  )}
                  {spotlightDiscount && (
                    <li className="flex items-center gap-2.5"><Check className="h-3.5 w-3.5 flex-shrink-0 text-primary-400 sm:h-4 sm:w-4" aria-hidden="true" /> You save {formatPrice(spotlight.compare_at_price - spotlight.price)} ({spotlightDiscount}% off)</li>
                  )}
                  <li className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary-400 sm:h-4 sm:w-4" aria-hidden="true" />
                    {spotlightStock > 0 && spotlightStock <= 5 ? `Only ${spotlightStock} left in stock` : 'In stock and ready to ship'}
                  </li>
                </ul>

                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-3 sm:mt-8 sm:gap-x-6">
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="font-display text-2xl font-bold sm:text-4xl">{formatPrice(spotlight.price)}</span>
                    {spotlight.compare_at_price > spotlight.price && <span className="text-sm text-stone-500 line-through sm:text-lg">{formatPrice(spotlight.compare_at_price)}</span>}
                  </div>
                  <Link to={`/products/${spotlight.id}`} className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-3 text-xs font-semibold text-white transition hover:bg-primary-400 sm:px-7 sm:py-3.5 sm:text-sm">
                    View product <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Featured products (admin-curated) */}
        {featured.length > 0 && (
          <section>
            <SectionHeading title="Featured products" subtitle="Hand-picked by our team." to="/products" />
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* New arrivals */}
        <section>
          <SectionHeading title="New arrivals" subtitle="Just added to the store." to="/products" />
          {loading ? <GridSkeleton count={8} /> : newArrivals.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">Products are on their way — check back soon.</p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Top rated */}
        {topRated.length > 0 && (
          <section>
            <SectionHeading title="Customer favourites" subtitle="Top-rated by shoppers like you." />
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {topRated.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
