// import { useState } from "react";
// import axios from "axios";

// export default function ChamadoForm() {
//   const [titulo, setTitulo] = useState("");
//   const [descricao, setDescricao] = useState("");
//   const [maquina, setMaquina] = useState("");
//   const [ip, setIp] = useState("");
//   const [prioridade, setPrioridade] = useState("normal");
//   const [loading, setLoading] = useState(false);
//   const [erro, setErro] = useState<string | null>(null);

//   const enviarChamado = async () => {
//     setErro(null);
//     if (!titulo || !descricao || !maquina || !ip) {
//       setErro("Preencha todos os campos.");
//       return;
//     }
//     setLoading(true);
//     try {
//       await axios.post("http://localhost:5000/api/chamados", {
//         titulo, descricao, maquina, ip, prioridade
//       });
//       alert("Chamado criado!");
//       setTitulo("");
//       setDescricao("");
//       setMaquina("");
//       setIp("");
//       setPrioridade("normal");
//     } catch (err) {
//       setErro("Erro ao criar chamado. Tente novamente.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-100 rounded-xl shadow-md">
//       <h2 className="text-xl font-bold mb-3">Abrir Chamado</h2>
//       {erro && <div className="text-red-500 mb-2">{erro}</div>}
//       <input className="border p-2 mb-2 w-full" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} />
//       <textarea className="border p-2 mb-2 w-full" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} />
//       <input className="border p-2 mb-2 w-full" placeholder="Máquina" value={maquina} onChange={e => setMaquina(e.target.value)} />
//       <input className="border p-2 mb-2 w-full" placeholder="IP" value={ip} onChange={e => setIp(e.target.value)} />
//       <select className="border p-2 mb-2 w-full" value={prioridade} onChange={e => setPrioridade(e.target.value)}>
//         <option value="normal">Normal</option>
//         <option value="preferencial">Preferencial</option>
//       </select>
//       <button
//         onClick={enviarChamado}
//         className="bg-blue-500 text-white px-4 py-2 rounded-lg"
//         disabled={loading}
//       >
//         {loading ? "Enviando..." : "Enviar"}
//       </button>
//     </div>
//   );
// }
