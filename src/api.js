const base = (import.meta.env.VITE_COURSE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const init = { method, signal, credentials: 'include', headers: { Accept: 'application/json', ...headers } };
  if (method !== 'GET') init.headers['X-Requested-With'] = 'XMLHttpRequest';
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  let response;
  try {
    response = await fetch(base + path, init);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(0, '連線暫時中斷，請再試一次。');
  }
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    throw new ApiError(response.status, payload?.error?.message || '暫時無法取得資料，請再試一次。', payload?.error?.code);
  }
  return payload;
}

export function money(amount) {
  return 'NT$' + new Intl.NumberFormat('zh-TW').format(amount);
}
