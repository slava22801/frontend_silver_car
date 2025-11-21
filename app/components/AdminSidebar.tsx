type ActionType = "add" | "edit" | "delete" | "users" | "main" | "exit";

interface AdminSidebarProps {
  activeAction: ActionType;
  onActionChange: (action: ActionType) => void;
}

export default function AdminSidebar({ activeAction, onActionChange }: AdminSidebarProps) {

  const actions = [
    { id: "main" as ActionType, label: "Главное меню" },
    { id: "users" as ActionType, label: "Пользователи" },
    { id: "add" as ActionType, label: "Добавить" },
    { id: "edit" as ActionType, label: "Редактировать" },
    { id: "delete" as ActionType, label: "Удалить" },
  ];

  return (
    <div className="bg-[#302E2F] w-full md:w-64 min-h-auto md:min-h-screen p-4 md:p-6">
      <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">Действия</h1>
      <div className="flex flex-row md:flex-col flex-wrap md:flex-nowrap gap-2 md:space-y-2 md:space-x-0">
        {actions.map((action) => {
          const isActive = activeAction === action.id;

          return (
            <button
              key={action.id}
              onClick={() => onActionChange(action.id)}
              className={`flex-1 md:flex-none text-center md:text-left px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
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

