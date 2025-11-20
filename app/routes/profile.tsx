import { useState, useEffect } from "react";
import ProtectedRoute from "~/components/ProtectedRoute";
import { getUsername, getUserEmail, getUserIdAsString } from "~/utils/auth";

interface Order {
  id: number;
  carName?: string;
  auto_name?: string;
  status?: string;
  name?: string;
  phone?: string;
  car_model?: string;
  [key: string]: any;
}

export default function Profile() {
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>("+7 996 221 7883"); // Можно получать из токена или API
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);

  useEffect(() => {
    setUsername(getUsername());
    setEmail(getUserEmail());
  }, []);

  useEffect(() => {
    const fetchOrders = async (): Promise<void> => {
      const id = getUserIdAsString();
      if (!id) {
        setOrdersLoading(false);
        return;
      }

      try {
        setOrdersLoading(true);
        const response = await fetch(`http://127.0.0.1:8001/orders/fromid/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const ordersData = await response.json();
        console.log('Orders data:', ordersData);
        console.log('Orders data type:', typeof ordersData);
        console.log('Is array:', Array.isArray(ordersData));
        
        // Проверяем, является ли ответ массивом
        const ordersArray = Array.isArray(ordersData) ? ordersData : (ordersData.orders || ordersData.data || []);
        console.log('Orders array:', ordersArray);
        console.log('Orders array length:', ordersArray.length);
        
        setOrders(ordersArray);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching orders:', err);
        // Не показываем ошибку пользователю, просто оставляем пустой список
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#302E2F] p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-row gap-6">
            {/* Левая карточка - Профиль пользователя */}
            <div className="bg-[#3A3839] rounded-2xl p-8 flex flex-col items-center w-80 h-fit shrink-0">
              {/* Аватар */}
              <div className="w-32 h-32 rounded-full bg-gray-500 mb-6 overflow-hidden flex items-center justify-center border-4 border-gray-400">
                <svg
                  className="w-24 h-24 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              
              {/* Email */}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="text-white underline text-center text-base hover:text-blue-400 transition-colors break-all"
                >
                  {email}
                </a>
              )}
            </div>

            {/* Правая карточка - Детальная информация */}
            <div className="flex-1 bg-gray-200 rounded-2xl p-8">
              {/* Имя пользователя */}
              {username && (
                <h1 className="text-4xl font-bold text-gray-800 mb-6">
                  {username}
                </h1>
              )}

              {/* Контактная информация */}
              <div className="space-y-3 mb-8">
                <div>
                  <span className="text-gray-700 font-medium">E-mail </span>
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="text-gray-600 underline hover:text-blue-600 ml-2"
                    >
                      {email}
                    </a>
                  )}
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Номер </span>
                  <span className="text-gray-800 ml-2">{phone}</span>
                </div>
              </div>

              {/* Секция заказов */}
              <div className="bg-[#3A3839] rounded-xl p-6">
                <h2 className="text-white text-xl font-semibold mb-4">
                  Ваши заказы:
                </h2>
                
                <div className="space-y-3">
                  {ordersLoading ? (
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Загрузка заказов...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    orders.map((order) => {
                      console.log('Rendering order:', order);
                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-lg p-4 flex items-center justify-between"
                        >
                          <span className="text-gray-800 font-medium">
                            {order.auto_name || order.carName || order.car_model || order.name || `Заказ #${order.id}`}
                          </span>
                          <span className="text-gray-600">{order.status || "В обработке"}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-lg p-4 text-center text-gray-500">
                      У вас пока нет заказов (загружено: {orders.length})
                    </div>
                  )}
                </div>

                {/* Кнопка корзины */}
                <div className="flex justify-end mt-6">
                  <button className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    <svg
                      className="w-7 h-7 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

