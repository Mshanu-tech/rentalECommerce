import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Package,
  Star,
  Tags,
} from 'lucide-react';

/** Every admin section — used by the desktop sidebar and for page titles. */
export const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/stock', label: 'Stock', icon: Boxes },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
];

/** The four tabs pinned to the phone bottom bar (a fifth, "More", holds the rest). */
export const primaryTabPaths = ['/admin', '/admin/orders', '/admin/products', '/admin/messages'];

/** Sections that live under the bottom bar's "More" tab. */
export const moreItems = navItems.filter((i) => !primaryTabPaths.includes(i.to));

const nestedTitles = [
  [/^\/admin\/orders\/[^/]+/, 'Order details'],
  [/^\/admin\/products\/new/, 'New product'],
  [/^\/admin\/products\/[^/]+\/edit/, 'Edit product'],
  [/^\/admin\/products\/[^/]+\/stock/, 'Adjust stock'],
];

export function pageTitle(pathname) {
  const nested = nestedTitles.find(([re]) => re.test(pathname));
  if (nested) return nested[1];
  const match = [...navItems].reverse().find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)));
  return match?.label || 'Admin';
}

/** Detail pages (order, product form, stock adjust) get a back arrow; returns the parent list path. */
export function parentPath(pathname) {
  const segs = pathname.split('/').filter(Boolean); // ['admin', 'orders', '12']
  return segs.length > 2 ? `/${segs.slice(0, 2).join('/')}` : null;
}
