import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronRight, ImageOff, Minus, Plus, RotateCcw, ShieldCheck, ShoppingCart, Truck, Zap } from 'lucide-react';
import * as productService from '../services/productService';
import { getImageUrl } from '../services/api';
import { formatPrice, discountPercent, stockLabel } from '../utils/format';
import ProductCard from '../components/ProductCard';
import WishlistButton from '../components/WishlistButton';
import StarRating from '../components/StarRating';
import ReviewSection from '../components/ReviewSection';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState('');
  // Kept in sync by <ReviewSection> so the rating line up top updates right after a review is
  // added, edited or removed (setState is stable, so it's safe as the section's callback).
  const [ratingSummary, setRatingSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setActiveImage(0);
    setQuantity(1);
    setRatingSummary(null);

    productService
      .getProduct(id)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        return productService
          .listProducts()
          .then((list) => {
            if (cancelled) return;
            const others = list.filter((item) => item.id !== p.id);
            const sameCategory = others.filter((item) => item.category_id === p.category_id);
            const rest = others.filter((item) => item.category_id !== p.category_id);
            setRelated([...sameCategory, ...rest].slice(0, 4));
          })
          .catch(() => {});
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // In-page anchors (e.g. "Review this product" from an order) can't scroll until the async
  // product + reviews markup exists, so do it once loading has finished.
  useEffect(() => {
    if (!loading && product && location.hash === '#reviews') {
      const t = setTimeout(() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }), 150);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [loading, product, location.hash]);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    setCartError('');
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setCartError(err.message || 'Could not add this to your cart.');
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    setCartError('');
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      navigate('/checkout');
    } catch (err) {
      setCartError(err.message || 'Could not add this to your cart.');
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-gray-100" />
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="h-7 w-2/3 rounded bg-gray-100" />
            <div className="h-6 w-32 rounded bg-gray-100" />
            <div className="h-24 w-full rounded bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Product not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          It may have been removed or is no longer available.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const discount = discountPercent(product.price, product.compare_at_price);
  const stockQty = Number(product.stock_quantity) || 0;
  const outOfStock = stockQty <= 0;

  const rating = ratingSummary ? ratingSummary.average : product.ratingAverage;
  const ratingCount = ratingSummary ? ratingSummary.count : product.reviewCount;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
        <Link to="/" className="hover:text-gray-700">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
        <Link to="/products" className="hover:text-gray-700">
          Products
        </Link>
        <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
        <Link to={`/products?categoryId=${product.category_id}`} className="hover:text-gray-700">
          {product.category_name}
        </Link>
        <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
        <span className="truncate text-gray-700">{product.name}</span>
      </nav>

      {/* 1. Product details */}
      <div className="mt-4 grid grid-cols-1 gap-6 sm:mt-6 sm:gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:rounded-3xl">
            {images.length ? (
              <img
                src={getImageUrl(images[activeImage]?.url)}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
                <ImageOff className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden="true" />
              </div>
            )}
            {discount !== null && (
              <span className="absolute left-3 top-3 rounded-full bg-primary-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow sm:left-4 sm:top-4 sm:px-3 sm:text-sm">
                {discount}% off
              </span>
            )}

            {/* Thumbnails sit inside the image box, so extra images never change the column height. */}
            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto bg-gradient-to-t from-black/40 to-transparent p-2 pt-6 sm:p-3 sm:pt-8">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-white ring-2 transition sm:h-16 sm:w-16 ${
                      i === activeImage ? 'ring-primary-500' : 'ring-white/70 hover:ring-white'
                    }`}
                  >
                    <img src={getImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-8">
          <Link
            to={`/products?categoryId=${product.category_id}`}
            className="text-[10px] font-semibold uppercase tracking-wide text-primary-600 hover:underline sm:text-xs"
          >
            {product.category_name}
          </Link>
          <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:gap-x-4 sm:text-sm">
            {ratingCount > 0 ? (
              <a href="#reviews" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <StarRating value={rating} />
                <span>
                  {rating.toFixed(1)} ({ratingCount} review{ratingCount === 1 ? '' : 's'})
                </span>
              </a>
            ) : (
              <a href="#reviews" className="text-gray-500 hover:text-gray-700">
                No reviews yet — be the first
              </a>
            )}
            {product.sku && <span className="text-[10px] text-gray-400 sm:text-xs">SKU: {product.sku}</span>}
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-2 border-y border-gray-100 py-4 sm:mt-5 sm:gap-3 sm:py-5">
            <span className="text-3xl font-bold text-gray-900 sm:text-4xl">{formatPrice(product.price)}</span>
            {product.compare_at_price > product.price && (
              <>
                <span className="text-base text-gray-400 line-through sm:text-lg">{formatPrice(product.compare_at_price)}</span>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 sm:px-2.5 sm:text-xs">
                  You save {formatPrice(product.compare_at_price - product.price)}
                </span>
              </>
            )}
          </div>

          <p
            className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              outOfStock
                ? 'bg-gray-100 text-gray-600'
                : stockQty <= 5
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-green-50 text-green-700'
            }`}
          >
            {stockLabel(stockQty, { verbose: true })}
          </p>

          {product.description && (
            <div className="mt-5">
              <h2 className="text-sm font-semibold text-gray-900">About this product</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">{product.description}</p>
            </div>
          )}

          <div className="mt-5 flex items-center gap-2.5 sm:mt-6 sm:gap-3">
            <div className="flex items-center rounded-full border border-gray-300">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
                className="rounded-l-full p-2.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 sm:p-3"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="w-9 text-center text-sm font-semibold text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(stockQty || 1, q + 1))}
                disabled={outOfStock}
                className="rounded-r-full p-2.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 sm:p-3"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <WishlistButton productId={product.id} size="lg" className="flex-shrink-0" />
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-600 px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-3.5"
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" /> Added to cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  {outOfStock ? 'Out of stock' : adding ? 'Adding…' : 'Add to cart'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock || adding}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-3.5"
            >
              <Zap className="h-4 w-4" aria-hidden="true" /> Buy now
            </button>
          </div>
          {cartError && <p className="mt-2 text-sm text-red-600">{cartError}</p>}

          <ul className="mt-5 grid gap-2.5 border-t border-gray-100 pt-4 text-xs text-gray-600 sm:mt-6 sm:grid-cols-3 sm:gap-3 sm:pt-5 sm:text-sm">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 flex-shrink-0 text-primary-600" aria-hidden="true" /> Fast, tracked delivery
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-primary-600" aria-hidden="true" /> Secure payment
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 flex-shrink-0 text-primary-600" aria-hidden="true" /> Easy cancellation
            </li>
          </ul>
        </div>
      </div>

      {/* 2. Other products */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold text-gray-900">You might also like</h2>
            <Link to="/products" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Customer reviews */}
      <ReviewSection productId={product.id} onSummaryChange={setRatingSummary} />
    </div>
  );
}
