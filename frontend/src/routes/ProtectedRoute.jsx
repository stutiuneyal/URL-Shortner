import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export default function ProtectedRoute({ children }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="panel px-6 py-5 text-sm text-muted-foreground">
          Restoring your session...
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}