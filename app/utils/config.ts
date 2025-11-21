// Конфигурация API
// В production используем относительные пути (nginx проксирует запросы)
// В development используем полный URL
const getApiUrl = (): string => {
  // Если есть переменная окружения, используем её
  if (typeof window !== 'undefined' && (window as any).__API_URL__) {
    return (window as any).__API_URL__;
  }
  
  // Проверяем, находимся ли мы на production домене
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Если это production домен, используем относительный путь
    if (hostname === '24silvercar.ru' || hostname === 'www.24silvercar.ru') {
      return '/api';
    }
  }
  
  // В development используем localhost
  return 'http://127.0.0.1:8001';
};

export const API_URL = getApiUrl();

