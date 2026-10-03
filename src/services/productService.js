import api from './api';

export async function listProducts({ categoryId, search } = {}) {
  const params = {};
  if (categoryId) params.categoryId = categoryId;
  if (search) params.search = search;
  const { data } = await api.get('/products', { params });
  return data.data.products;
}

export async function getProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data.data.product;
}

// Product writes go through multipart/form-data so images can ride along with
// the text fields. Setting Content-Type to undefined here (rather than
// 'multipart/form-data') lets the browser generate it itself, boundary and
// all — a hardcoded value would be missing the boundary the server needs to
// parse the body.
function toFormData({
  categoryId,
  name,
  description,
  price,
  compareAtPrice,
  sku,
  stockQuantity,
  lowStockThreshold,
  isActive,
  isFeatured,
  images,
}) {
  const formData = new FormData();
  if (categoryId !== undefined) formData.append('categoryId', categoryId);
  if (name !== undefined) formData.append('name', name);
  if (description !== undefined) formData.append('description', description ?? '');
  if (price !== undefined) formData.append('price', price);
  if (compareAtPrice !== undefined && compareAtPrice !== '') {
    formData.append('compareAtPrice', compareAtPrice);
  }
  if (sku !== undefined) formData.append('sku', sku ?? '');
  if (stockQuantity !== undefined) formData.append('stockQuantity', stockQuantity);
  if (lowStockThreshold !== undefined && lowStockThreshold !== '') {
    formData.append('lowStockThreshold', lowStockThreshold);
  }
  if (isActive !== undefined) formData.append('isActive', isActive);
  if (isFeatured !== undefined) formData.append('isFeatured', isFeatured);
  (images || []).forEach((file) => formData.append('images', file));
  return formData;
}

export async function createProduct(payload) {
  const { data } = await api.post('/products', toFormData(payload), {
    headers: { 'Content-Type': undefined },
  });
  return data.data.product;
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, toFormData(payload), {
    headers: { 'Content-Type': undefined },
  });
  return data.data.product;
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
}

export async function deleteProductImage(productId, imageId) {
  await api.delete(`/products/${productId}/images/${imageId}`);
}

export async function setPrimaryImage(productId, imageId) {
  await api.patch(`/products/${productId}/images/${imageId}/primary`);
}

// --- Stock management (Phase 8) -------------------------------------------

export async function getLowStockProducts() {
  const { data } = await api.get('/products/low-stock');
  return data.data.products;
}

export async function getStockHistory(productId) {
  const { data } = await api.get(`/products/${productId}/stock-history`);
  return data.data.adjustments;
}

/** type: 'increment' | 'decrement' | 'set'; reason: 'restock' | 'correction' | 'damaged' | 'returned' | 'other' */
export async function adjustStock(productId, { type, quantity, reason, note }) {
  const { data } = await api.patch(`/products/${productId}/stock`, { type, quantity, reason, note });
  return data.data.product;
}
