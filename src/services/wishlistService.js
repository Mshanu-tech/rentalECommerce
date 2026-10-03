import api from './api';

export async function getWishlist() {
  const { data } = await api.get('/wishlist');
  return data.data.items;
}

export async function addItem(productId) {
  const { data } = await api.post('/wishlist/items', { productId });
  return data.data.items;
}

export async function removeItem(productId) {
  const { data } = await api.delete(`/wishlist/items/${productId}`);
  return data.data.items;
}
