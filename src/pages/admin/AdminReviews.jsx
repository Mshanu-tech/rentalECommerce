import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as reviewService from '../../services/reviewService';
import StarRating from '../../components/StarRating';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [hidden, setHidden] = useState('');
  const [rating, setRating] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  function load() {
    setLoading(true);
    reviewService
      .listReviewsAdmin({ hidden, rating, search, page, limit: 20 })
      .then((data) => {
        setReviews(data.reviews);
        setPagination(data.pagination);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [hidden, rating, search, page]);

  function onFilter(setter) {
    return (e) => {
      setPage(1);
      setter(e.target.value);
    };
  }

  async function toggleHidden(review) {
    setBusyId(review.id);
    setError('');
    try {
      await reviewService.setReviewHidden(review.id, !review.isHidden);
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, isHidden: !r.isHidden } : r)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(review) {
    if (!window.confirm('Permanently delete this review? This cannot be undone.')) return;
    setBusyId(review.id);
    setError('');
    try {
      await reviewService.deleteReviewAdmin(review.id);
      load();
    } catch (err) {
      setError(err.message);
      setBusyId(null);
    }
  }

  const selectClass =
    'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Reviews</h1>
      <p className="mt-1 text-sm text-gray-500">
        Hidden reviews disappear from the product page and rating average, but the author still sees them.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
          className="flex min-w-[220px] flex-1 gap-2"
        >
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search product, customer or text…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button type="submit" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Search
          </button>
        </form>
        <select value={hidden} onChange={onFilter(setHidden)} className={selectClass}>
          <option value="">All reviews</option>
          <option value="false">Visible</option>
          <option value="true">Hidden</option>
        </select>
        <select value={rating} onChange={onFilter(setRating)} className={selectClass}>
          <option value="">Any rating</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? '' : 's'}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-gray-100" />
      ) : reviews.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">No reviews match these filters.</p>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${r.isHidden ? 'border-amber-200' : 'border-gray-200'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link to={`/products/${r.productId}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 hover:underline">
                      {r.productName}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating value={r.rating} />
                      {r.isHidden && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Hidden</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => toggleHidden(r)}
                      disabled={busyId === r.id}
                      className="text-primary-600 hover:underline disabled:opacity-50"
                    >
                      {r.isHidden ? 'Unhide' : 'Hide'}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(r)}
                      disabled={busyId === r.id}
                      className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {r.title && <p className="mt-2 text-sm font-medium text-gray-900">{r.title}</p>}
                {r.comment && <p className="mt-1 whitespace-pre-line text-sm text-gray-600">{r.comment}</p>}
                <p className="mt-2 text-xs text-gray-400">
                  {r.userName} ({r.userEmail}) · {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <p>
              {pagination.total} review{pagination.total === 1 ? '' : 's'} — page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
