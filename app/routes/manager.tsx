import { useEffect, useState } from "react";
import ProtectedRoute from "~/components/ProtectedRoute";

interface Order {
  id: number;
  name?: string;
  phone?: string;
  car_model?: string;
  comment?: string;
  status?: string;
  created_at?: string;
  from_id?: number;
  auto_name?: string;
  number?: string;
  [key: string]: any; // Для дополнительных полей
}

export default function Manager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://127.0.0.1:8001/orders');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const ordersData: Order[] = await response.json();
        console.log(ordersData);
        setOrders(ordersData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderClick = (orderId: number) => {
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
    } else {
      setSelectedOrderId(orderId);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#302E2F] p-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-white mb-6">Список заказов</h1>

          {loading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-white">Загрузка заказов...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-red-200 mb-2">Ошибка</h2>
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {orders.length === 0 ? (
                <div className="bg-[#3A3839] rounded-lg p-6 text-center">
                  <p className="text-white text-lg">Заказов пока нет</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id}>
                      <div
                        onClick={() => handleOrderClick(order.id)}
                        className="bg-[#3A3839] rounded-lg p-6 border border-gray-600 hover:border-yellow-400 transition-colors cursor-pointer"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-4">
                              Заказ #{order.id}
                            </h3>
                            {order.name && (
                              <p className="text-white mb-2">
                                <span className="text-gray-400">Имя:</span> {order.name}
                              </p>
                            )}
                            {order.phone && (
                              <p className="text-white mb-2">
                                <span className="text-gray-400">Телефон:</span> {order.phone}
                              </p>
                            )}
                            {order.car_model && (
                              <p className="text-white mb-2">
                                <span className="text-gray-400">Модель:</span> {order.car_model}
                              </p>
                            )}
                          </div>
                          <div>
                            {order.status && (
                              <p className="text-white mb-2">
                                <span className="text-gray-400">Статус:</span>{' '}
                                <span className="text-yellow-400 font-semibold">{order.status}</span>
                              </p>
                            )}
                            {order.created_at && (
                              <p className="text-white mb-2">
                                <span className="text-gray-400">Дата:</span> {new Date(order.created_at).toLocaleString('ru-RU')}
                              </p>
                            )}
                            {order.comment && (
                              <div className="mt-4">
                                <p className="text-gray-400 mb-1">Комментарий:</p>
                                <p className="text-white">{order.comment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Дополнительные параметры заказа */}
                      {selectedOrderId === order.id && (
                        <div className="bg-[#2a2829] rounded-lg p-4 mt-2 border border-gray-700">
                          <h4 className="text-lg font-semibold text-white mb-3">Дополнительные параметры:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {order.from_id !== undefined && (
                              <div>
                                <p className="text-gray-400 text-sm mb-1">От кого:</p>
                                <p className="text-white font-medium">{order.from_id}</p>
                              </div>
                            )}
                            {order.auto_name && (
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Название авто:</p>
                                <p className="text-white font-medium">{order.auto_name}</p>
                              </div>
                            )}
                            {order.number && (
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Номер:</p>
                                <p className="text-white font-medium">{order.number}</p>
                              </div>
                            )}
                            {order.name && (
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Имя:</p>
                                <p className="text-white font-medium">{order.name}</p>
                              </div>
                            )}
                            {order.comment && (
                              <div className="md:col-span-3">
                                <p className="text-gray-400 text-sm mb-1">Комментарий:</p>
                                <p className="text-white font-medium">{order.comment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}