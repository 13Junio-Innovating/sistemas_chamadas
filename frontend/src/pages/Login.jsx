import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginRapido = async (usuario, senha) => {
    setEmail(usuario);
    setPassword(senha);
    setLoading(true);
    try {
      await login(usuario, senha);
      nav("/admin");
    } catch (e) {
      alert(e?.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      nav("/admin");
    } catch (e) {
      alert(e?.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white p-8 rounded-xl border w-[400px] shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Sistema de Chamadas</h1>
        
        {/* Login Manual */}
        <form onSubmit={onSubmit} className="mb-6">
          <label className="text-sm font-medium">E-mail</label>
          <input 
            className="border rounded w-full p-2 mb-4" 
            value={email} 
            onChange={e=>setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
          />
          <label className="text-sm font-medium">Senha</label>
          <input 
            className="border rounded w-full p-2 mb-4" 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)}
            placeholder="Digite sua senha"
          />
          <button 
            disabled={loading} 
            className="w-full h-10 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {loading?"Entrando...":"Entrar"}
          </button>
        </form>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4 text-center">Acesso Rápido</h2>
          
          {/* Admin */}
          <button 
            onClick={() => loginRapido("admin@costao.com", "admin@123")}
            disabled={loading}
            className="w-full mb-2 p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded font-medium"
          >
            🔧 Administrador
          </button>

          {/* Guichês */}
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <button
                key={num}
                onClick={() => loginRapido(`guiche${num}@costao.com`, "asd123")}
                disabled={loading}
                className="p-2 bg-green-100 hover:bg-green-200 text-green-800 rounded font-medium text-sm"
              >
                🏢 Guichê {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
