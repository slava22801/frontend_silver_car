import { useState } from "react";
import { useNavigate } from "react-router";

type ActionType = "add" | "edit" | "delete" | "users" | "main" | "exit";

interface AdminSidebarProps {
  activeAction: ActionType;
  onActionChange: (action: ActionType) => void;
}

export default function AdminSidebar({ activeAction, onActionChange }: AdminSidebarProps) {
  const navigate = useNavigate();

  const handleExit = () => {
    // Очистка токена и перенаправление
    localStorage.removeItem("token");
    navigate("/");
  };

  const actions = [
    { id: "main" as ActionType, label: "Главное меню" },
    { id: "users" as ActionType, label: "Пользователи" },
    { id: "add" as ActionType, label: "Добавить" },
    { id: "edit" as ActionType, label: "Редактировать" },
    { id: "delete" as ActionType, label: "Удалить" },
    { id: "exit" as ActionType, label: "Выход" },
  ];

  return (
    <div className="bg-[#302E2F] min-h-screen w-64 p-6">
      <h1 className="text-white text-2xl font-bold mb-6">Действия</h1>
      <div className="flex flex-col space-y-2">
        {actions.map((action) => {
          const isActive = activeAction === action.id;
          
          if (action.id === "exit") {
            return (
              <button
                key={action.id}
                onClick={handleExit}
                className="w-full text-left px-4 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors"
              >
                {action.label}
              </button>
            );
          }

          return (
            <button
              key={action.id}
              onClick={() => onActionChange(action.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500 text-gray-800 shadow-inner"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

