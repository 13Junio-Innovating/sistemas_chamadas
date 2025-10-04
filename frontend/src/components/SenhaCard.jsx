import React from "react";
import { RotateCcw, CheckCircle, XCircle } from "lucide-react";

export default function SenhaCard({ senha, onFinalizar, onVoltar, onCancelar, compact = false }) {
  const getPrefixoECor = (tipo) => {
    switch(tipo) {
      case "preferencial": return { prefixo: "P", bg: "bg-amber-50", border: "border-amber-200" };
      case "proprietario": return { prefixo: "PR", bg: "bg-purple-50", border: "border-purple-200" };
      case "check-in": return { prefixo: "CI", bg: "bg-green-50", border: "border-green-200" };
      case "check-out": return { prefixo: "CO", bg: "bg-red-50", border: "border-red-200" };
      default: return { prefixo: "N", bg: "bg-slate-50", border: "border-slate-200" };
    }
  };
  
  const { prefixo, bg, border } = getPrefixoECor(senha.tipo);
  const numeroFmt = `${prefixo}${String(senha.numero).padStart(3, "0")}`;
  const hora = (d) => d ? new Date(d).toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"}) : "-";

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-2 rounded border ${bg} ${border}`}>
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-slate-700 w-12 text-center">{numeroFmt}</div>
          <div className={`text-xs px-1.5 py-0.5 rounded ${senha.status==="chamando"?"bg-blue-100 text-blue-800":"bg-yellow-100 text-yellow-800"}`}>
            {senha.status === "chamando" ? "Chamando" : "Aguardando"}
          </div>
        </div>
        <div className="flex gap-1">
          {senha.status === "chamando" && (
            <>
              <button onClick={() => onFinalizar(senha._id)} className="px-1 py-0.5 rounded bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="w-3 h-3"/></button>
              <button onClick={() => onVoltar(senha._id)} className="px-1 py-0.5 rounded border"><RotateCcw className="w-3 h-3"/></button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${bg} ${border}`}>
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold text-slate-700 w-16 text-center">{numeroFmt}</div>
        <div className="text-sm text-slate-600">
          <div className={`inline-block px-2 py-0.5 rounded ${senha.status==="chamando"?"bg-blue-100 text-blue-800":"bg-yellow-100 text-yellow-800"}`}>
            {senha.status === "chamando" ? "Chamando" : "Aguardando"}
          </div>
          <div className="mt-1 text-slate-500">Retirada: {hora(senha.hora_retirada)}</div>
          {senha.status === "chamando" && <div className="font-medium text-slate-700">{senha.guiche} • {senha.atendente}</div>}
        </div>
      </div>
      <div className="flex gap-2">
        {senha.status === "chamando" && (
          <>
            <button onClick={() => onFinalizar(senha._id)} className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="w-4 h-4"/></button>
            <button onClick={() => onVoltar(senha._id)} className="px-2 py-1 rounded border"><RotateCcw className="w-4 h-4"/></button>
            <button onClick={() => onCancelar(senha._id)} className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white"><XCircle className="w-4 h-4"/></button>
          </>
        )}
      </div>
    </div>
  );
}
