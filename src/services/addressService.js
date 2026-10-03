import api from './api';

export async function listAddresses() {
  const { data } = await api.get('/addresses');
  return data.data.addresses;
}

export async function createAddress(payload) {
  const { data } = await api.post('/addresses', payload);
  return data.data.address;
}

export async function updateAddress(id, payload) {
  const { data } = await api.put(`/addresses/${id}`, payload);
  return data.data.address;
}

export async function deleteAddress(id) {
  await api.delete(`/addresses/${id}`);
}

export async function setDefaultAddress(id) {
  const { data } = await api.patch(`/addresses/${id}/default`);
  return data.data.address;
}
