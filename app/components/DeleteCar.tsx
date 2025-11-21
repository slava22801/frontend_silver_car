import { useEffect, useState } from "react";
import { getAuthToken, getTokenType } from "~/utils/auth";
import { API_URL } from "~/utils/config";

interface Car {
  id?: string;
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

export default function DeleteCar() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // Функция удаления автомобиля
  const handleDelete = async (carId: string | undefined): Promise<void> => {
    if (!carId) {
      alert('ID автомобиля не указан');
      return;
    }

    // Подтверждение удаления
    const confirmed = window.confirm(`Вы уверены, что хотите удалить автомобиль с ID ${carId}?`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(carId);

      // Получаем токен из cookies
      const accessToken = getAuthToken();
      const tokenType = getTokenType();

      if (!accessToken) {
        alert('Ошибка: не удалось получить токен авторизации. Пожалуйста, войдите в систему.');
        setDeletingId(null);
        return;
      }

      // Отправляем DELETE запрос
      const response = await fetch(`${API_URL}/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${tokenType} ${accessToken}`,
        },
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
        // Игнорируем ошибки парсинга
      }

      if (!response.ok) {
        const errorMessage = 
          responseData?.message || 
          responseData?.error || 
          responseData?.detail ||
          `HTTP ${response.status}: ${response.statusText}` ||
          'Ошибка при удалении автомобиля';
        throw new Error(errorMessage);
      }

      // Успешное удаление
      const successMessage = responseData?.message || 'Автомобиль успешно удален!';
      alert(successMessage);
      
      // Обновляем список автомобилей
      await fetchCars();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при удалении автомобиля';
      alert(`Ошибка: ${errorMessage}`);
      console.error('Error deleting car:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Форматирование цены
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ru-RU')} Р`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#302E2F] p-4 sm:p-6 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6">Удалить автомобиль</h1>
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6">Удалить автомобиль</h1>
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
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">Удалить автомобиль</h1>
        
        {cars.length === 0 ? (
          <div className="bg-[#3A3839] rounded-lg p-6 text-center">
            <p className="text-white text-lg">Автомобили не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {cars.map((car) => {
              const imageUrl = getImageUrl(car);
              const isDeleting = deletingId === car.id;
              
              return (
                <div
                  key={car.id}
                  className="bg-[#3A3839] rounded-lg overflow-hidden border border-gray-600 hover:border-yellow-400 transition-colors flex flex-col"
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

                    {/* Кнопка удаления */}
                    <button
                      onClick={() => handleDelete(car.id)}
                      disabled={isDeleting}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Удаление...</span>
                        </>
                      ) : (
                        <span>Удалить</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
