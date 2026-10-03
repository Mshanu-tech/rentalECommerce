import api from './api';

export async function listCategories() {
  const { data } = await api.get('/categories');
  return data.data.categories;
}

export async function getCategory(id) {
  const { data } = await api.get(`/categories/${id}`);
  return data.data.category;
}

export async function createCategory({ name, description }) {
  const { data } = await api.post('/categories', { name, description });
  return data.data.category;
}

export async function updateCategory(id, { name, description, isActive }) {
  const { data } = await api.put(`/categories/${id}`, { name, description, isActive });
  return data.data.category;
}

export async function deleteCategory(id) {
  await api.delete(`/categories/${id}`);
}
