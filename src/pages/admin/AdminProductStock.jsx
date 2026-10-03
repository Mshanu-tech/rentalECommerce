import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as productService from '../../services/productService';
import { formatPrice } from '../../utils/format';

const REASONS = [
  { value: 'restock', label: 'Restock' },
  { value: 'correction', label: 'Count correction' },
  { value: 'damaged', label: 'Damaged / written off' },
  { value: 'returned', label: 'Customer return' },
  { value: 'other', label: 'Other' },
];

const emptyForm = { type: 'increment', quantity: '', reason: 'restock', note: '' };

export default function AdminProductStock() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    Promise.all([productService.getProduct(id), productService.getStockHistory(id)])
      .then(([p, h]) => {
        setProduct(p);
        setHistory(h);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const quantity = Number(form.quantity);
    if (!form.quantity || Number.isNaN(quantity) || quantity < 0) {
      setFormError('Enter a quantity of 0 or more.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await productService.adjustStock(id, {
        type: form.type,
        quantity,
        reason: form.reason,
        note: form.note || undefined,
      });
      setProduct(updated);
      setForm(emptyForm);
      const h = await productService.getStockHistory(id);
      setHistory(h);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Could not update stock.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  if (error || !product) {
    return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error || 'Product not found.'}</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/products" className="text-sm font-medium text-gray-500 hover:text-gray-700">
          ← Products
        </Link>
      </div>
      <h1 className="mt-2 text-xl font-semibold text-gray-900">{product.name}</h1>
      <p className="mt-1 text-sm text-gray-500">SKU: {product.sku || '—'}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Current stock</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{product.stock_quantity}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Low-stock threshold</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{product.low_stock_threshold}</p>
        </div>
        <div
          className={`rounded-2xl border p-5 shadow-sm ${
            product.isLowStock ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
          }`}
        >
          <p className="text-sm text-gray-500">Status</p>
          <p className={`mt-1 text-lg font-semibold ${product.isLowStock ? 'text-red-700' : 'text-green-700'}`}>
            {product.stock_quantity === 0 ? 'Out of stock' : product.isLowStock ? 'Low stock' : 'Healthy'}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Adjust stock</h2>
        <p className="mt-1 text-xs text-gray-500">
          Every adjustment here is logged below, unlike editing "Stock quantity" on the product
          form directly.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Action
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="increment">Add stock (+)</option>
              <option value="decrement">Remove stock (−)</option>
              <option value="set">Set exact quantity</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              {form.type === 'set' ? 'New quantity' : 'Quantity'}
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason
            </label>
            <select
              id="reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">
              Note (optional)
            </label>
            <input
              id="note"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="e.g. PO #1234"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {formError && (
            <p className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">{formError}</p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Apply adjustment'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-900">
          Adjustment history
        </h2>
        {history.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No manual adjustments yet.</p>
        ) : (
          <div className="overflow-x-auto">
<table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Change</th>
                <th className="px-4 py-3 font-medium">New stock</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 font-medium">By</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-3 text-gray-500">{new Date(h.createdAt).toLocaleString()}</td>
                  <td className={`px-4 py-3 font-medium ${h.changeQty >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {h.changeQty >= 0 ? `+${h.changeQty}` : h.changeQty}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{h.newQuantity}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{h.reason}</td>
                  <td className="px-4 py-3 text-gray-500">{h.note || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{h.changedByName || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">Price: {formatPrice(product.price)}</p>
    </div>
  );
}
