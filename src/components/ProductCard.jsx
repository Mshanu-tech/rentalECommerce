import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { getImageUrl } from '../services/api';
import { formatPrice, discountPercent, stockLabel } from '../utils/format';
import WishlistButton from './WishlistButton';
import StarRating from './StarRating';

export default function ProductCard({ product }) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const discount = discountPercent(product.price, product.compare_at_price);
  const outOfStock = Number(product.stock_quantity) <= 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {primaryImage ? (
          <img
            src={getImageUrl(primaryImage.url)}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <ImageOff className="h-10 w-10" aria-hidden="true" />
          </div>
        )}

        {discount !== null && (
          <span className="absolute left-2 top-2 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
            {discount}% off
          </span>
        )}

        <WishlistButton productId={product.id} className="absolute right-2 top-2" />

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {product.category_name}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{product.name}</h3>

        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <StarRating value={product.ratingAverage} size="h-3.5 w-3.5" />
            <span>
              {product.ratingAverage.toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-base font-semibold text-gray-900">{formatPrice(product.price)}</span>
          {product.compare_at_price > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>

        {!outOfStock && Number(product.stock_quantity) <= 5 && (
          <p className="text-xs font-medium text-primary-700">{stockLabel(product.stock_quantity)}</p>
        )}
      </div>
    </Link>
  );
}
