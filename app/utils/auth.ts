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

// Функция для декодирования JWT токена
export const decodeJWT = (token: string): any | null => {
  try {
    // JWT состоит из трех частей: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Декодируем payload (вторая часть)
    const payload = parts[1];
    
    // Base64URL декодирование (заменяем _ на /, - на +, добавляем padding если нужно)
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
    
    // Декодируем из base64
    const decoded = atob(base64);
    
    // Парсим JSON
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Функция для получения роли пользователя из токена
export const getUserRole = (): string | null => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }
  
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }
  
  // Проверяем различные возможные поля для роли
  return decoded.role || decoded.user_role || decoded.userRole || null;
};

// Функция для проверки, является ли пользователь администратором
export const isAdmin = (): boolean => {
  const role = getUserRole();
  return role === 'admin' || role === 'Admin' || role === 'ADMIN';
};

// Функция для проверки, является ли пользователь менеджером
export const isManager = (): boolean => {
  const role = getUserRole();
  return role === 'manager' || role === 'Manager' || role === 'MANAGER';
};

// Функция для получения данных пользователя из токена
export const getUserData = (): { username?: string; email?: string; [key: string]: any } | null => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }
  
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }
  
  return decoded;
};

// Функция для получения имени пользователя из токена
export const getUsername = (): string | null => {
  const userData = getUserData();
  if (!userData) {
    return null;
  }
  
  return userData.username || userData.user_name || userData.name || null;
};

// Функция для получения email пользователя из токена
export const getUserEmail = (): string | null => {
  const userData = getUserData();
  if (!userData) {
    return null;
  }
  
  return userData.email || null;
};

// Функция для получения ID пользователя из токена
export const getUserId = (): number | null => {
  const userData = getUserData();
  if (!userData) {
    return null;
  }
  
  // Проверяем различные возможные поля для ID
  const userId = userData.id || userData.user_id || userData.userId || userData.sub || null;
  return userId ? Number(userId) : null;
};

// Функция для получения ID пользователя из токена как строки
export const getUserIdAsString = (): string | null => {
  const userData = getUserData();
  if (!userData) {
    return null;
  }
  
  // Возвращаем id как строку
  const id = userData.id;
  return id ? String(id) : null;
};

