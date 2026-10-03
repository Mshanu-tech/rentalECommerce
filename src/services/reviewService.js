import api from './api';

/** Returns { summary, reviews, pagination, me } — `me` is null when signed out. */
export async function getProductReviews(productId, { page, limit } = {}) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  const { data } = await api.get(`/products/${productId}/reviews`, { params });
  return data.data;
}

export async function createReview(productId, { rating, title, comment }) {
  const { data } = await api.post(`/products/${productId}/reviews`, { rating, title, comment });
  return data.data.review;
}

export async function updateMyReview(productId, { rating, title, comment }) {
  const { data } = await api.put(`/products/${productId}/reviews/mine`, { rating, title, comment });
  return data.data.review;
}

export async function deleteMyReview(productId) {
  await api.delete(`/products/${productId}/reviews/mine`);
}

// --- Admin -----------------------------------------------------------------

export async function listReviewsAdmin({ hidden, rating, search, page, limit } = {}) {
  const params = {};
  if (hidden !== undefined && hidden !== '') params.hidden = hidden;
  if (rating) params.rating = rating;
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  const { data } = await api.get('/reviews/admin', { params });
  return data.data; // { reviews, pagination }
}

export async function setReviewHidden(id, isHidden) {
  await api.patch(`/reviews/admin/${id}/visibility`, { isHidden });
}

export async function deleteReviewAdmin(id) {
  await api.delete(`/reviews/admin/${id}`);
}
