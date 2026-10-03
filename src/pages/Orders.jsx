import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import * as orderService from '../services/orderService';
import { formatPrice } from '../utils/format';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .listOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-10 sm:px-6">
        <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Package className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-gray-900">No orders yet</h1>
        <p className="mt-2 text-sm text-gray-500">Your order history will show up here.</p>
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-gray-900">Your orders</h1>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                · {order.items.length} item{order.items.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</span>
              <OrderStatusBadge status={order.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
