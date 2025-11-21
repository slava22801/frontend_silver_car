import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getAuthToken, getTokenType } from '~/utils/auth';
import { API_URL } from '~/utils/config';

interface Car {
  id?: string | number;
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

interface CarForm {
  name: string;
  price: number;
  mileage: number;
  engine: string;
  transmition_box: string;
  gear: string;
  rudder: string;
  carcase: string;
  color: string;
  image?: FileList;
}

const EditCar: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string | number | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<CarForm>();

  const imageFile = watch('image');

  // Загрузка списка автомобилей
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/cars`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const carsData: Car[] = await response.json();
      setCars(carsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных выбранного автомобиля
  useEffect(() => {
    if (selectedCarId) {
      const car = cars.find(c => c.id === selectedCarId);
      if (car) {
        setSelectedCar(car);
        setValue('name', car.name);
        setValue('price', car.price);
        setValue('mileage', car.mileage);
        setValue('engine', car.engine);
        setValue('transmition_box', car.transmition_box);
        setValue('gear', car.gear);
        setValue('rudder', car.rudder);
        setValue('carcase', car.carcase);
        setValue('color', car.color);
        
        // Установка предпросмотра изображения
        if (car.photo_url) {
          setPreviewImage(car.photo_url);
        } else if (car.photo_path) {
          setPreviewImage(`${API_URL}${car.photo_path}`);
        } else {
          setPreviewImage(null);
        }
      }
    } else {
      setSelectedCar(null);
      setPreviewImage(null);
      reset();
    }
  }, [selectedCarId, cars, setValue, reset]);

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

  // Обработка изменения файла
  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [imageFile]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  const onSubmit = async (data: CarForm) => {
    if (!selectedCarId) {
      alert('Выберите автомобиль для редактирования');
      return;
    }

    try {
      // Получаем токен из cookies
      const accessToken = getAuthToken();
      const tokenType = getTokenType();

      if (!accessToken) {
        alert('Ошибка: не удалось получить токен авторизации. Пожалуйста, войдите в систему.');
        return;
      }

      const url = `${API_URL}/cars/${selectedCarId}`;
      
      let response: Response;
      const headers: HeadersInit = {
        'Authorization': `${tokenType} ${accessToken}`,
      };
      
      // Если есть новое изображение, отправляем FormData
      if (data.image && data.image.length > 0) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('price', data.price.toString());
        formData.append('mileage', data.mileage.toString());
        formData.append('engine', data.engine);
        formData.append('transmition_box', data.transmition_box);
        formData.append('gear', data.gear);
        formData.append('rudder', data.rudder);
        formData.append('carcase', data.carcase);
        formData.append('color', data.color);
        formData.append('photo', data.image[0]);
        
        // Не устанавливаем Content-Type для FormData - браузер сделает это автоматически
        response = await fetch(url, {
          method: 'PUT',
          headers: headers,
          body: formData,
        });
      } else {
        // Если нет нового изображения, отправляем JSON
        const jsonData = {
          name: data.name,
          price: data.price,
          mileage: data.mileage,
          engine: data.engine,
          transmition_box: data.transmition_box,
          gear: data.gear,
          rudder: data.rudder,
          carcase: data.carcase,
          color: data.color,
        };
        
        headers['Content-Type'] = 'application/json';
        
        response = await fetch(url, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(jsonData),
        });
      }

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
              }).join('\n');
              errorMessage += errors;
            } else if (typeof responseData.detail === 'string') {
              errorMessage += responseData.detail;
            } else {
              errorMessage += JSON.stringify(responseData.detail);
            }
          } else {
            errorMessage += responseData?.message || responseData?.error || 'Проверьте отправляемые данные';
          }
          
          throw new Error(errorMessage);
        }
        
        const errorMessage = 
          responseData?.message || 
          responseData?.error || 
          responseData?.detail ||
          `HTTP ${response.status}: ${response.statusText}` ||
          'Ошибка при редактировании автомобиля';
        throw new Error(errorMessage);
      }
      
      const successMessage = responseData?.message || 'Автомобиль успешно отредактирован!';
      alert(successMessage);
      
      // Обновляем список автомобилей
      await fetchCars();
      
      // Сбрасываем выбранный автомобиль
      setSelectedCarId(null);
      reset();
      setPreviewImage(null);
    } catch (error) {
      let message = 'Ошибка при редактировании автомобиля';
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      alert(`Ошибка: ${message}`);
    }
  };

  const { ref, ...imageRegister } = register('image', {
    validate: {
      fileType: (files) => {
        if (files && files.length > 0) {
          const file = files[0];
          if (!file.type.startsWith('image/')) {
            return 'Файл должен быть изображением';
          }
        }
        return true;
      },
      fileSize: (files) => {
        if (files && files.length > 0) {
          const file = files[0];
          const maxSize = 5 * 1024 * 1024;
          if (file.size > maxSize) {
            return 'Размер файла не должен превышать 5MB';
          }
        }
        return true;
      }
    }
  });

  // Форматирование цены
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ru-RU')} Р`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#302E2F] p-4 sm:p-6 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6">Редактировать автомобиль</h1>
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-white">Загрузка автомобилей...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#302E2F] p-4 sm:p-6 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6">Редактировать автомобиль</h1>
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-200 mb-2">Ошибка</h2>
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchCars}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#302E2F] p-4 sm:p-6 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">Редактировать автомобиль</h1>
        
        {cars.length === 0 ? (
          <div className="bg-[#3A3839] rounded-lg p-6 text-center">
            <p className="text-white text-lg">Автомобили не найдены</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Список автомобилей */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {cars.map((car) => {
                const imageUrl = getImageUrl(car);
                const isSelected = selectedCarId === car.id;
                
                return (
                  <div
                    key={car.id}
                    onClick={() => {
                      if (selectedCarId === car.id) {
                        setSelectedCarId(null);
                      } else {
                        setSelectedCarId(car.id || null);
                      }
                    }}
                    className={`bg-[#3A3839] rounded-lg overflow-hidden border cursor-pointer transition-colors flex flex-col ${
                      isSelected ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-gray-600 hover:border-yellow-400'
                    }`}
                  >
                    {/* Изображение */}
                    <div className="w-full h-48 sm:h-56 md:h-64 relative bg-gray-800">
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
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Нет фото
                        </div>
                      )}
                    </div>

                    {/* Информация */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{car.name}</h3>
                      <p className="text-yellow-400 font-bold text-lg sm:text-xl mb-3">
                        {formatPrice(car.price)}
                      </p>
                      
                      <div className="space-y-1 mb-4 flex-1">
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">Пробег:</span> {car.mileage.toLocaleString('ru-RU')} км
                        </p>
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">Двигатель:</span> {car.engine}
                        </p>
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">КПП:</span> {car.transmition_box}
                        </p>
                      </div>

                      {/* Индикатор выбора */}
                      <div className={`w-full py-2 px-4 rounded-lg text-center font-medium ${
                        isSelected 
                          ? 'bg-yellow-400 text-gray-900' 
                          : 'bg-gray-600 text-white hover:bg-gray-500'
                      }`}>
                        {isSelected ? 'Выбрано для редактирования' : 'Нажмите для редактирования'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Форма редактирования */}
            {selectedCar && (
              <div className="bg-[#3A3839] rounded-lg p-4 sm:p-6 md:p-8 mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  Редактировать: {selectedCar.name}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block mb-2 font-medium text-white text-sm sm:text-base">
                      Фотография автомобиля (необязательно - оставьте пустым, чтобы не менять)
                    </label>
                    
                    <div 
                      onClick={handleImageClick}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-gray-500 p-4 sm:p-6 text-center rounded-lg bg-gray-800 cursor-pointer min-h-[200px] flex flex-col items-center justify-center relative transition-colors hover:border-yellow-400"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        {...imageRegister}
                        className="hidden"
                        ref={(e) => {
                          ref(e);
                          fileInputRef.current = e;
                        }}
                      />
                      
                      {previewImage ? (
                        <div className="w-full relative">
                          <img 
                            src={previewImage} 
                            alt="Предпросмотр" 
                            className="max-w-full max-h-[300px] rounded-lg object-contain mx-auto"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="absolute top-2 right-2 bg-red-600 bg-opacity-70 text-white border-none rounded-full w-8 h-8 cursor-pointer text-lg flex items-center justify-center hover:bg-opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <div className="text-4xl sm:text-5xl mb-2">📷</div>
                          <div className="text-sm sm:text-base mb-1">
                            Нажмите для загрузки или перетащите изображение сюда
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            Поддерживаются форматы: JPG, PNG, GIF (макс. 5MB)
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.image && (
                      <div className="text-red-500 mt-2 text-sm">
                        {errors.image.message}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-medium text-white text-sm sm:text-base">Название:</label>
                      <input
                        type="text"
                        {...register('name', { 
                          required: 'Название обязательно',
                          minLength: {
                            value: 2,
                            message: 'Название должно содержать минимум 2 символа'
                          }
                        })}
                        className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                      />
                      {errors.name && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.name.message}</span>}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-white text-sm sm:text-base">Цена (₽):</label>
                      <input
                        type="number"
                        {...register('price', { 
                          required: 'Цена обязательна',
                          min: {
                            value: 0,
                            message: 'Цена должна быть положительной'
                          }
                        })}
                        className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                      />
                      {errors.price && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.price.message}</span>}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-white text-sm sm:text-base">Пробег (км):</label>
                      <input
                        type="number"
                        {...register('mileage', { 
                          required: 'Пробег обязателен',
                          min: {
                            value: 0,
                            message: 'Пробег должен быть положительным'
                          }
                        })}
                        className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                      />
                      {errors.mileage && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.mileage.message}</span>}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-white text-sm sm:text-base">Двигатель:</label>
                      <input
                        type="text"
                        {...register('engine', { required: 'Двигатель обязателен' })}
                        className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                      />
                      {errors.engine && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.engine.message}</span>}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-white text-sm sm:text-base">Коробка передач:</label>
                      <select
                        {...register('transmition_box', { required: 'Коробка передач обязательна' })}
                        className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                      >
                        <option value="">Выберите коробку</option>
                        <option value="manual">МКПП</option>
                        <option value="automatic">АКПП</option>
                        <option value="robot">Робот</option>
                        <option value="variator">Вариатор</option>
                      </select>
                      {errors.transmition_box && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.transmition_box.message}</span>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-white text-sm sm:text-base">Привод:</label>
                      <select
                        {...register('gear', { required: 'Привод обязателен' })}
                        className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                      >
                        <option value="">Выберите привод</option>
                        <option value="front-wheel">Передний</option>
                        <option value="rear-wheel">Задний</option>
                        <option value="all-wheel">Полный</option>
                      </select>
                      {errors.gear && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.gear.message}</span>}
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-medium text-white text-sm sm:text-base">Руль:</label>
                      <select
                        {...register('rudder', { required: 'Руль обязателен' })}
                        className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                      >
                        <option value="">Выберите руль</option>
                        <option value="left">Левый</option>
                        <option value="right">Правый</option>
                      </select>
                      {errors.rudder && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.rudder.message}</span>}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-white text-sm sm:text-base">Кузов:</label>
                      <select
                        {...register('carcase', { required: 'Кузов обязателен' })}
                        className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                      >
                        <option value="">Выберите кузов</option>
                        <option value="sedan">Седан</option>
                        <option value="hatchback">Хэтчбек</option>
                        <option value="suv">Внедорожник</option>
                        <option value="coupe">Купе</option>
                        <option value="wagon">Универсал</option>
                      </select>
                      {errors.carcase && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.carcase.message}</span>}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-white text-sm sm:text-base">Цвет:</label>
                      <input
                        type="text"
                        {...register('color', { required: 'Цвет обязателен' })}
                        className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                      />
                      {errors.color && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.color.message}</span>}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                        Сохранение...
                      </span>
                    ) : (
                      'Изменить'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditCar;


