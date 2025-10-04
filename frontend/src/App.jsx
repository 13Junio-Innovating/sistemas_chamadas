import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Painel from "./pages/Painel";
import Relatorios from "./pages/Relatorios";
import Login from "./pages/Login";
import { AuthProvider } from "./auth/AuthContext";
import Private from "./auth/Private";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Private><Admin /></Private>} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/relatorios" element={<Private><Relatorios /></Private>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
