import { useEffect, useState } from "react";
import { Link } from "react-router";
import ProtectedRoute from "~/components/ProtectedRoute";

export default function Cars() {
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
  interface UseCarsResult {
  cars: Car[];
  loading: boolean;
  error: string | null;
  }


  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://127.0.0.1:8001/cars');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const carsData: Car[] = await response.json();
        console.log(carsData);
        setCars(carsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching cars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);
  // Функция для получения URL изображения
  const getImageUrl = (car: Car): string | undefined => {
    if (car.photo_url) {
      // Если есть полный URL, используем его
      return car.photo_url;
    } else if (car.photo_path) {
      // Если есть относительный путь, добавляем базовый URL сервера
      const baseUrl = 'http://127.0.0.1:8001';
      return `${baseUrl}${car.photo_path}`;
    }
    return undefined;
  };

  return (
    <ProtectedRoute>
      {loading && (
        <div className="min-h-screen bg-[#302E2F] flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Загрузка...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="min-h-screen bg-[#302E2F] flex items-center justify-center p-4">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center max-w-md">
            <h2 className="text-xl font-bold text-red-200 mb-2">Ошибка</h2>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}
      {!loading && !error && (
        <div className="min-h-screen bg-[#302E2F] p-4 sm:p-6 md:p-8 lg:p-[100px]">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">Автомобили</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {cars.map(car => {
              const imageUrl = getImageUrl(car);
              return (
                <Link 
                  to={`/about/${car.id}`} 
                  key={car.id} 
                  style={{ 
                    border: '1px solid #ccc', 
                    margin: '10px', 
                    padding: '10px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={car.name}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}
                      className="sm:h-[200px] lg:h-[220px]"
                      onError={(e) => {
                        // Если изображение не загрузилось, скрываем его
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div 
                      style={{
                        width: '100%',
                        height: '180px',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        color: '#999'
                      }}
                      className="sm:h-[200px] lg:h-[220px]"
                    >
                      Нет фото
                    </div>
                  )}
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }} className="text-base sm:text-lg md:text-xl">{car.name}</h3>
                  <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold', color: '#007bff' }} className="text-sm sm:text-base md:text-lg">
                    ${car.price.toLocaleString()}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '12px' }} className="text-xs sm:text-sm md:text-base">Пробег: {car.mileage.toLocaleString()} км</p>
                  <p style={{ margin: '4px 0', fontSize: '12px' }} className="text-xs sm:text-sm md:text-base">Двигатель: {car.engine}</p>
                  <p style={{ margin: '4px 0', fontSize: '12px' }} className="text-xs sm:text-sm md:text-base">КПП: {car.transmition_box}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}