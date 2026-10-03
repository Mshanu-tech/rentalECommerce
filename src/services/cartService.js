import api from './api';

export async function getCart() {
  const { data } = await api.get('/cart');
  return data.data.cart;
}

export async function addItem(productId, quantity = 1) {
  const { data } = await api.post('/cart/items', { productId, quantity });
  return data.data.cart;
}

export async function updateItemQuantity(productId, quantity) {
  const { data } = await api.put(`/cart/items/${productId}`, { quantity });
  return data.data.cart;
}

export async function removeItem(productId) {
  const { data } = await api.delete(`/cart/items/${productId}`);
  return data.data.cart;
}

export async function clearCart() {
  const { data } = await api.delete('/cart');
  return data.data.cart;
}
