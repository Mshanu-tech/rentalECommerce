import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ImageOff, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { getImageUrl } from '../services/api';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { cart, loading, updateItemQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [busyProductId, setBusyProductId] = useState(null);

  async function withBusy(productId, fn) {
    setBusyProductId(productId);
    try {
      await fn();
    } finally {
      setBusyProductId(null);
    }
  }

  if (loading && !cart.items.length) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-4 px-4 py-10 sm:px-6">
        <div className="h-24 rounded-2xl bg-gray-100" />
        <div className="h-24 rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-gray-500">Browse the shop and add something you like.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-gray-900">Your cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className={`flex gap-4 rounded-2xl border p-4 ${
                item.unavailable ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-white'
              }`}
            >
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
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/products/${item.productId}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary-700"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => withBusy(item.productId, () => removeItem(item.productId))}
                    disabled={busyProductId === item.productId}
                    aria-label="Remove item"
                    className="text-gray-400 transition hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)}</p>

                {item.unavailable && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    No longer available — remove it to check out.
                  </p>
                )}
                {!item.unavailable && item.exceedsStock && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    Only {item.stockQuantity} left — lower the quantity to check out.
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-gray-300">
                    <button
                      type="button"
                      onClick={() =>
                        withBusy(item.productId, () =>
                          updateItemQuantity(item.productId, Math.max(1, item.quantity - 1))
                        )
                      }
                      disabled={busyProductId === item.productId || item.quantity <= 1}
                      className="rounded-l-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        withBusy(item.productId, () => updateItemQuantity(item.productId, item.quantity + 1))
                      }
                      disabled={busyProductId === item.productId}
                      className="rounded-r-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <span className="text-sm font-semibold text-gray-900">{formatPrice(item.lineTotal)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">Subtotal ({cart.itemCount} items)</span>
            <span className="font-medium text-gray-900">{formatPrice(cart.subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">Shipping is calculated at checkout.</p>

          {cart.hasIssues && (
            <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              Some items need attention before you can check out.
            </p>
          )}

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            disabled={cart.hasIssues}
            className="mt-5 w-full rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
}
