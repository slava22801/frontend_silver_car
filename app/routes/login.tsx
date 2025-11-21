import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router';
import { isAuthenticated } from '~/utils/auth';
import { API_URL } from '~/utils/config';

interface LoginForm {
  email: string;
  password: string;
}

// Функция для установки cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginForm>();
  
  // Счетчик неудачных попыток входа
  const [failedAttempts, setFailedAttempts] = useState<number>(0);

  // Если пользователь уже авторизован, перенаправляем его
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/admin');
    }
  }, [navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      console.log('Login data:', data);
      
      // Создаем FormData для отправки
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      
      // Логируем содержимое FormData для отладки
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      // Здесь ваш API call для логина
      const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        body: formData, // Не устанавливаем Content-Type, браузер сделает это автоматически с boundary
      });

      console.log('Response status:', response.status);
      
      let responseData: any = null;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          if (text) {
            try {
              responseData = JSON.parse(text);
            } catch {
              responseData = { message: text };
            }
          }
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }

      console.log('Response data:', responseData);

      if (!response.ok) {
        let errorMessage = 'Ошибка при входе';
        
        // Пытаемся извлечь сообщение об ошибке из различных форматов
        if (responseData) {
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (typeof responseData === 'object') {
            // Проверяем различные возможные поля с сообщением об ошибке
            errorMessage = 
              responseData.message || 
              responseData.error || 
              responseData.detail ||
              responseData.msg ||
              (Array.isArray(responseData.errors) ? responseData.errors.join(', ') : null) ||
              JSON.stringify(responseData);
          }
        }
        
        // Если не нашли сообщение, используем статус
        if (errorMessage === 'Ошибка при входе') {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Ошибка сервера'}`;
        }
        
        throw new Error(errorMessage);
      }

      const successMessage = responseData?.message || 'Вход выполнен успешно!';
      console.log('Success:', successMessage, responseData);
      
      // Сохраняем токен в cookies
      if (responseData?.access_token) {
        setCookie('access_token', responseData.access_token, 7); // Сохраняем на 7 дней
        setCookie('token_type', responseData.token_type || 'Bearer', 7);
        console.log('Token saved to cookies');
      } else if (responseData?.token) {
        // Fallback для случая, если сервер вернет token вместо access_token
        setCookie('access_token', responseData.token, 7);
        setCookie('token_type', responseData.token_type || 'Bearer', 7);
        console.log('Token saved to cookies');
      }
      
      // Перенаправляем пользователя после успешного входа
      // Сбрасываем счетчик неудачных попыток при успешном входе
      setFailedAttempts(0);
      reset();
      navigate('/admin');
    } catch (error) {
      console.error('Error details:', error);
      let message = 'Ошибка при входе';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        message = 'Не удалось подключиться к серверу. Проверьте подключение к интернету.';
      } else if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object') {
        // Если ошибка - объект, пытаемся извлечь сообщение
        const errorObj = error as any;
        message = errorObj.message || errorObj.error || errorObj.detail || JSON.stringify(error);
      }
      
      // Увеличиваем счетчик неудачных попыток
      setFailedAttempts(prev => prev + 1);
      alert(message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#302E2F',
      padding: '16px'
    }} className="p-4 sm:p-6 md:p-8">
      <div style={{
        backgroundColor: '#3a3839',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        padding: '24px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #4a4849'
      }} className="p-6 sm:p-8 md:p-10">
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          textAlign: 'center',
          color: '#ffffff'
        }} className="text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 md:mb-8">
          Вход
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Поле Email */}
          <div style={{ marginBottom: '16px' }} className="mb-4 sm:mb-5">
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#e0e0e0',
              fontSize: '13px'
            }} className="text-xs sm:text-sm md:text-base">
              Email
            </label>
            <input
              type="email"
              {...register('email', {
                required: 'Email обязателен',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Некорректный email адрес'
                }
              })}
              style={{
                width: '100%',
                padding: '10px',
                border: errors.email ? '2px solid #dc3545' : '1px solid #555',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#2a2829',
                color: '#ffffff',
                outline: 'none'
              }}
              className="py-2 sm:py-3 text-sm sm:text-base"
              placeholder="Введите email"
              autoComplete="email"
            />
            {errors.email && (
              <span style={{ color: '#dc3545', fontSize: '11px', marginTop: '5px', display: 'block' }} className="text-xs">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Поле Password */}
          <div style={{ marginBottom: '20px' }} className="mb-5 sm:mb-6">
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#e0e0e0',
              fontSize: '13px'
            }} className="text-xs sm:text-sm md:text-base">
              Password
            </label>
            <input
              type="password"
              {...register('password', {
                required: 'Password обязателен',
                minLength: {
                  value: 6,
                  message: 'Password должен содержать минимум 6 символов'
                }
              })}
              style={{
                width: '100%',
                padding: '10px',
                border: errors.password ? '2px solid #dc3545' : '1px solid #555',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#2a2829',
                color: '#ffffff',
                outline: 'none'
              }}
              className="py-2 sm:py-3 text-sm sm:text-base"
              placeholder="Введите password"
              autoComplete="current-password"
            />
            {errors.password && (
              <span style={{ color: '#dc3545', fontSize: '11px', marginTop: '5px', display: 'block' }} className="text-xs">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Кнопка отправки */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: isSubmitting ? '#555' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
              marginBottom: '12px'
            }}
            className="py-2 sm:py-3 text-sm sm:text-base mb-3 sm:mb-4"
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#007bff';
              }
            }}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>

          {/* Ссылка на страницу регистрации */}
          <div style={{ textAlign: 'center', marginBottom: failedAttempts >= 3 ? '12px' : '0' }}>
            <Link 
              to="/register" 
              style={{
                color: '#007bff',
                textDecoration: 'none',
                fontSize: '13px'
              }}
              className="text-xs sm:text-sm md:text-base"
            >
              Нет аккаунта? Зарегистрироваться
            </Link>
          </div>
          
          {/* Ссылка "Забыли пароль?" после 3 неудачных попыток */}
          {failedAttempts >= 3 && (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <Link 
                to="/resetPass" 
                style={{
                  color: '#ff6b6b',
                  textDecoration: 'none',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                className="text-xs sm:text-sm md:text-base hover:underline"
              >
                Забыли пароль?
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}