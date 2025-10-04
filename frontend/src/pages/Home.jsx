import React, { useState } from "react";
import { api } from "../services/api";
import { CheckCircle, Printer, Star, User, Home as HomeIcon, LogIn, LogOut } from "lucide-react";

export default function Home() {
  const [novaSenha, setNovaSenha] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function gerarSenha(tipo) {
    console.log("🔹 Gerando senha do tipo:", tipo);
    setIsGenerating(true);
    try {
      console.log("🔹 Fazendo requisição para:", "/senhas/gerar");
      const { data } = await api.post("/senhas/gerar", { tipo });
      console.log("✅ Senha gerada com sucesso:", data);
      setNovaSenha(data);
    } catch (e) {
      console.error("❌ Erro ao gerar senha:", e);
      console.error("❌ Resposta do erro:", e.response?.data);
      alert(`Erro ao gerar senha: ${e.response?.data?.error || e.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  const imprimirSenha = () => {
    if (!novaSenha) return;
    
    const getPrefixoETipo = (tipo) => {
      switch(tipo) {
        case "preferencial": return { prefixo: "P", nome: "Atendimento Preferencial" };
        case "proprietario": return { prefixo: "PR", nome: "Proprietário" };
        case "check-in": return { prefixo: "CI", nome: "Check-in" };
        case "check-out": return { prefixo: "CO", nome: "Check-out" };
        default: return { prefixo: "N", nome: "Atendimento Normal" };
      }
    };
    
    const { prefixo, nome } = getPrefixoETipo(novaSenha.tipo);
    const numero = `${prefixo}${String(novaSenha.numero).padStart(3,"0")}`;
    const w = window.open("", "_blank");
    
    if (!w || !w.document) {
      alert("Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desabilitado.");
      return;
    }
    
    w.document.write(`
      <html><head><title>${numero}</title>
      <style>
        body{font-family:Arial; padding:20px; text-align:center}
        .ticket{border:2px dashed #0EA5E9; padding:30px; width:300px; margin:20px auto; background:#F8FAFC}
        .numero{font-size:48px; font-weight:bold; color:#0EA5E9; margin:20px 0}
      </style></head><body>
      <div class="ticket">
        <div>Resort Costão do Santinho</div>
        <div>${nome}</div>
        <div class="numero">${numero}</div>
        <div>Aguarde ser chamado</div>
      </div></body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5fc77023e_costao-do-santinho-florianopolis-capa.jpg')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          {!novaSenha ? (
            <>
              <div className="mb-12">
                <div className="flex justify-center mb-6">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9ede071ef_costao_logo.jpeg" alt="Logo" className="w-24 h-24"/>
                </div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2">Bem-vindo ao</h1>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Costão do Santinho</div>
                <p className="text-lg text-slate-600 mt-3">Selecione o tipo de atendimento para retirar sua senha</p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button onClick={() => gerarSenha("normal")} disabled={isGenerating}
                          className="w-full h-20 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl shadow-lg flex flex-col items-center justify-center gap-1">
                    <User className="w-6 h-6"/> Senha Normal
                  </button>
                  <button onClick={() => gerarSenha("preferencial")} disabled={isGenerating}
                          className="w-full h-20 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg flex flex-col items-center justify-center gap-1">
                    <Star className="w-6 h-6"/> Senha Preferencial
                  </button>
                  <button onClick={() => gerarSenha("proprietario")} disabled={isGenerating}
                          className="w-full h-20 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-xl shadow-lg flex flex-col items-center justify-center gap-1">
                    <HomeIcon className="w-6 h-6"/> Proprietário
                  </button>
                  <button onClick={() => gerarSenha("check-in")} disabled={isGenerating}
                          className="w-full h-20 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-xl shadow-lg flex flex-col items-center justify-center gap-1">
                    <LogIn className="w-6 h-6"/> Check-in
                  </button>
                  <button onClick={() => gerarSenha("check-out")} disabled={isGenerating}
                          className="w-full h-20 text-lg font-semibold bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-xl shadow-lg flex flex-col items-center justify-center gap-1">
                    <LogOut className="w-6 h-6"/> Check-out
                  </button>
                </div>
                {isGenerating && <div className="mt-6 text-slate-600 flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"/>
                  Gerando sua senha...
                </div>}
              </div>
            </>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600"/>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                {(() => {
                  const tipos = {
                    "preferencial": "Sua senha Preferencial é:",
                    "proprietario": "Sua senha de Proprietário é:",
                    "check-in": "Sua senha de Check-in é:",
                    "check-out": "Sua senha de Check-out é:",
                    "normal": "Sua senha é:"
                  };
                  return tipos[novaSenha.tipo] || "Sua senha é:";
                })()}
              </h2>
              <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-6">
                {(() => {
                  const prefixos = {
                    "preferencial": "P",
                    "proprietario": "PR",
                    "check-in": "CI",
                    "check-out": "CO",
                    "normal": "N"
                  };
                  const prefixo = prefixos[novaSenha.tipo] || "N";
                  return `${prefixo}${String(novaSenha.numero).padStart(3,"0")}`;
                })()}
              </div>
              <p className="text-xl text-slate-600 mb-8">Aguarde ser chamado no painel</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={imprimirSenha} className="h-12 px-8 border rounded-lg flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Printer className="w-5 h-5"/> Imprimir
                </button>
                <button onClick={() => setNovaSenha(null)} className="h-12 px-8 rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">Voltar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
