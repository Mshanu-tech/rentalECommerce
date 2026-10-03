import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ImageOff, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { getImageUrl } from '../services/api';
import { formatPrice, stockLabel } from '../utils/format';

export default function Wishlist() {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();
  const [busyId, setBusyId] = useState(null);
  const [movedId, setMovedId] = useState(null);

  async function handleMoveToCart(item) {
    setBusyId(item.productId);
    try {
      await addItem(item.productId, 1);
      await toggle(item.productId); // remove from wishlist once it's in the cart
      setMovedId(item.productId);
      setTimeout(() => setMovedId(null), 2000);
    } finally {
      setBusyId(null);
    }
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Heart className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-gray-900">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-gray-500">Tap the heart on any product to save it for later.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-gray-900">Your wishlist</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const outOfStock = !item.isActive || item.stockQuantity <= 0;
          return (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4">
              <Link
                to={`/products/${item.productId}`}
                className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100"
              >
                {item.image ? (
                  <img src={getImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <ImageOff className="h-6 w-6" aria-hidden="true" />
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/products/${item.productId}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary-700"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggle(item.productId)}
                    aria-label="Remove from wishlist"
                    className="text-gray-400 transition hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)}</p>
                <p className="text-xs text-gray-400">
                  {item.isActive ? stockLabel(item.stockQuantity) : 'No longer available'}
                </p>

                <button
                  type="button"
                  onClick={() => handleMoveToCart(item)}
                  disabled={outOfStock || busyId === item.productId}
                  className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                  {movedId === item.productId ? 'Added!' : outOfStock ? 'Unavailable' : 'Move to cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
