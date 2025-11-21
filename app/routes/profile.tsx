import { useState, useEffect } from "react";
import ProtectedRoute from "~/components/ProtectedRoute";
import { getUsername, getUserEmail, getUserIdAsString } from "~/utils/auth";
import { API_URL } from "~/utils/config";

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
  
  // Состояния для смены пароля
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordChangeLoading, setPasswordChangeLoading] = useState<boolean>(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<string>("");
  const [passwordChangeError, setPasswordChangeError] = useState<boolean>(false);

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
        const response = await fetch(`${API_URL}/orders/fromid/${id}`);
        
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage("");
    setPasswordChangeError(false);

    // Валидация
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordChangeMessage("Все поля обязательны для заполнения");
      setPasswordChangeError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage("Новые пароли не совпадают");
      setPasswordChangeError(true);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordChangeMessage("Новый пароль должен содержать минимум 6 символов");
      setPasswordChangeError(true);
      return;
    }

    if (!email) {
      setPasswordChangeMessage("Email не найден в токене");
      setPasswordChangeError(true);
      return;
    }

    try {
      setPasswordChangeLoading(true);
      const response = await fetch(`${API_URL}/user/change_password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Ошибка при смене пароля" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setPasswordChangeMessage("Пароль успешно изменен");
      setPasswordChangeError(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ошибка при смене пароля";
      setPasswordChangeMessage(errorMessage);
      setPasswordChangeError(true);
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#302E2F] p-4 sm:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Левая карточка - Профиль пользователя */}
            <div className="bg-[#3A3839] rounded-2xl p-6 md:p-8 flex flex-col items-center w-full md:w-80 h-fit shrink-0">
              {/* Аватар */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-500 mb-4 md:mb-6 overflow-hidden flex items-center justify-center border-4 border-gray-400">
                <svg
                  className="w-16 h-16 md:w-24 md:h-24 text-gray-300"
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
                  className="text-white underline text-center text-sm md:text-base hover:text-blue-400 transition-colors break-all px-2"
                >
                  {email}
                </a>
              )}
            </div>

            {/* Правая карточка - Детальная информация */}
            <div className="flex-1 bg-gray-200 rounded-2xl p-4 md:p-8">
              {/* Имя пользователя */}
              {username && (
                <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
                  {username}
                </h1>
              )}

              {/* Контактная информация */}
              <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row">
                  <span className="text-gray-700 font-medium text-sm md:text-base">E-mail </span>
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="text-gray-600 underline hover:text-blue-600 sm:ml-2 break-all text-sm md:text-base"
                    >
                      {email}
                    </a>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="text-gray-700 font-medium text-sm md:text-base">Номер </span>
                  <span className="text-gray-800 sm:ml-2 text-sm md:text-base">{phone}</span>
                </div>
              </div>

              {/* Секция смены пароля */}
              <div className="bg-[#3A3839] rounded-xl p-4 md:p-6 mb-6 md:mb-8">
                <h2 className="text-white text-lg md:text-xl font-semibold mb-3 md:mb-4">
                  Смена пароля:
                </h2>
                
                <form onSubmit={handlePasswordChange} className="space-y-3 md:space-y-4">
                  <div>
                    <label htmlFor="oldPassword" className="block text-white text-sm md:text-base mb-1 md:mb-2">
                      Старый пароль
                    </label>
                    <input
                      type="password"
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base"
                      placeholder="Введите старый пароль"
                      disabled={passwordChangeLoading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-white text-sm md:text-base mb-1 md:mb-2">
                      Новый пароль
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base"
                      placeholder="Введите новый пароль"
                      disabled={passwordChangeLoading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-white text-sm md:text-base mb-1 md:mb-2">
                      Подтвердите новый пароль
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base"
                      placeholder="Повторите новый пароль"
                      disabled={passwordChangeLoading}
                    />
                  </div>
                  
                  {passwordChangeMessage && (
                    <div
                      className={`p-2 md:p-3 rounded-lg text-sm md:text-base ${
                        passwordChangeError
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {passwordChangeMessage}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={passwordChangeLoading}
                    className="w-full bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    {passwordChangeLoading ? "Смена пароля..." : "Сменить пароль"}
                  </button>
                </form>
              </div>

              {/* Секция заказов */}
              <div className="bg-[#3A3839] rounded-xl p-4 md:p-6">
                <h2 className="text-white text-lg md:text-xl font-semibold mb-3 md:mb-4">
                  Ваши заказы:
                </h2>
                
                <div className="space-y-2 md:space-y-3">
                  {ordersLoading ? (
                    <div className="bg-white rounded-lg p-3 md:p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto mb-2"></div>
                      <p className="text-gray-500 text-xs md:text-sm">Загрузка заказов...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    orders.map((order) => {
                      console.log('Rendering order:', order);
                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-lg p-3 md:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <span className="text-gray-800 font-medium text-sm md:text-base break-words">
                            {order.auto_name || order.carName || order.car_model || order.name || `Заказ #${order.id}`}
                          </span>
                          <span className="text-gray-600 text-sm md:text-base">{order.status || "В обработке"}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-lg p-3 md:p-4 text-center text-gray-500 text-sm md:text-base">
                      У вас пока нет заказов (загружено: {orders.length})
                    </div>
                  )}
                </div>

                {/* Кнопка корзины */}
                <div className="flex justify-end mt-4 md:mt-6">
                  <button className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    <svg
                      className="w-6 h-6 md:w-7 md:h-7 text-gray-700"
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

