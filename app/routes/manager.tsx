import { useEffect, useState } from "react";
import ProtectedRoute from "~/components/ProtectedRoute";
import { getAuthToken, getTokenType } from "~/utils/auth";
import { API_URL } from "~/utils/config";

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
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/orders`);
        
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
      setEditingStatusId(null);
      setNewStatus("");
    } else {
      setSelectedOrderId(orderId);
    }
  };

  const handleEditStatus = (orderId: number, currentStatus?: string) => {
    setEditingStatusId(orderId);
    setNewStatus(currentStatus || "");
  };

  const handleCancelEditStatus = () => {
    setEditingStatusId(null);
    setNewStatus("");
  };

  const handleUpdateStatus = async (orderId: number) => {
    if (!newStatus.trim()) {
      alert("Статус не может быть пустым");
      return;
    }

    try {
      setUpdatingStatusId(orderId);

      const accessToken = getAuthToken();
      const tokenType = getTokenType();

      if (!accessToken) {
        alert("Ошибка: не удалось получить токен авторизации. Пожалуйста, войдите в систему.");
        setUpdatingStatusId(null);
        return;
      }

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${tokenType} ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus.trim() }),
      });

      let responseData: any = null;
      const contentType = response.headers.get("content-type");

      try {
        if (contentType && contentType.includes("application/json")) {
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
          "Ошибка при обновлении статуса";
        throw new Error(errorMessage);
      }

      const successMessage = responseData?.message || "Статус успешно обновлен!";
      alert(successMessage);

      // Обновляем список заказов
      const ordersResponse = await fetch(`${API_URL}/orders`);
      if (ordersResponse.ok) {
        const updatedOrders = await ordersResponse.json();
        setOrders(updatedOrders);
      }

      setEditingStatusId(null);
      setNewStatus("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка при обновлении статуса";
      alert(`Ошибка: ${errorMessage}`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    const confirmed = window.confirm(`Вы уверены, что хотите удалить заказ #${orderId}?`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingOrderId(orderId);

      const accessToken = getAuthToken();
      const tokenType = getTokenType();

      if (!accessToken) {
        alert("Ошибка: не удалось получить токен авторизации. Пожалуйста, войдите в систему.");
        setDeletingOrderId(null);
        return;
      }

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `${tokenType} ${accessToken}`,
        },
      });

      let responseData: any = null;
      const contentType = response.headers.get("content-type");

      try {
        if (contentType && contentType.includes("application/json")) {
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
          "Ошибка при удалении заказа";
        throw new Error(errorMessage);
      }

      const successMessage = responseData?.message || "Заказ успешно удален!";
      alert(successMessage);

      // Обновляем список заказов
      const ordersResponse = await fetch(`${API_URL}/orders`);
      if (ordersResponse.ok) {
        const updatedOrders = await ordersResponse.json();
        setOrders(updatedOrders);
      }

      // Если удаленный заказ был открыт, закрываем его
      if (selectedOrderId === orderId) {
        setSelectedOrderId(null);
        setEditingStatusId(null);
        setNewStatus("");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка при удалении заказа";
      alert(`Ошибка: ${errorMessage}`);
    } finally {
      setDeletingOrderId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#302E2F] p-4 sm:p-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">Список заказов</h1>

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
                        className="bg-[#3A3839] rounded-lg p-4 sm:p-6 border border-gray-600 hover:border-yellow-400 transition-colors cursor-pointer"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                              <h3 className="text-lg sm:text-xl font-bold text-white">
                                Заказ #{order.id}
                              </h3>
                              {order.status && (
                                <span className="px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold bg-yellow-400 text-gray-900">
                                  {order.status}
                                </span>
                              )}
                            </div>
                            {order.name && (
                              <p className="text-white mb-2 text-sm sm:text-base">
                                <span className="text-gray-400">Имя:</span> {order.name}
                              </p>
                            )}
                            {order.phone && (
                              <p className="text-white mb-2 text-sm sm:text-base">
                                <span className="text-gray-400">Телефон:</span> {order.phone}
                              </p>
                            )}
                            {order.car_model && (
                              <p className="text-white mb-2 text-sm sm:text-base">
                                <span className="text-gray-400">Модель:</span> {order.car_model}
                              </p>
                            )}
                          </div>
                          <div>
                            {order.status && (
                              <p className="text-white mb-2 text-sm sm:text-base">
                                <span className="text-gray-400">Статус:</span>{' '}
                                <span className="text-yellow-400 font-semibold">{order.status}</span>
                              </p>
                            )}
                            {order.created_at && (
                              <p className="text-white mb-2 text-sm sm:text-base">
                                <span className="text-gray-400">Дата:</span> {new Date(order.created_at).toLocaleString('ru-RU')}
                              </p>
                            )}
                            {order.comment && (
                              <div className="mt-3 sm:mt-4">
                                <p className="text-gray-400 mb-1 text-xs sm:text-sm">Комментарий:</p>
                                <p className="text-white text-sm sm:text-base">{order.comment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Дополнительные параметры заказа */}
                      {selectedOrderId === order.id && (
                        <div className="bg-[#2a2829] rounded-lg p-3 sm:p-4 mt-2 border border-gray-700">
                          <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Дополнительные параметры:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
                            {order.from_id !== undefined && (
                              <div>
                                <p className="text-gray-400 text-xs sm:text-sm mb-1">От кого:</p>
                                <p className="text-white font-medium text-sm sm:text-base">{order.from_id}</p>
                              </div>
                            )}
                            {order.auto_name && (
                              <div>
                                <p className="text-gray-400 text-xs sm:text-sm mb-1">Название авто:</p>
                                <p className="text-white font-medium text-sm sm:text-base">{order.auto_name}</p>
                              </div>
                            )}
                            {order.number && (
                              <div>
                                <p className="text-gray-400 text-xs sm:text-sm mb-1">Номер:</p>
                                <p className="text-white font-medium text-sm sm:text-base">{order.number}</p>
                              </div>
                            )}
                            {order.name && (
                              <div>
                                <p className="text-gray-400 text-xs sm:text-sm mb-1">Имя:</p>
                                <p className="text-white font-medium text-sm sm:text-base">{order.name}</p>
                              </div>
                            )}
                            {order.comment && (
                              <div className="sm:col-span-2 md:col-span-3">
                                <p className="text-gray-400 text-xs sm:text-sm mb-1">Комментарий:</p>
                                <p className="text-white font-medium text-sm sm:text-base break-words">{order.comment}</p>
                              </div>
                            )}
                          </div>

                          {/* Редактирование статуса */}
                          {editingStatusId === order.id ? (
                            <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg border border-gray-600">
                              <label className="block text-white text-sm sm:text-base font-medium mb-2">
                                Новый статус:
                              </label>
                              <input
                                type="text"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                placeholder="Введите новый статус"
                                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none mb-2"
                                disabled={updatingStatusId === order.id}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateStatus(order.id)}
                                  disabled={updatingStatusId === order.id}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                  {updatingStatusId === order.id ? "Сохранение..." : "Сохранить"}
                                </button>
                                <button
                                  onClick={handleCancelEditStatus}
                                  disabled={updatingStatusId === order.id}
                                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                  Отмена
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2 mb-4">
                              <button
                                onClick={() => handleEditStatus(order.id, order.status)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
                              >
                                Редактировать статус
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                disabled={deletingOrderId === order.id}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                              >
                                {deletingOrderId === order.id ? "Удаление..." : "Удалить заказ"}
                              </button>
                            </div>
                          )}
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