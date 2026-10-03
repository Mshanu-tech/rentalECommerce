import { Star } from 'lucide-react';

/** Read-only stars. `value` may be fractional (e.g. 4.3) — it's rounded to the nearest whole star. */
export default function StarRating({ value = 0, size = 'h-4 w-4', className = '' }) {
  const filled = Math.round(Number(value) || 0);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${Number(value) || 0} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
