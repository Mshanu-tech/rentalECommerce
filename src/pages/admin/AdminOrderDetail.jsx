import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ImageOff, MapPin } from 'lucide-react';
import * as orderService from '../../services/orderService';
import { getImageUrl } from '../../services/api';
import { formatPrice } from '../../utils/format';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import OrderTimeline from '../../components/OrderTimeline';
import ConfirmDialog from '../../components/ConfirmDialog';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export default function AdminOrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [note, setNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [confirmKind, setConfirmKind] = useState(null); // 'paid' | 'delivered' | null

  function load() {
    setLoading(true);
    setNotFound(false);
    orderService
      .getOrderAdmin(id)
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
        setPaymentStatus(o.paymentStatus);
        setTrackingNumber(o.trackingNumber || '');
        setCarrier(o.carrier || '');
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  const isTerminal = order && (order.status === 'delivered' || order.status === 'cancelled');

  // Marking a COD order as paid, or an order as delivered, asks for an OK first.
  function handleSubmit(e) {
    e.preventDefault();
    if (status === 'delivered' && order.status !== 'delivered') {
      setConfirmKind('delivered');
      return;
    }
    saveStatus();
  }

  async function saveStatus() {
    setSaving(true);
    setError('');
    try {
      const updated = await orderService.updateOrderStatus(id, {
        status,
        note: note.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        carrier: carrier.trim() || undefined,
      });
      setOrder(updated);
      setNote('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  function handlePaymentSubmit(e) {
    e.preventDefault();
    if (paymentStatus === 'paid' && order.paymentStatus !== 'paid') {
      setConfirmKind('paid');
      return;
    }
    savePayment();
  }

  async function savePayment() {
    setSavingPayment(true);
    setPaymentError('');
    try {
      const updated = await orderService.updatePaymentStatus(id, paymentStatus);
      setOrder(updated);
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message);
    } finally {
      setSavingPayment(false);
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />;
  }

  if (notFound || !order) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Order not found</h1>
        <Link to="/admin/orders" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const { shippingAddress } = order;

  async function handleConfirm() {
    const kind = confirmKind;
    if (kind === 'paid') await savePayment();
    else if (kind === 'delivered') await saveStatus();
    setConfirmKind(null);
  }

  function handleConfirmCancel() {
    // Put the dropdown back to what is actually saved.
    if (confirmKind === 'paid') setPaymentStatus(order.paymentStatus);
    if (confirmKind === 'delivered') setStatus(order.status);
    setConfirmKind(null);
  }

  return (
    <div>
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{order.orderNumber}</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            {order.customerName} · {order.customerEmail}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
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
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(item.lineTotal)}</span>
                </div>
              ))}
            </div>
            <dl className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Subtotal</dt>
                <dd className="text-gray-900">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Shipping</dt>
                <dd className="text-gray-900">{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt className="text-gray-900">Total</dt>
                <dd className="text-gray-900">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Tracking &amp; history</h2>
            <div className="mt-4">
              <OrderTimeline status={order.status} history={order.statusHistory} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
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
                  {order.paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd className="text-gray-900">{order.paymentStatus[0].toUpperCase() + order.paymentStatus.slice(1)}</dd>
              </div>
            </dl>
            {order.paymentMethod === 'cod' && (
              <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                <div>
                  <label htmlFor="paymentStatus" className="block text-xs font-medium text-gray-500">
                    Update COD payment status
                  </label>
                  <select
                    id="paymentStatus"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {PAYMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {paymentError && <p className="text-sm text-red-600">{paymentError}</p>}
                <button
                  type="submit"
                  disabled={savingPayment || paymentStatus === order.paymentStatus}
                  className="w-full rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {savingPayment ? 'Saving…' : 'Save payment status'}
                </button>
              </form>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Update status</h2>
            {isTerminal ? (
              <p className="mt-3 text-sm text-gray-500">
                This order is {order.status} and can no longer be updated.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-3 space-y-3">
                <div>
                  <label htmlFor="status" className="block text-xs font-medium text-gray-500">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="carrier" className="block text-xs font-medium text-gray-500">
                    Carrier (optional)
                  </label>
                  <input
                    id="carrier"
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    maxLength={100}
                    placeholder="e.g. Delhivery"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="trackingNumber" className="block text-xs font-medium text-gray-500">
                    Tracking number (optional)
                  </label>
                  <input
                    id="trackingNumber"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    maxLength={100}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="note" className="block text-xs font-medium text-gray-500">
                    Note (optional, shown to the customer)
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    maxLength={255}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmKind !== null}
        title={confirmKind === 'paid' ? 'Payment received?' : 'Mark as delivered?'}
        message={
          confirmKind === 'paid' ? (
            <>
              Has the customer paid <strong>{formatPrice(order.total)}</strong> for order{' '}
              {order.orderNumber}? Press OK to mark it as paid.
            </>
          ) : (
            <>Has order {order.orderNumber} been delivered to the customer? Press OK to confirm. A delivered order can't be changed afterwards.</>
          )
        }
        busy={saving || savingPayment}
        onConfirm={handleConfirm}
        onCancel={handleConfirmCancel}
      />
    </div>
  );
}
