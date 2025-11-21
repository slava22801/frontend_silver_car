import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL } from '~/utils/config';

interface ReviewForm {
  name: string;
  email: string;
  rating: number;
  comment: string;
  consent: boolean;
}

interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  consent: boolean;
  created_at: string;
}

export default function Reviews() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<ReviewForm>({
    defaultValues: {
      rating: 0,
      consent: false,
    }
  });

  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [submitError, setSubmitError] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true);
  const rating = watch("rating");

  // Загрузка отзывов
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await fetch(`${API_URL}/reviews`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reviewsData = await response.json();
        // Проверяем, является ли ответ массивом
        const reviewsArray = Array.isArray(reviewsData) ? reviewsData : (reviewsData.reviews || reviewsData.data || []);
        setReviews(reviewsArray);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        // В случае ошибки оставляем пустой массив, но не показываем ошибку пользователю
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Обновление отзывов после успешной отправки
  const refreshReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews`);
      
      if (response.ok) {
        const reviewsData = await response.json();
        const reviewsArray = Array.isArray(reviewsData) ? reviewsData : (reviewsData.reviews || reviewsData.data || []);
        setReviews(reviewsArray);
      }
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    }
  };

  const onSubmit = async (data: ReviewForm) => {
    try {
      setSubmitMessage("");
      setSubmitError(false);

      // Подготавливаем данные для отправки
      const submitData = {
        name: data.name,
        email: data.email,
        rating: Number(data.rating), // Убеждаемся, что rating - число
        comment: data.comment,
        consent: data.consent, // Добавляем согласие
      };

      console.log('Отправка данных:', submitData);

      const response = await fetch(`${API_URL}/reviews/add_review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
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
        let errorMessage = 'Ошибка при отправке отзыва';
        
        if (responseData) {
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (typeof responseData === 'object') {
            // Обработка детальных ошибок валидации
            if (responseData.detail) {
              if (Array.isArray(responseData.detail)) {
                // FastAPI validation errors
                const errors = responseData.detail.map((err: any) => {
                  const field = err.loc ? err.loc.join('.') : 'unknown';
                  return `${field}: ${err.msg}`;
                });
                errorMessage = errors.join('; ');
              } else if (typeof responseData.detail === 'string') {
                errorMessage = responseData.detail;
              } else {
                errorMessage = JSON.stringify(responseData.detail);
              }
            } else {
              errorMessage = 
                responseData.message || 
                responseData.error || 
                responseData.msg ||
                (Array.isArray(responseData.errors) ? responseData.errors.join(', ') : null) ||
                JSON.stringify(responseData);
            }
          }
        }
        
        if (errorMessage === 'Ошибка при отправке отзыва') {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Ошибка сервера'}`;
        }
        
        throw new Error(errorMessage);
      }

      const successMessage = responseData?.message || 'Спасибо за ваш отзыв!';
      setSubmitMessage(successMessage);
      setSubmitError(false);
      setShowSuccessModal(true);
      reset();
      // Обновляем список отзывов после успешной отправки
      await refreshReviews();
    } catch (error) {
      let message = 'Ошибка при отправке отзыва';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        message = 'Не удалось подключиться к серверу. Проверьте, что сервер запущен.';
      } else if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object') {
        const errorObj = error as any;
        message = errorObj.message || errorObj.error || errorObj.detail || JSON.stringify(error);
      }
      
      setSubmitMessage(message);
      setSubmitError(true);
    }
  };

  const handleStarClick = (value: number) => {
    setValue("rating", value, { shouldValidate: true });
  };

  return (
    <>
      {/* Модальное окно успешного сохранения */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3A3839] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              {/* Иконка успеха */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Спасибо!
              </h2>
              
              <p className="text-white text-sm md:text-base mb-6">
                {submitMessage || 'Ваш отзыв успешно отправлен!'}
              </p>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl text-sm md:text-base"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#302E2F] p-4 sm:p-6 md:p-8">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-[#3A3839] rounded-2xl p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
              Оставить отзыв
            </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            {/* Имя */}
            <div>
              <label htmlFor="name" className="block text-white text-sm md:text-base mb-2">
                Ваше имя <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register('name', {
                  required: 'Имя обязательно для заполнения',
                  minLength: {
                    value: 2,
                    message: 'Имя должно содержать минимум 2 символа'
                  }
                })}
                className="w-full px-4 py-2 md:py-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base"
                placeholder="Введите ваше имя"
              />
              {errors.name && (
                <span className="text-red-400 text-xs md:text-sm mt-1 block">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-white text-sm md:text-base mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email обязателен',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Некорректный email адрес'
                  }
                })}
                className="w-full px-4 py-2 md:py-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base"
                placeholder="Введите ваш email"
              />
              {errors.email && (
                <span className="text-red-400 text-xs md:text-sm mt-1 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Рейтинг */}
            <div>
              <label className="block text-white text-sm md:text-base mb-2">
                Оценка <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 md:w-10 md:h-10 transition-colors ${
                        star <= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-400 fill-gray-400'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-white text-sm md:text-base ml-2">
                    {rating} из 5
                  </span>
                )}
              </div>
              {errors.rating && (
                <span className="text-red-400 text-xs md:text-sm mt-1 block">
                  {errors.rating.message}
                </span>
              )}
              <input
                type="hidden"
                {...register('rating', {
                  required: 'Пожалуйста, выберите оценку',
                  min: {
                    value: 1,
                    message: 'Оценка должна быть от 1 до 5'
                  }
                })}
              />
            </div>

            {/* Комментарий */}
            <div>
              <label htmlFor="comment" className="block text-white text-sm md:text-base mb-2">
                Ваш отзыв <span className="text-red-400">*</span>
              </label>
              <textarea
                id="comment"
                {...register('comment', {
                  required: 'Отзыв обязателен для заполнения',
                  minLength: {
                    value: 10,
                    message: 'Отзыв должен содержать минимум 10 символов'
                  },
                  maxLength: {
                    value: 1000,
                    message: 'Отзыв не должен превышать 1000 символов'
                  }
                })}
                rows={6}
                className="w-full px-4 py-2 md:py-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base resize-none"
                placeholder="Поделитесь своими впечатлениями..."
              />
              {errors.comment && (
                <span className="text-red-400 text-xs md:text-sm mt-1 block">
                  {errors.comment.message}
                </span>
              )}
            </div>

            {/* Согласие */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="consent"
                {...register('consent', {
                  required: 'Необходимо согласие на обработку персональных данных'
                })}
                className="mt-1 mr-2 w-4 h-4 text-yellow-400 bg-gray-200 border-gray-300 rounded focus:ring-yellow-400"
              />
              <label htmlFor="consent" className="text-white text-xs md:text-sm">
                Я согласен(а) на обработку персональных данных <span className="text-red-400">*</span>
              </label>
            </div>
            {errors.consent && (
              <span className="text-red-400 text-xs md:text-sm block">
                {errors.consent.message}
              </span>
            )}

            {/* Сообщение об успехе/ошибке */}
            {submitMessage && (
              <div
                className={`p-3 md:p-4 rounded-lg text-sm md:text-base ${
                  submitError
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {submitMessage}
              </div>
            )}

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white font-semibold py-3 md:py-4 px-6 rounded-lg hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
            </button>
          </form>
        </div>
      </div>

      {/* Секция с отзывами */}
      <div className="container mx-auto max-w-3xl mt-8 md:mt-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
          Отзывы
        </h2>

        {reviewsLoading ? (
          <div className="bg-[#3A3839] rounded-2xl p-6 md:p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white text-sm md:text-base">Загрузка отзывов...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#3A3839] rounded-2xl p-4 md:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 md:mb-4">
                  <div className="mb-2 md:mb-0">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                      {review.name}
                    </h3>
                    <p className="text-gray-400 text-xs md:text-sm">
                      {review.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Звезды рейтинга */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 md:w-5 md:h-5 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-500 fill-gray-500'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-white text-xs md:text-sm">
                      {review.rating}/5
                    </span>
                  </div>
                </div>
                
                <p className="text-white text-sm md:text-base mb-3 md:mb-4 leading-relaxed">
                  {review.comment}
                </p>
                
                <p className="text-gray-500 text-xs md:text-sm">
                  {new Date(review.created_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#3A3839] rounded-2xl p-6 md:p-8 text-center">
            <p className="text-white text-sm md:text-base">
              Пока нет отзывов. Будьте первым!
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

