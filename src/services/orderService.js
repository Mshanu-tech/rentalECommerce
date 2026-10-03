import api from './api';

export async function checkout({ addressId, paymentMethod = 'cod' }) {
  const { data } = await api.post('/orders', { addressId, paymentMethod });
  return data.data.order;
}

export async function listOrders() {
  const { data } = await api.get('/orders');
  return data.data.orders;
}

export async function getOrder(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data.data.order;
}

export async function cancelOrder(id, reason) {
  const { data } = await api.post(`/orders/${id}/cancel`, reason ? { reason } : {});
  return data.data.order;
}

// --- Razorpay --------------------------------------------------------------

export async function createRazorpayOrder(addressId) {
  const { data } = await api.post('/orders/razorpay/create', { addressId });
  return data.data.payment; // { keyId, razorpayOrderId, amount, currency }
}

export async function verifyRazorpayPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const { data } = await api.post('/orders/razorpay/verify', {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
  return data.data.order;
}

// --- Admin ---------------------------------------------------------------

/**
 * Phase 8: accepts search/date-range/payment filters and pagination on top of the status
 * filter. Returns { orders, pagination } — see server/services/orderService.js.
 */
export async function listOrdersAdmin({
  status,
  search,
  dateFrom,
  dateTo,
  paymentStatus,
  paymentMethod,
  page,
  limit,
} = {}) {
  const params = {};
  if (status) params.status = status;
  if (search) params.search = search;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  if (paymentStatus) params.paymentStatus = paymentStatus;
  if (paymentMethod) params.paymentMethod = paymentMethod;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const { data } = await api.get('/orders/admin', { params });
  return data.data; // { orders, pagination }
}

export async function getOrderStats() {
  const { data } = await api.get('/orders/admin/stats');
  return data.data; // { totalOrders, todayOrders, revenue, byStatus }
}

export async function getOrderAdmin(id) {
  const { data } = await api.get(`/orders/admin/${id}`);
  return data.data.order;
}

export async function updateOrderStatus(id, { status, note, trackingNumber, carrier }) {
  const { data } = await api.patch(`/orders/admin/${id}/status`, { status, note, trackingNumber, carrier });
  return data.data.order;
}

export async function updatePaymentStatus(id, paymentStatus) {
  const { data } = await api.patch(`/orders/admin/${id}/payment-status`, { paymentStatus });
  return data.data.order;
}
