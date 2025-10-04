import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Monitor, Settings, FileText, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const isAdmin = location.pathname.includes("admin") || location.pathname.includes("relatorios");

  const doLogout = () => { logout(); nav("/login"); };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9ede071ef_costao_logo.jpeg" alt="Logo" className="w-10 h-10 rounded-lg" />
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Resort Costão do Santinho</h1>
                  <p className="text-sm text-slate-500">Sistema de Chamadas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/" className="px-4 py-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Home className="w-5 h-5"/></Link>
                <Link to="/painel" className="px-4 py-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Monitor className="w-5 h-5"/></Link>
                <Link to="/admin" className={`px-4 py-2 rounded-lg ${location.pathname.includes("admin")? "bg-blue-100 text-blue-700":"text-slate-600 hover:text-blue-600 hover:bg-blue-50"}`}><Settings className="w-5 h-5"/></Link>
                <Link to="/relatorios" className={`px-4 py-2 rounded-lg ${location.pathname.includes("relatorios")? "bg-blue-100 text-blue-700":"text-slate-600 hover:text-blue-600 hover:bg-blue-50"}`}><FileText className="w-5 h-5"/></Link>
                {user && (
                  <button onClick={doLogout} className="px-4 py-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut className="w-5 h-5"/> Sair
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
        {children}
      </div>
    );
  }

  return <div className="min-h-screen">{children}</div>;
}
