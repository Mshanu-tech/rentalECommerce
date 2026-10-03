import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import * as reviewService from '../services/reviewService';
import { useAuth } from '../hooks/useAuth';
import StarRating from './StarRating';
import { timeAgo } from '../utils/format';

const emptyForm = { rating: 0, title: '', comment: '' };

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          aria-pressed={value === n}
          className="rounded p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Star className={`h-7 w-7 ${n <= shown ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId, onSummaryChange }) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null); // { summary, pagination, me }
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // (Re)loads page 1 — used on mount and after any change to the viewer's own review.
  const reload = useCallback(async () => {
    try {
      const result = await reviewService.getProductReviews(productId, { page: 1, limit: 10 });
      setData(result);
      setReviews(result.reviews);
      setPage(1);
      setError('');
      onSummaryChange?.(result.summary);
    } catch (err) {
      setError(err.message || 'Could not load reviews.');
    } finally {
      setLoading(false);
    }
  }, [productId, onSummaryChange]);

  useEffect(() => {
    setLoading(true);
    setEditing(false);
    setForm(emptyForm);
    reload();
    // Re-run when the viewer signs in/out so `me` (can-review / own review) is accurate.
  }, [reload, isAuthenticated]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const result = await reviewService.getProductReviews(productId, { page: next, limit: 10 });
      setReviews((prev) => [...prev, ...result.reviews]);
      setPage(next);
    } catch (err) {
      setError(err.message || 'Could not load more reviews.');
    } finally {
      setLoadingMore(false);
    }
  }

  function startEdit() {
    const r = data.me.review;
    setForm({ rating: r.rating, title: r.title || '', comment: r.comment || '' });
    setFormError('');
    setEditing(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.rating) {
      setFormError('Please choose a star rating.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const payload = { rating: form.rating, title: form.title.trim(), comment: form.comment.trim() };
      if (editing) await reviewService.updateMyReview(productId, payload);
      else await reviewService.createReview(productId, payload);
      setEditing(false);
      setForm(emptyForm);
      await reload();
    } catch (err) {
      setFormError(err.message || 'Could not save your review.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete your review?')) return;
    try {
      await reviewService.deleteMyReview(productId);
      await reload();
    } catch (err) {
      setError(err.message || 'Could not delete your review.');
    }
  }

  const summary = data?.summary;
  const me = data?.me;
  const showForm = editing || me?.canReview;
  const hasMore = data && page < data.pagination.totalPages;

  return (
    <section id="reviews" className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-semibold text-gray-900">Customer reviews</h2>

      {loading ? (
        <div className="mt-4 h-32 animate-pulse rounded-2xl bg-gray-100" />
      ) : (
        <>
          {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

          {summary && (
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr]">
              <div>
                {summary.count > 0 ? (
                  <>
                    <p className="text-4xl font-semibold text-gray-900">{summary.average.toFixed(1)}</p>
                    <StarRating value={summary.average} size="h-5 w-5" className="mt-1" />
                    <p className="mt-1 text-sm text-gray-500">
                      {summary.count} review{summary.count === 1 ? '' : 's'}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No reviews yet.</p>
                )}
              </div>

              {summary.count > 0 && (
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = summary.distribution[star] || 0;
                    const pct = summary.count ? (count / summary.count) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-8">{star} ★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Write / edit form, own-review card, or the reason you can't review */}
          <div className="mt-6">
            {showForm ? (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">{editing ? 'Edit your review' : 'Write a review'}</h3>
                <div className="mt-3">
                  <StarInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
                </div>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  maxLength={120}
                  placeholder="Headline (optional)"
                  className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  maxLength={2000}
                  rows={4}
                  placeholder="What did you like or dislike? (optional)"
                  className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
                <div className="mt-3 flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
                  >
                    {submitting ? 'Saving…' : editing ? 'Save changes' : 'Submit review'}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : me?.review ? (
              <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Your review</h3>
                  <div className="flex gap-3 text-sm font-medium">
                    <button type="button" onClick={startEdit} className="text-primary-600 hover:underline">
                      Edit
                    </button>
                    <button type="button" onClick={handleDelete} className="text-gray-500 hover:text-red-600">
                      Delete
                    </button>
                  </div>
                </div>
                <StarRating value={me.review.rating} className="mt-2" />
                {me.review.title && <p className="mt-2 text-sm font-medium text-gray-900">{me.review.title}</p>}
                {me.review.comment && <p className="mt-1 whitespace-pre-line text-sm text-gray-600">{me.review.comment}</p>}
                {me.review.isHidden && (
                  <p className="mt-2 text-xs text-amber-700">
                    This review is currently hidden from other shoppers by a moderator.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" state={{ from: `/products/${productId}` }} className="font-medium text-primary-600 hover:underline">
                      Log in
                    </Link>{' '}
                    to write a review.
                  </>
                ) : (
                  'Reviews from admin accounts are not allowed.'
                )}
              </p>
            )}
          </div>

          {reviews.length > 0 && (
            <ul className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
              {reviews.map((r) => (
                <li key={r.id} className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <StarRating value={r.rating} />
                    <span className="text-xs text-gray-400">{timeAgo(r.createdAt)}</span>
                  </div>
                  {r.title && <p className="mt-2 text-sm font-medium text-gray-900">{r.title}</p>}
                  {r.comment && <p className="mt-1 whitespace-pre-line text-sm text-gray-600">{r.comment}</p>}
                  <p className="mt-2 text-xs text-gray-400">
                    {r.userName}
                    {r.isMine && ' (you)'}
                    {r.verifiedPurchase && <span className="ml-1 font-medium text-green-600">· Verified purchase</span>}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="mt-4 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              {loadingMore ? 'Loading…' : 'Show more reviews'}
            </button>
          )}
        </>
      )}
    </section>
  );
}
