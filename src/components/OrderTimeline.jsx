import { Check, Circle, X } from 'lucide-react';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STEP_LABELS = {
  pending: 'Order placed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Two parts: a 4-step progress bar (pending → processing → shipped → delivered), replaced by
 * a plain "cancelled" banner when the order was cancelled since a linear bar can't represent
 * that branch; and the full, timestamped history feed underneath, oldest-first order reversed
 * so the most recent update reads first.
 */
export default function OrderTimeline({ status, history = [] }) {
  const isCancelled = status === 'cancelled';
  const currentIndex = STEPS.indexOf(status);

  return (
    <div>
      {isCancelled ? (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <X className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          This order was cancelled.
        </div>
      ) : (
        <ol className="flex items-start">
          {STEPS.map((step, idx) => {
            const done = idx <= currentIndex;
            return (
              <li key={step} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                      done ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Circle className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                    )}
                  </div>
                  <span className={`mt-1.5 text-xs ${done ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                    {STEP_LABELS[step]}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`mx-2 mt-3.5 h-0.5 flex-1 ${idx < currentIndex ? 'bg-primary-600' : 'bg-gray-100'}`} />
                )}
              </li>
            );
          })}
        </ol>
      )}

      {history.length > 0 && (
        <ul className="mt-5 space-y-3 border-t border-gray-100 pt-4">
          {[...history].reverse().map((h) => (
            <li key={h.id} className="text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="font-medium text-gray-900">{STEP_LABELS[h.status] || h.status}</span>
                <span className="text-xs text-gray-400">{formatDate(h.createdAt)}</span>
              </div>
              {h.note && <p className="mt-0.5 text-gray-500">{h.note}</p>}
              {h.changedByName && <p className="mt-0.5 text-xs text-gray-400">Updated by {h.changedByName}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
