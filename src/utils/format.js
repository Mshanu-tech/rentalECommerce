/** Formats a price the same way across product cards, detail pages, and admin tables. */
export function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toFixed(2)}`;
}

/** Whole-number percentage off, based on price vs. compare_at_price. Null if there's no discount. */
export function discountPercent(price, compareAtPrice) {
  const p = Number(price);
  const c = Number(compareAtPrice);
  if (!c || c <= p) return null;
  return Math.round((1 - p / c) * 100);
}

/** Human copy for a stock level — used on cards (compact) and the detail page (verbose). */
export function stockLabel(stockQuantity, { verbose = false } = {}) {
  const qty = Number(stockQuantity) || 0;
  if (qty <= 0) return 'Out of stock';
  if (qty <= 5) return verbose ? `Only ${qty} left in stock` : `Only ${qty} left`;
  return 'In stock';
}

/** "just now", "5 min ago", "3 h ago", "2 d ago", or a short date for anything older than a week. */
export function timeAgo(value) {
  const then = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(then.getTime())) return '';
  const seconds = Math.max(0, Math.round((Date.now() - then.getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return then.toLocaleDateString();
}
