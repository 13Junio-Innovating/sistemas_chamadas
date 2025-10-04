import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Private({ children }) {
  const { user, loading } = useAuth();

  // Enquanto o auth estiver carregando, mostra loading
  if (loading) return <div>Carregando...</div>;

  // Se não estiver logado, redireciona para login
  return user ? children : <Navigate to="/login" replace />;
}
