import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../services/api";

export default function Relatorios(){
  const [senhas, setSenhas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [periodoHoje, setPeriodoHoje] = useState(true);

  async function carregar() {
    setLoading(true);
    try {
      const { data } = await api.get(`/senhas${periodoHoje ? "?hoje=true" : ""}`);
      setSenhas(data);
    } catch {
      alert("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { carregar(); }, [periodoHoje]);

  const numero = (s) => (s.tipo==="preferencial"?"P":"N")+String(s.numero).padStart(3,"0");
  const fmt = (d) => d ? new Date(d).toLocaleString("pt-BR") : "";

  function exportarCSV() {
    if (!senhas.length) return;
    const sep = ";"; // Excel (pt-BR) geralmente usa ponto e vírgula
    const header = `sep=${sep}\r\nNumero;Tipo;Status;Retirada;Chamada;Atendimento;Guiche;Atendente`;
    const rows = senhas.map(s => {
      const numeroText = `="${numero(s)}"`; // força texto no Excel preservando zeros
      const cols = [
        numeroText,
        s.tipo,
        s.status,
        fmt(s.hora_retirada),
        fmt(s.hora_chamada),
        fmt(s.hora_atendimento),
        s.guiche || "",
        s.atendente || ""
      ];
      return cols.map(v => `"${String(v).replace(/"/g,'""')}"`).join(sep);
    });
    const csv = [header, ...rows].join("\r\n");
    // Adiciona BOM para acentuação correta no Excel
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `relatorio-${periodoHoje?"hoje":"todos"}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm">Período:</label>
            <select className="border rounded p-2" value={periodoHoje ? "hoje" : "todos"} onChange={e=>setPeriodoHoje(e.target.value==="hoje")}>
              <option value="hoje">Hoje</option>
              <option value="todos">Todos (limite 2000)</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={carregar} disabled={loading} className="h-10 px-4 rounded border">{loading?"Atualizando...":"Atualizar"}</button>
            <button onClick={exportarCSV} disabled={!senhas.length} className="h-10 px-4 rounded bg-blue-600 text-white hover:bg-blue-700">Exportar CSV</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-slate-600 mb-3">Registros: <b>{senhas.length}</b></div>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {senhas.map((s) => (
              <div key={s._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold text-slate-700">
                    {numero(s)}
                  </div>
                  <div className="text-sm">
                    <span className={`inline-block px-2 py-0.5 rounded ${s.status==="aguardando"?"bg-yellow-100 text-yellow-800": s.status==="chamando"?"bg-blue-100 text-blue-800": s.status==="atendida"?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`}>{s.status}</span>
                    <span className="ml-2 px-2 py-0.5 rounded border">{s.tipo==="preferencial"?"Preferencial":"Normal"}</span>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <div>Retirada: {fmt(s.hora_retirada)}</div>
                  {s.hora_chamada && <div>Chamada: {fmt(s.hora_chamada)}</div>}
                  {s.hora_atendimento && <div>Atendida: {fmt(s.hora_atendimento)}</div>}
                  {(s.guiche || s.atendente) && <div>{s.guiche} • {s.atendente}</div>}
                </div>
              </div>
            ))}
            {!senhas.length && <div className="text-center text-slate-500 py-10">Sem dados para o período selecionado.</div>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
