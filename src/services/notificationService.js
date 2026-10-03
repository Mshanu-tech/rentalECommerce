import api from './api';

/** Returns { notifications, unreadCount, pagination } — see server/services/notificationService.js. */
export async function listNotifications({ unread = false, page, limit } = {}) {
  const params = {};
  if (unread) params.unread = 1;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  const { data } = await api.get('/notifications', { params });
  return data.data;
}

export async function getUnreadCount() {
  const { data } = await api.get('/notifications/unread-count');
  return data.data.unreadCount;
}

export async function markRead(id) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllRead() {
  await api.patch('/notifications/read-all');
}
