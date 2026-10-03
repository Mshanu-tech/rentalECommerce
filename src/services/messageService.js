import api from './api';

// --- Customer ---
/** { messages } — opening the thread marks the shop's replies as read. */
export async function getMyThread() {
  const { data } = await api.get('/messages/me');
  return data.data;
}

export async function sendMyMessage(body) {
  const { data } = await api.post('/messages/me', { body });
  return data.data.message;
}

// --- Admin ---
export async function listConversations(search = '') {
  const { data } = await api.get('/messages/admin/conversations', { params: search ? { search } : {} });
  return data.data.conversations;
}

export async function searchCustomers(search = '') {
  const { data } = await api.get('/messages/admin/customers', { params: search ? { search } : {} });
  return data.data.customers;
}

export async function getAdminUnreadCount() {
  const { data } = await api.get('/messages/admin/unread-count');
  return data.data.unreadCount;
}

/** { customer, messages } */
export async function getThread(customerId) {
  const { data } = await api.get(`/messages/admin/conversations/${customerId}`);
  return data.data;
}

export async function sendToCustomer(customerId, body) {
  const { data } = await api.post(`/messages/admin/conversations/${customerId}`, { body });
  return data.data.message;
}
