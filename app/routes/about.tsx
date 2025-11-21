import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ProtectedRoute from "~/components/ProtectedRoute";
import { getUserId, getAuthToken, getTokenType, getUserEmail } from "~/utils/auth";
import { API_URL } from "~/utils/config";

// Компонент для отображения детальной информации об автомобиле

interface Car {
  id?: number;
  name: string;
  price: number;
  mileage: number;
  engine: string;
  transmition_box: string;
  gear: string;
  rudder: string;
  carcase: string;
  color: string;
  photo_url?: string;
  photo_path?: string;
}

interface OrderFormData {
  name: string;
  number: string;
  auto_name: string;
  comment: string;
  consent: boolean;
}

export default function About() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    name: "",
    number: "",
    auto_name: "",
    comment: "",
    consent: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<OrderFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCar = async (): Promise<void> => {
      if (!id) {
        setError("ID автомобиля не указан");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/cars/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const carData: Car = await response.json();
        setCar(carData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleOrder = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      number: "",
      auto_name: "",
      comment: "",
      consent: false,
    });
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let processedValue = value;
    
    // Для поля number (телефон) - оставляем только цифры
    if (name === 'number') {
      // Удаляем все нецифровые символы
      processedValue = value.replace(/\D/g, '');
      
      // Если начинается не с 8, заменяем первую цифру на 8
      if (processedValue.length > 0 && processedValue[0] !== '8') {
        processedValue = '8' + processedValue.replace(/^8/, '');
      }
      
      // Ограничиваем длину до 11 символов
      if (processedValue.length > 11) {
        processedValue = processedValue.substring(0, 11);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
    
    // Очищаем ошибку при изменении поля
    if (formErrors[name as keyof OrderFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<OrderFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Поле обязательно для заполнения";
    }
    
    if (!formData.number.trim()) {
      errors.number = "Поле обязательно для заполнения";
    } else {
      // Валидация российского формата телефона
      const phoneRegex = /^8\d{10}$/;
      if (!phoneRegex.test(formData.number)) {
        errors.number = "Введите номер в формате 89011345678 (11 цифр, начинается с 8)";
      }
    }
    
    if (!formData.consent) {
      errors.consent = true;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Получаем access_token из cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = decodeURIComponent(value);
          return acc;
        }, {} as Record<string, string>);
        
        const accessToken = cookies['access_token'];
        const tokenType = cookies['token_type'] || 'Bearer';
        
        if (!accessToken) {
          alert("Ошибка: не удалось получить токен авторизации. Пожалуйста, войдите в систему.");
          setIsSubmitting(false);
          return;
        }
        
        // Получаем email из JWT токена
        const userEmail = getUserEmail();
        if (!userEmail) {
          alert("Ошибка: не удалось получить email из токена авторизации. Пожалуйста, войдите в систему.");
          setIsSubmitting(false);
          return;
        }

        // Расшифровываем токен и берем id
        let from_id: number;
        let from_id_string: string;
        try {
          const payload = accessToken.split('.')[1];
          let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const padding = base64.length % 4;
          if (padding) {
            base64 += '='.repeat(4 - padding);
          }
          const decoded = JSON.parse(atob(base64));
          
          // Проверяем наличие id в объекте (пробуем разные варианты)
          let idValue = decoded.id || decoded.user_id || decoded.userId || decoded.sub || decoded.user?.id;
          
          if (idValue === undefined || idValue === null) {
            alert("Ошибка: ID не найден в токене.");
            setIsSubmitting(false);
            return;
          }
          
          // ID может быть строкой (например, ObjectId из MongoDB), поэтому сохраняем как строку
          from_id_string = String(idValue);
          
          // Пробуем преобразовать в число только если это действительно число
          if (typeof idValue === 'number' || /^\d+$/.test(String(idValue))) {
            from_id = typeof idValue === 'string' ? parseInt(idValue, 10) : Number(idValue);
          } else {
            // Если это строка (например, ObjectId), используем её напрямую
            // Но для переменной from_id используем 0 как placeholder, так как это строка
            from_id = 0; // placeholder, так как реальное значение будет строкой
          }
        } catch (error) {
          alert("Ошибка при расшифровке токена.");
          setIsSubmitting(false);
          return;
        }
        
        // Формируем данные для отправки на сервер
        const submitData = {
          from_id: from_id_string, // Используем строковое значение ID (может быть ObjectId)
          name: formData.name, // Обязательное поле
          number: formData.number, // Обязательное поле
          email: userEmail, // Email из JWT токена
          auto_name: formData.auto_name,
          comment: formData.comment,
        };
        
        // Формируем заголовки с access_token из cookies
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'Authorization': `${tokenType} ${accessToken}`,
        };
        
        const response = await fetch(`${API_URL}/orders/add_order`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(submitData),
        });
        
        // Получаем ответ от сервера
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
          // Игнорируем ошибки парсинга
        }
        
        // Обрабатываем ошибку
        if (!response.ok) {
          
          // Специальная обработка для 422 (Unprocessable Entity)
          if (response.status === 422) {
            let errorMessage = 'Ошибка валидации данных: ';
            
            // Пытаемся извлечь детали ошибки валидации
            if (responseData?.detail) {
              if (Array.isArray(responseData.detail)) {
                const errors = responseData.detail.map((err: any) => {
                  if (err.loc && err.msg) {
                    return `${err.loc.join('.')}: ${err.msg}`;
                  }
                  return err.msg || JSON.stringify(err);
                }).join('; ');
                errorMessage += errors;
              } else if (typeof responseData.detail === 'string') {
                errorMessage += responseData.detail;
              } else {
                errorMessage += JSON.stringify(responseData.detail);
              }
            } else {
              errorMessage += responseData?.message || responseData?.error || 'Проверьте отправляемые данные';
            }
            
            alert(errorMessage);
          } else {
            const errorMessage = 
              responseData?.message || 
              responseData?.error || 
              responseData?.detail ||
              responseData?.msg ||
              `HTTP ${response.status}: ${response.statusText}` ||
              'Ошибка при отправке заявки';
            alert(`Ошибка: ${errorMessage}`);
          }
          
          setIsSubmitting(false);
          return;
        }
        
        // Обрабатываем успешный ответ
        const successMessage = responseData?.message || 'Заявка успешно отправлена!';
        alert(successMessage);
        closeModal();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Ошибка при отправке заявки';
          alert(`Ошибка: ${message}`);
        } finally {
          setIsSubmitting(false);
        }
    }
  };

  // Функция для получения URL изображения
  const getImageUrl = (car: Car): string | undefined => {
    if (car.photo_url) {
      return car.photo_url;
    } else if (car.photo_path) {
      const baseUrl = API_URL;
      return `${baseUrl}${car.photo_path}`;
    }
    return undefined;
  };

  // Создаем массив характеристик для отображения через map
  const carSpecs = car
    ? [
        { label: "Пробег", value: `${car.mileage} км` },
        { label: "Двигатель", value: car.engine },
        { label: "Коробка передач", value: car.transmition_box },
        { label: "Привод", value: car.gear },
        { label: "Руль", value: car.rudder },
        { label: "Кузов", value: car.carcase },
        { label: "Цвет", value: car.color },
      ]
    : [];

  const imageUrl = car ? getImageUrl(car) : undefined;
  
  // Форматирование цены в рубли
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ru-RU')} Р`;
  };

  return (
    <ProtectedRoute>
      {loading && (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white">Загрузка данных автомобиля...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center max-w-md mx-4">
            <h2 className="text-xl font-bold text-red-200 mb-2">Ошибка</h2>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && !car && (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <p className="text-white text-xl">Автомобиль не найден</p>
          </div>
        </div>
      )}

      {!loading && !error && car && (
        <div className="min-h-screen flex flex-col md:flex-row">
          {/* Левая часть - Фотография автомобиля (2/3 ширины) */}
          <div className="w-full md:w-2/3 h-64 sm:h-80 md:h-96 lg:h-screen relative bg-gray-900">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={car.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <p className="text-white text-sm sm:text-base">Изображение не найдено</p>
              </div>
            )}
          </div>

          {/* Правая часть - Информация (1/3 ширины) */}
          <div className="w-full md:w-1/3 bg-[#1a1a1a] p-4 sm:p-6 md:p-8 flex flex-col min-h-[400px] md:min-h-screen">
            {/* Название автомобиля */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
              {car.name}
            </h1>

            {/* Цена */}
            <div className="mb-6 md:mb-8">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400">
                {formatPrice(car.price)}
              </p>
            </div>

            {/* Характеристики */}
            <div className="flex-1 space-y-3 md:space-y-4">
              {carSpecs.map((spec, index) => (
                <div key={index} className="border-b border-gray-600 pb-3 md:pb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {spec.label}
                    </span>
                    <span className="text-white text-sm sm:text-base font-semibold">
                      {spec.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Кнопка заказа */}
            <button
              onClick={handleOrder}
              className="mt-6 md:mt-8 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg transition-colors duration-200 text-base md:text-lg w-full"
            >
              Заказать
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно с формой заказа */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div 
            className="bg-black border-2 border-yellow-400 rounded-lg max-w-sm w-full p-4 sm:p-5 relative my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-white hover:text-yellow-400 transition-colors text-xl font-bold"
            >
              ×
            </button>

            {/* Заголовок */}
            <h2 className="text-white text-lg sm:text-xl font-bold uppercase text-center mb-4 sm:mb-5">
              ЗАКАЗАТЬ ЗВОНОК
            </h2>

            {/* Форма */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Поле "Представьтесь" */}
              <div>
                <label className="block text-white mb-1.5 text-xs sm:text-sm">
                  Представьтесь <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Имя"
                  className="w-full bg-transparent border border-white text-white px-3 py-2 sm:py-1.5 rounded text-sm focus:outline-none focus:border-yellow-400"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Поле "Телефон" */}
              <div>
                <label className="block text-white mb-1.5 text-xs sm:text-sm">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="89011345678"
                  maxLength={11}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full bg-transparent border border-white text-white px-3 py-2 sm:py-1.5 rounded text-sm focus:outline-none focus:border-yellow-400"
                />
                {formErrors.number && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.number}</p>
                )}
              </div>

              {/* Выпадающий список "Выберите модель автомобиля" */}
              <div>
                <label className="block text-white mb-1.5 text-xs sm:text-sm">
                  Выберите модель автомобиля
                </label>
                <select
                  name="auto_name"
                  value={formData.auto_name}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-white text-white px-3 py-2 sm:py-1.5 rounded text-sm focus:outline-none focus:border-yellow-400 appearance-none"
                >
                  <option value="" className="bg-black">Марка:</option>
                  {car && <option value={car.name} className="bg-black">{car.name}</option>}
                </select>
              </div>

              {/* Поле "Комментарий" */}
              <div>
                <label className="block text-white mb-1.5 text-xs sm:text-sm">
                  Комментарий
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-transparent border border-white text-white px-3 py-2 sm:py-1.5 rounded text-sm focus:outline-none focus:border-yellow-400 resize-none"
                />
              </div>

              {/* Чекбокс согласия */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className="mt-0.5 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-transparent border border-white rounded focus:outline-none focus:border-yellow-400 shrink-0"
                />
                <label className="text-white text-xs leading-tight">
                  Я даю согласие на обработку моих персональных данных в соответствии с условиями политики конфиденциальности
                </label>
              </div>
              {formErrors.consent && (
                <p className="text-red-500 text-xs">Необходимо дать согласие</p>
              )}

              {/* Кнопка "Отправить" */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
