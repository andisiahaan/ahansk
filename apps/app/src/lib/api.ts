import axios from 'axios';

// ─── Centralized API client ────────────────────────────────────────────────────
// All auth is cookie-based (httpOnly). No manual token management needed.
// withCredentials ensures cookies are sent on every request automatically.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:10311',
  withCredentials: true,
});

// ─── CSRF Interceptor ─────────────────────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method ?? '')) {
    let match = typeof document !== 'undefined'
      ? document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'))
      : null;
    if (!match && typeof document !== 'undefined') {
      try {
        const baseURL = config.baseURL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:10311';
        await axios.get(`${baseURL.replace(/\/$/, '')}/`, { withCredentials: true });
        match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
      } catch {
        // ignore
      }
    }
    if (match) {
      config.headers['X-CSRF-Token'] = match[2];
    }
  }
  return config;
});

// ─── Response: auto-refresh on 401 ────────────────────────────────────────────
let isRefreshing = false;
let waitQueue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as typeof err.config & { _retry?: boolean };
    const skipRefreshUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
    const isAuthEndpoint = skipRefreshUrls.some((u) => original?.url?.includes(u));
    if (err.response?.status !== 401 || original?._retry || isAuthEndpoint) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        waitQueue.push(() => {
          if (original) original._retry = true;
          resolve(api(original));
        });
      });
    }

    if (original) original._retry = true;
    isRefreshing = true;

    try {
      await api.post('/auth/refresh');
      const callers = [...waitQueue];
      waitQueue = [];
      callers.forEach((cb) => cb());
      return api(original);
    } catch {
      waitQueue = [];
      if (typeof window !== 'undefined') {
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
        }
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;

// ─── Server Component Fetch Utility ─────────────────────────────────────────────
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  let cookieString = '';
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieString = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:10311'}${endpoint}`;

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(cookieString ? { cookie: cookieString } : {}),
    },
  });
}

