import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  IndianRupee,
  Package,
  Plus,
  ShoppingCart,
  Star,
  Users,
} from 'lucide-react';
import * as categoryService from '../../services/categoryService';
import * as productService from '../../services/productService';
import * as orderService from '../../services/orderService';
import { formatPrice, timeAgo } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import OrderStatusBadge from '../../components/OrderStatusBadge';

const STATUS_BARS = [
  { key: 'pending', label: 'Pending', color: 'bg-amber-400' },
  { key: 'processing', label: 'Processing', color: 'bg-blue-500' },
  { key: 'shipped', label: 'Shipped', color: 'bg-indigo-500' },
  { key: 'delivered', label: 'Delivered', color: 'bg-green-500' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-gray-400' },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      categoryService.listCategories(),
      productService.listProducts(),
      productService.getLowStockProducts(),
      orderService.getOrderStats(),
      orderService.listOrdersAdmin({ limit: 6 }),
    ])
      .then(([categories, products, lowStock, orderSummary, recent]) => {
        if (cancelled) return;
        setStats({
          categoryCount: categories.length,
          productCount: products.length,
          activeProductCount: products.filter((p) => p.is_active).length,
        });
        setLowStockProducts(lowStock);
        setOrderStats(orderSummary);
        setRecentOrders(recent.orders);
      })
      .catch((err) => !cancelled && setError(err.message));

    return () => {
      cancelled = true;
    };
  }, []);

  const daily = orderStats?.daily || [];
  const maxRevenue = useMemo(() => Math.max(1, ...daily.map((d) => d.revenue)), [daily]);
  const maxStatus = useMemo(
    () => Math.max(1, ...STATUS_BARS.map((s) => orderStats?.byStatus?.[s.key] || 0)),
    [orderStats]
  );
  const weekRevenue = daily.reduce((sum, d) => sum + d.revenue, 0);
  const weekOrders = daily.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-primary-800 p-4 text-white shadow-sm sm:p-6">
        <div className="min-w-0">
          <p className="text-sm text-white/70">{greeting()},</p>
          <h2 className="truncate text-2xl font-bold">{user?.name || 'Admin'} 👋</h2>
          <p className="mt-1 text-sm text-white/70">
            {orderStats
              ? `${orderStats.todayOrders} order${orderStats.todayOrders === 1 ? '' : 's'} today · ${orderStats.byStatus.pending} waiting to be processed`
              : "Here's how your store is doing."}
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Link to="/admin/products/new" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary-600 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-primary-500 sm:px-4">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add product
          </Link>
          <Link to="/admin/orders" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-white/20 sm:px-4">
            <ClipboardList className="h-4 w-4" aria-hidden="true" /> View orders
          </Link>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={IndianRupee} tone="green" label="Revenue (paid)" value={orderStats ? formatPrice(orderStats.revenue) : undefined} hint={orderStats ? `${formatPrice(weekRevenue)} in the last 7 days` : ''} />
        <Kpi icon={ShoppingCart} tone="blue" label="Total orders" value={orderStats?.totalOrders} hint={orderStats ? `${weekOrders} in the last 7 days` : ''} />
        <Kpi icon={Users} tone="purple" label="Customers" value={orderStats?.customers} hint={orderStats ? `${orderStats.reviews} reviews received` : ''} />
        <Kpi icon={Package} tone="orange" label="Products" value={stats?.productCount} hint={stats ? `${stats.activeProductCount} active · ${stats.categoryCount} categories` : ''} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Revenue chart */}
        <Card className="xl:col-span-2" title="Sales — last 7 days" subtitle="Paid revenue per day">
          {orderStats ? (
            <div className="flex h-56 items-end gap-1.5 sm:gap-4">
              {daily.map((d) => {
                const pct = (d.revenue / maxRevenue) * 100;
                const day = new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' });
                return (
                  <div key={d.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-[11px] font-medium text-gray-500 opacity-0 transition group-hover:opacity-100">
                      {formatPrice(d.revenue)}
                    </span>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition group-hover:from-primary-700"
                        style={{ height: `${Math.max(pct, d.revenue > 0 ? 4 : 1)}%` }}
                        title={`${d.orders} order(s)`}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{day}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-56 animate-pulse rounded-xl bg-gray-100" />
          )}
        </Card>

        {/* Order status */}
        <Card title="Orders by status" subtitle="All time">
          <ul className="space-y-3">
            {STATUS_BARS.map(({ key, label, color }) => {
              const count = orderStats?.byStatus?.[key] ?? 0;
              return (
                <li key={key}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-900">{orderStats ? count : '—'}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${(count / maxStatus) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent orders */}
        <Card
          className="xl:col-span-2"
          title="Recent orders"
          action={<Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">View all <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
        >
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">{orderStats ? 'No orders yet.' : 'Loading…'}</p>
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-2 py-2 font-medium">Order</th>
                    <th className="px-2 py-2 font-medium">Customer</th>
                    <th className="px-2 py-2 font-medium">Total</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                    <th className="px-2 py-2 font-medium">Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-2 py-3 font-medium">
                        <Link to={`/admin/orders/${o.id}`} className="text-primary-600 hover:underline">{o.orderNumber}</Link>
                      </td>
                      <td className="px-2 py-3 text-gray-700">{o.customerName || '—'}</td>
                      <td className="px-2 py-3 font-medium text-gray-900">{formatPrice(o.total)}</td>
                      <td className="px-2 py-3"><OrderStatusBadge status={o.status} /></td>
                      <td className="px-2 py-3 text-gray-500">{timeAgo(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Top products */}
        <Card title="Best sellers" subtitle="By units ordered">
          {orderStats?.topProducts?.length ? (
            <ol className="space-y-3">
              {orderStats.topProducts.map((p, i) => (
                <li key={p.productId ?? p.name} className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-800">{p.name}</span>
                  <span className="flex-shrink-0 text-right text-xs font-semibold text-gray-900 sm:text-sm">{p.units} sold</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">{orderStats ? 'No sales yet.' : 'Loading…'}</p>
          )}
        </Card>
      </div>

      {/* Stock alerts */}
      {lowStockProducts.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              {lowStockProducts.length} product{lowStockProducts.length === 1 ? '' : 's'} need{lowStockProducts.length === 1 ? 's' : ''} attention
            </h3>
            <Link to="/admin/stock" className="text-sm font-medium text-amber-800 hover:underline">Manage stock →</Link>
          </div>
          <ul className="mt-3 grid gap-x-8 gap-y-1 text-sm text-amber-900 sm:grid-cols-2">
            {lowStockProducts.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <Link to={`/admin/products/${p.id}/stock`} className="hover:underline">{p.name}</Link>
                <span className="font-medium">{p.stock_quantity === 0 ? 'Out of stock' : `${p.stock_quantity} left`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { to: '/admin/products', label: 'Products', icon: Package },
          { to: '/admin/categories', label: 'Categories', icon: Boxes },
          { to: '/admin/reviews', label: 'Moderate reviews', icon: Star },
          { to: '/admin/stock', label: 'Stock alerts', icon: AlertTriangle },
        ].map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 shadow-sm transition hover:border-primary-300 hover:text-primary-700">
            <Icon className="h-4 w-4 text-primary-600" aria-hidden="true" /> {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

const TONES = {
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-primary-50 text-primary-600',
};

function Kpi({ icon: Icon, tone, label, value, hint }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-5">
      <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-0.5 truncate text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-gray-400">{hint}</p>}
      </div>
    </div>
  );
}

function Card({ title, subtitle, action, className = '', children }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
