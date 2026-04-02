export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  plan?: string;
  isVerified?: boolean;
  isGuest?: boolean;
}

const ACCESS_TOKEN_KEY = 'nexusai.accessToken';
const REFRESH_TOKEN_KEY = 'nexusai.refreshToken';
const USER_KEY = 'nexusai.user';
type StorageMode = 'local' | 'session';
const GUEST_EMAIL = 'guest@nexusai.local';

function canUseStorage() {
  return typeof window !== 'undefined';
}

function getStorage(mode: StorageMode) {
  return mode === 'session' ? window.sessionStorage : window.localStorage;
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

export function sanitizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith('/')) {
    return '/landing';
  }

  if (nextPath.startsWith('//')) {
    return '/landing';
  }

  return nextPath;
}

export function buildWorkspacePath(tab?: string, query?: string) {
  const params = new URLSearchParams();

  if (tab) {
    params.set('tab', tab);
  }

  if (query) {
    params.set('query', query);
  }

  const suffix = params.toString();
  return suffix ? `/workspace?${suffix}` : '/workspace';
}

export function saveAuthSession(tokens: AuthTokens, user?: AuthUser, mode: StorageMode = 'local') {
  if (!canUseStorage()) return;

  const storage = getStorage(mode);
  const otherStorage = getStorage(mode === 'local' ? 'session' : 'local');

  otherStorage.removeItem(ACCESS_TOKEN_KEY);
  otherStorage.removeItem(REFRESH_TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);

  storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

  if (user) {
    storage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function createGuestSession() {
  if (!canUseStorage()) return null;

  const guestUser: AuthUser = {
    id: `guest-${Date.now()}`,
    email: GUEST_EMAIL,
    name: 'Guest User',
    isGuest: true,
  };

  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.setItem(USER_KEY, JSON.stringify(guestUser));
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);

  return guestUser;
}

export function readAccessToken() {
  if (!canUseStorage()) return null;
  return (
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ??
    window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
}

export function readStoredUser(): AuthUser | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(USER_KEY) ?? window.sessionStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function hasGuestSession() {
  return Boolean(readStoredUser()?.isGuest);
}

export function hasWorkspaceSession() {
  return Boolean(readAccessToken()) || hasGuestSession();
}

export function updateStoredUser(user: AuthUser) {
  if (!canUseStorage()) return;

  if (window.sessionStorage.getItem(ACCESS_TOKEN_KEY)) {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return;
  }

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = readAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = 'Request failed';

    try {
      const errorBody = (await response.json()) as { message?: string | string[] };
      const rawMessage = errorBody.message;

      if (Array.isArray(rawMessage)) {
        message = rawMessage.join(', ');
      } else if (rawMessage) {
        message = rawMessage;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
