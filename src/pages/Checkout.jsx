import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, ImageOff, Plus, Truck, Wallet } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import * as addressService from '../services/addressService';
import * as orderService from '../services/orderService';
import AddressForm from '../components/AddressForm';
import { getImageUrl } from '../services/api';
import { formatPrice } from '../utils/format';

// Mirrors orderService.js on the backend — used only to show an estimate
// before the order is placed; the server always computes the real total.
const SHIPPING_FEE = 49;
const FREE_SHIPPING_THRESHOLD = 999;

export default function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addingAddress, setAddingAddress] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  function loadAddresses() {
    setLoadingAddresses(true);
    addressService
      .listAddresses()
      .then((list) => {
        setAddresses(list);
        setSelectedId((current) => current ?? list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null);
      })
      .finally(() => setLoadingAddresses(false));
  }

  useEffect(loadAddresses, []);

  async function handleAddAddress(payload) {
    const address = await addressService.createAddress(payload);
    setAddingAddress(false);
    setAddresses((prev) => [address, ...prev]);
    setSelectedId(address.id);
  }

  async function handleCodOrder() {
    return orderService.checkout({ addressId: selectedId, paymentMethod: 'cod' });
  }

  async function handlePlaceOrder() {
    if (!selectedId) {
      setError('Please choose a shipping address.');
      return;
    }
    setError('');
    setPlacing(true);
    try {
      const order = await handleCodOrder();
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.message || 'Could not place your order. Please try again.');
      // Stock/price may have changed server-side since the cart was last loaded — refresh
      // so the summary (and the Cart page, if the shopper goes back) reflects reality.
      refresh().catch(() => {});
    } finally {
      setPlacing(false);
    }
  }

  // Nothing to check out — send the shopper back rather than showing an empty form.
  if (!cart.items.length) return <Navigate to="/cart" replace />;
  if (cart.hasIssues) return <Navigate to="/cart" replace />;

  const shippingFee = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = Number((cart.subtotal + shippingFee).toFixed(2));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Shipping address */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Shipping address</h2>
              {!addingAddress && (
                <button
                  type="button"
                  onClick={() => setAddingAddress(true)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add new
                </button>
              )}
            </div>

            {addingAddress ? (
              <div className="mt-4">
                <AddressForm onSubmit={handleAddAddress} onCancel={() => setAddingAddress(false)} />
              </div>
            ) : loadingAddresses ? (
              <div className="mt-4 h-16 animate-pulse rounded-xl bg-gray-100" />
            ) : addresses.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">
                You don't have any saved addresses yet — add one above to continue.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition ${
                      selectedId === address.id
                        ? 'border-primary-500 ring-1 ring-primary-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressId"
                      value={address.id}
                      checked={selectedId === address.id}
                      onChange={() => setSelectedId(address.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {address.fullName} <span className="font-normal text-gray-400">· {address.phone}</span>
                      </p>
                      <p className="text-gray-600">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state}{' '}
                        {address.postalCode}, {address.country}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Payment method */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900">Payment method</h2>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary-500 p-4 text-sm ring-1 ring-primary-500">
              <Wallet className="mt-0.5 h-4 w-4 text-gray-500" aria-hidden="true" />
              <div>
                <p className="font-medium text-gray-900">Cash on Delivery</p>
                <p className="text-gray-500">Pay in cash when your order arrives.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="h-fit space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>

          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <ImageOff className="h-4 w-4" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty {item.quantity}</p>
                </div>
                <span className="font-medium text-gray-900">{formatPrice(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1 text-gray-500">
                <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                Shipping
              </span>
              <span className="text-gray-900">{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatPrice(total)}</span>
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placing || !selectedId}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {placing
              ? 'Placing order…'
              : 'Place order'}
          </button>

          <Link to="/cart" className="block text-center text-xs text-gray-400 hover:text-gray-600">
            Back to cart
          </Link>
        </div>
      </div>
    </div>
  );
}
