import { useState } from "react";
import CarFormBasic from "~/components/AddAuto";
import EditCar from "~/components/EditCar";
import DeleteCar from "~/components/DeleteCar";
import AdminSidebar from "~/components/AdminSidebar";
import AdminProtectedRoute from "~/components/AdminProtectedRoute";

type ActionType = "add" | "edit" | "delete" | "users" | "main" | "exit";

export default function Admin() {
    const [activeAction, setActiveAction] = useState<ActionType>("add");

    const renderContent = () => {
        switch (activeAction) {
            case "add":
                return <CarFormBasic />;
            case "edit":
                return <EditCar />;
            case "delete":
                return <DeleteCar />;
            case "users":
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4 text-white">Пользователи</h2>
                        <p className="text-white">Функция управления пользователями будет реализована позже</p>
                    </div>
                );
            case "main":
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4 text-white">Главное меню</h2>
                        <p className="text-white">Добро пожаловать в панель администратора</p>
                    </div>
                );
            default:
                return <CarFormBasic />;
        }
    };

    return (
        <AdminProtectedRoute>
            <div className="flex flex-col md:flex-row min-h-screen">
                <AdminSidebar activeAction={activeAction} onActionChange={setActiveAction} />
                <div className="flex-1 bg-[#302E2F] min-h-screen">
                    {renderContent()}
                </div>
            </div>
        </AdminProtectedRoute>
    );
}