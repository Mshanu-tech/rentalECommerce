import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as orderService from '../../services/orderService';
import { formatPrice } from '../../utils/format';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
const PAYMENT_METHODS = ['cod', 'razorpay'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingDelivered, setPendingDelivered] = useState(null); // order awaiting OK to mark delivered

  // Applied filters (what was actually last searched for) vs. the search box's live text —
  // kept separate so typing doesn't refetch on every keystroke; only submitting the form does.
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  function load() {
    setLoading(true);
    orderService
      .listOrdersAdmin({
        status: statusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        paymentMethod: paymentMethodFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: search || undefined,
        page,
        limit: 20,
      })
      .then(({ orders: rows, pagination: p }) => {
        setOrders(rows);
        setPagination(p);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [statusFilter, paymentStatusFilter, paymentMethodFilter, dateFrom, dateTo, search, page]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleFilterChange(setter) {
    return (e) => {
      setPage(1);
      setter(e.target.value);
    };
  }

  function clearFilters() {
    setStatusFilter('');
    setPaymentStatusFilter('');
    setPaymentMethodFilter('');
    setDateFrom('');
    setDateTo('');
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  const hasActiveFilters =
    statusFilter || paymentStatusFilter || paymentMethodFilter || dateFrom || dateTo || search;

  function handleStatusChange(order, status) {
    if (status === 'delivered' && order.status !== 'delivered') {
      setPendingDelivered(order);
      return;
    }
    applyStatusChange(order, status);
  }

  async function applyStatusChange(order, status) {
    setUpdatingId(order.id);
    setError('');
    try {
      const updated = await orderService.updateOrderStatus(order.id, { status });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
      </div>

      <div className="mt-4 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:space-y-3">
        <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
          <form onSubmit={handleSearchSubmit} className="flex min-w-0 w-full gap-2 sm:min-w-[220px] sm:flex-1">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search order #, customer name or email…"
              className="min-w-0 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="flex-shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Search
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:w-auto"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={paymentStatusFilter}
            onChange={handleFilterChange(setPaymentStatusFilter)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:w-auto"
          >
            <option value="">All payment statuses</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={paymentMethodFilter}
            onChange={handleFilterChange(setPaymentMethodFilter)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:w-auto"
          >
            <option value="">All payment methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
          <label className="flex min-w-0 items-center gap-2 text-sm text-gray-600 sm:w-auto">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={handleFilterChange(setDateFrom)}
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:flex-none"
            />
          </label>
          <label className="flex min-w-0 items-center gap-2 text-sm text-gray-600 sm:w-auto">
            To
            <input
              type="date"
              value={dateTo}
              onChange={handleFilterChange(setDateTo)}
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:flex-none"
            />
          </label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-gray-100" />
      ) : orders.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">No orders match these filters.</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  // Delivered/cancelled orders are terminal server-side — disable the quick
                  // select for them so the dropdown itself doesn't promise a change that will
                  // just come back as an error. Full history/tracking edits still happen on
                  // the order's own detail page.
                  const isTerminal = order.status === 'delivered' || order.status === 'cancelled';
                  return (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Link to={`/admin/orders/${order.id}`} className="hover:text-primary-600 hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.customerName}
                        <br />
                        <span className="text-xs text-gray-400">{order.customerEmail}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <span className="capitalize">{order.paymentMethod}</span>
                        <br />
                        <span className="text-xs capitalize text-gray-400">{order.paymentStatus}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <OrderStatusBadge status={order.status} />
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            disabled={updatingId === order.id || isTerminal}
                            className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s[0].toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <p>
              {pagination.total} order{pagination.total === 1 ? '' : 's'} — page {pagination.page} of{' '}
              {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelivered)}
        title="Mark as delivered?"
        message={
          pendingDelivered && (
            <>Has order {pendingDelivered.orderNumber} been delivered to the customer? Press OK to confirm. A delivered order can't be changed afterwards.</>
          )
        }
        busy={Boolean(pendingDelivered) && updatingId === pendingDelivered.id}
        onConfirm={async () => {
          const order = pendingDelivered;
          await applyStatusChange(order, 'delivered');
          setPendingDelivered(null);
        }}
        onCancel={() => setPendingDelivered(null)}
      />
    </div>
  );
}
