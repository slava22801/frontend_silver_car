import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router';
import { isAuthenticated } from '~/utils/auth';

interface EmailForm {
  email: string;
}

interface ResetPasswordForm {
  token: string;
  new_password: string;
}

export default function ResetPass() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  
  const emailForm = useForm<EmailForm>();
  const resetForm = useForm<ResetPasswordForm>();

  // Если пользователь уже авторизован, перенаправляем его
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/admin');
    }
  }, [navigate]);

  // Обработка первого этапа - отправка email
  const onEmailSubmit = async (data: EmailForm) => {
    try {
      const response = await fetch('http://127.0.0.1:8001/user/forgot_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

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

      if (!response.ok) {
        let errorMessage = 'Ошибка при отправке запроса';
        
        if (responseData) {
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (typeof responseData === 'object') {
            errorMessage = 
              responseData.message || 
              responseData.error || 
              responseData.detail ||
              responseData.msg ||
              (Array.isArray(responseData.errors) ? responseData.errors.join(', ') : null) ||
              JSON.stringify(responseData);
          }
        }
        
        if (errorMessage === 'Ошибка при отправке запроса') {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Ошибка сервера'}`;
        }
        
        throw new Error(errorMessage);
      }

      // При успешном ответе переходим ко второму этапу
      setStep('reset');
      emailForm.reset();
    } catch (error) {
      let message = 'Ошибка при отправке запроса';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        message = 'Не удалось подключиться к серверу. Проверьте, что сервер запущен на http://127.0.0.1:8001';
      } else if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object') {
        const errorObj = error as any;
        message = errorObj.message || errorObj.error || errorObj.detail || JSON.stringify(error);
      }
      
      alert(message);
    }
  };

  // Обработка второго этапа - сброс пароля с токеном
  const onResetSubmit = async (data: ResetPasswordForm) => {
    try {
      const response = await fetch('http://127.0.0.1:8001/user/reset_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: data.token,
          new_password: data.new_password,
        }),
      });

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

      if (!response.ok) {
        let errorMessage = 'Ошибка при сбросе пароля';
        
        if (responseData) {
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (typeof responseData === 'object') {
            errorMessage = 
              responseData.message || 
              responseData.error || 
              responseData.detail ||
              responseData.msg ||
              (Array.isArray(responseData.errors) ? responseData.errors.join(', ') : null) ||
              JSON.stringify(responseData);
          }
        }
        
        if (errorMessage === 'Ошибка при сбросе пароля') {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Ошибка сервера'}`;
        }
        
        throw new Error(errorMessage);
      }

      // При успешном ответе перенаправляем на страницу входа
      alert('Успешная смена пароля');
      resetForm.reset();
      navigate('/login');
    } catch (error) {
      let message = 'Ошибка при сбросе пароля';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        message = 'Не удалось подключиться к серверу. Проверьте, что сервер запущен на http://127.0.0.1:8001';
      } else if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object') {
        const errorObj = error as any;
        message = errorObj.message || errorObj.error || errorObj.detail || JSON.stringify(error);
      }
      
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
          {step === 'email' ? 'Сброс пароля' : 'Введите токен и новый пароль'}
        </h2>

        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            {/* Поле Email */}
            <div style={{ marginBottom: '20px' }} className="mb-5 sm:mb-6">
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
                {...emailForm.register('email', {
                  required: 'Email обязателен',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Некорректный email адрес'
                  }
                })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: emailForm.formState.errors.email ? '2px solid #dc3545' : '1px solid #555',
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
              {emailForm.formState.errors.email && (
                <span style={{ color: '#dc3545', fontSize: '11px', marginTop: '5px', display: 'block' }} className="text-xs">
                  {emailForm.formState.errors.email.message}
                </span>
              )}
            </div>

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={emailForm.formState.isSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: emailForm.formState.isSubmitting ? '#555' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: emailForm.formState.isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
                marginBottom: '12px'
              }}
              className="py-2 sm:py-3 text-sm sm:text-base mb-3 sm:mb-4"
              onMouseEnter={(e) => {
                if (!emailForm.formState.isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseLeave={(e) => {
                if (!emailForm.formState.isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#007bff';
                }
              }}
            >
              {emailForm.formState.isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>

            {/* Ссылка на страницу входа */}
            <div style={{ textAlign: 'center' }}>
              <Link 
                to="/login" 
                style={{
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '13px'
                }}
                className="text-xs sm:text-sm md:text-base"
              >
                Вернуться к входу
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)}>
            {/* Поле Token */}
            <div style={{ marginBottom: '16px' }} className="mb-4 sm:mb-5">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#e0e0e0',
                fontSize: '13px'
              }} className="text-xs sm:text-sm md:text-base">
                Токен из почты
              </label>
              <input
                type="text"
                {...resetForm.register('token', {
                  required: 'Токен обязателен',
                })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: resetForm.formState.errors.token ? '2px solid #dc3545' : '1px solid #555',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: '#2a2829',
                  color: '#ffffff',
                  outline: 'none'
                }}
                className="py-2 sm:py-3 text-sm sm:text-base"
                placeholder="Введите токен из письма"
              />
              {resetForm.formState.errors.token && (
                <span style={{ color: '#dc3545', fontSize: '11px', marginTop: '5px', display: 'block' }} className="text-xs">
                  {resetForm.formState.errors.token.message}
                </span>
              )}
            </div>

            {/* Поле New Password */}
            <div style={{ marginBottom: '20px' }} className="mb-5 sm:mb-6">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#e0e0e0',
                fontSize: '13px'
              }} className="text-xs sm:text-sm md:text-base">
                Новый пароль
              </label>
              <input
                type="password"
                {...resetForm.register('new_password', {
                  required: 'Новый пароль обязателен',
                  minLength: {
                    value: 6,
                    message: 'Пароль должен содержать минимум 6 символов'
                  }
                })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: resetForm.formState.errors.new_password ? '2px solid #dc3545' : '1px solid #555',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: '#2a2829',
                  color: '#ffffff',
                  outline: 'none'
                }}
                className="py-2 sm:py-3 text-sm sm:text-base"
                placeholder="Введите новый пароль"
                autoComplete="new-password"
              />
              {resetForm.formState.errors.new_password && (
                <span style={{ color: '#dc3545', fontSize: '11px', marginTop: '5px', display: 'block' }} className="text-xs">
                  {resetForm.formState.errors.new_password.message}
                </span>
              )}
            </div>

            {/* Кнопка смены пароля */}
            <button
              type="submit"
              disabled={resetForm.formState.isSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: resetForm.formState.isSubmitting ? '#555' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: resetForm.formState.isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
                marginBottom: '12px'
              }}
              className="py-2 sm:py-3 text-sm sm:text-base mb-3 sm:mb-4"
              onMouseEnter={(e) => {
                if (!resetForm.formState.isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseLeave={(e) => {
                if (!resetForm.formState.isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#007bff';
                }
              }}
            >
              {resetForm.formState.isSubmitting ? 'Смена пароля...' : 'Поменять пароль'}
            </button>

            {/* Ссылка на страницу входа */}
            <div style={{ textAlign: 'center' }}>
              <Link 
                to="/login" 
                style={{
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '13px'
                }}
                className="text-xs sm:text-sm md:text-base"
              >
                Вернуться к входу
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

