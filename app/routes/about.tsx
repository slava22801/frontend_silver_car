import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ProtectedRoute from "~/components/ProtectedRoute";

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

export default function About() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const response = await fetch(`http://127.0.0.1:8001/cars/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const carData: Car = await response.json();
        console.log(carData);
        setCar(carData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching car:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleOrder = () => {
    if (car) {
      alert(`Заказ автомобиля "${car.name}" оформлен!`);
      // Здесь можно добавить логику оформления заказа
    }
  };

  // Функция для получения URL изображения
  const getImageUrl = (car: Car): string | undefined => {
    if (car.photo_url) {
      return car.photo_url;
    } else if (car.photo_path) {
      const baseUrl = 'http://127.0.0.1:8001';
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

  return (
    <ProtectedRoute>
      {loading && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка данных автомобиля...</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Ошибка</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && !car && (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Автомобиль не найден</p>
          </div>
        </div>
      )}

      {!loading && !error && car && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Заголовок и цена */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{car.name}</h1>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-2xl font-bold text-blue-600">${car.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={handleOrder}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
                >
                  Заказать
                </button>
              </div>
            </div>

            {/* Фотографии автомобиля */}
            {imageUrl && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Фотографии</h2>
                <img 
                  src={imageUrl} 
                  alt={car.name}
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Характеристики автомобиля */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Характеристики</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {carSpecs.map((spec, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-3 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">{spec.label}:</span>
                      <span className="text-gray-800 font-semibold">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
