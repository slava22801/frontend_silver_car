import CarFormBasic from "~/components/AddAuto";
import ProtectedRoute from "~/components/ProtectedRoute";

export default function Admin() {
    return (
        <ProtectedRoute>
            <div>
                Admin
                <CarFormBasic/>
            </div>
        </ProtectedRoute>
    );
}