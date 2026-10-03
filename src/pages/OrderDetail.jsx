import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, ImageOff, MapPin, Truck } from 'lucide-react';
import * as orderService from '../services/orderService';
import { getImageUrl } from '../services/api';
import { formatPrice } from '../utils/format';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderTimeline from '../components/OrderTimeline';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = Boolean(location.state?.justPlaced);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    orderService
      .getOrder(id)
      .then(setOrder)
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    setCancelling(true);
    setCancelError('');
    try {
      const updated = await orderService.cancelOrder(id, cancelReason.trim() || undefined);
      setOrder(updated);
      setShowCancelForm(false);
    } catch (err) {
      setCancelError(err.response?.data?.message || err.message);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-4 px-4 py-10 sm:px-6">
        <div className="h-24 rounded-2xl bg-gray-100" />
        <div className="h-40 rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Order not found</h1>
        <Link
          to="/orders"
          className="mt-6 inline-flex items-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
        >
          Back to your orders
        </Link>
      </div>
    );
  }

  const { shippingAddress } = order;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {justPlaced && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          Your order has been placed — thank you!
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{order.orderNumber}</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Order tracking</h2>
        {order.trackingNumber && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
            <Truck className="h-4 w-4 text-gray-400" aria-hidden="true" />
            {order.carrier ? `${order.carrier} — ` : ''}
            {order.trackingNumber}
          </p>
        )}
        <div className="mt-4">
          <OrderTimeline status={order.status} history={order.statusHistory} />
        </div>

        {order.isCancellable && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            {!showCancelForm ? (
              <button
                type="button"
                onClick={() => setShowCancelForm(true)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Cancel this order
              </button>
            ) : (
              <div className="space-y-2">
                <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">
                  Why are you cancelling? (optional)
                </label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={2}
                  maxLength={255}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {cancelError && <p className="text-sm text-red-600">{cancelError}</p>}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling…' : 'Confirm cancellation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelForm(false);
                      setCancelError('');
                    }}
                    disabled={cancelling}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Never mind
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
            Shipping address
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            {shippingAddress.fullName}
            <br />
            {shippingAddress.line1}
            {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ''}
            <br />
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            <br />
            {shippingAddress.country}
            <br />
            {shippingAddress.phone}
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Method</dt>
              <dd className="text-gray-900">
                {order.paymentMethod === 'razorpay' ? 'Paid online (Razorpay)' : 'Cash on Delivery'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Payment status</dt>
              <dd
                className={
                  order.paymentStatus === 'paid'
                    ? 'font-medium text-green-700'
                    : order.paymentStatus === 'refunded'
                      ? 'font-medium text-amber-700'
                      : order.paymentStatus === 'failed'
                        ? 'font-medium text-red-700'
                        : 'text-gray-900'
                }
              >
                {order.paymentStatus[0].toUpperCase() + order.paymentStatus.slice(1)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Subtotal</dt>
              <dd className="text-gray-900">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Shipping</dt>
              <dd className="text-gray-900">
                {order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-1.5 font-semibold">
              <dt className="text-gray-900">Total</dt>
              <dd className="text-gray-900">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Items</h2>
        <div className="mt-4 divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.image ? (
                  <img src={getImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <ImageOff className="h-5 w-5" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="text-gray-900">{item.name}</p>
                <p className="text-gray-400">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </p>
                {order.status === 'delivered' && item.productId && (
                  <Link to={`/products/${item.productId}#reviews`} className="text-xs font-medium text-primary-600 hover:underline">
                    Review this product
                  </Link>
                )}
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatPrice(item.lineTotal)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
