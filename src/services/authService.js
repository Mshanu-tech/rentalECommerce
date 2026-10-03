import api from './api';

export async function registerRequest({ name, email, password, phone }) {
  const { data } = await api.post('/auth/register', { name, email, password, phone });
  return data.data; // { email }
}

export async function verifyOtpRequest({ email, otp }) {
  const { data } = await api.post('/auth/verify-otp', { email, otp });
  return data.data; // { token, user }
}

export async function resendOtpRequest({ email }) {
  const { data } = await api.post('/auth/resend-otp', { email });
  return data.data; // { email }
}

/** Step 1 of login: checks the password and emails a code. Returns { otpRequired, email }. */
export async function loginRequest({ email, password, portal = 'customer' }) {
  const { data } = await api.post('/auth/login', { email, password, portal });
  return data.data;
}

/** Step 2 of login: exchanges the emailed code for a session. Returns { token, user }. */
export async function verifyLoginOtpRequest({ email, otp, portal = 'customer' }) {
  const { data } = await api.post('/auth/login/verify', { email, otp, portal });
  return data.data;
}

export async function resendLoginOtpRequest({ email, portal = 'customer' }) {
  await api.post('/auth/login/resend', { email, portal });
}

/** Pass a token to check a specific session regardless of which area the page is in. */
export async function meRequest(token) {
  const { data } = await api.get('/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  return data.data; // { user }
}

export async function forgotPasswordRequest({ email, portal = 'customer' }) {
  const { data } = await api.post('/auth/forgot-password', { email, portal });
  return data.message;
}

export async function resetPasswordRequest({ email, otp, password, portal = 'customer' }) {
  const { data } = await api.post('/auth/reset-password', { email, otp, password, portal });
  return data.message;
}

export async function logoutRequest() {
  await api.post('/auth/logout');
}
