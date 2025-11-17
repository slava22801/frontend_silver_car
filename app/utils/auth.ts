// Утилиты для работы с аутентификацией

// Функция для получения cookie
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Функция для проверки наличия токена
export const isAuthenticated = (): boolean => {
  const token = getCookie('access_token');
  return !!token;
};

// Функция для получения токена
export const getAuthToken = (): string | null => {
  return getCookie('access_token');
};

// Функция для получения типа токена
export const getTokenType = (): string => {
  return getCookie('token_type') || 'Bearer';
};

// Функция для удаления токена (выход)
export const clearAuth = (): void => {
  if (typeof document === 'undefined') return;
  document.cookie = 'access_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  document.cookie = 'token_type=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
};

