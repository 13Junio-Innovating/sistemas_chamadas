import { Router } from "express";
import Senha from "../models/Senha.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const ymd = (d) => new Date(d).toISOString().slice(0, 10);

// --------- PÚBLICO ---------

// POST /api/senhas/gerar  { tipo }
router.post("/gerar", async (req, res) => {
  try {
    const { tipo } = req.body;
    if (!["normal", "preferencial", "proprietario", "check-in", "check-out"].includes(tipo)) return res.status(400).json({ error: "tipo inválido" });

    const hoje = ymd(new Date());
    const ultima = await Senha.find({ tipo, hora_retirada: { $gte: new Date(`${hoje}T00:00:00.000Z`) } })
      .sort({ numero: -1 }).limit(1);

    const proximoNumero = ultima.length ? ultima[0].numero + 1 : 1;

    const senha = await Senha.create({
      numero: proximoNumero,
      tipo,
      status: "aguardando",
      hora_retirada: new Date()
    });

    res.status(201).json(senha);
  } catch (e) {
    res.status(500).json({ error: "Erro ao gerar senha" });
  }
});

// GET /api/senhas/estado  (para Painel e Admin)
router.get("/estado", async (_req, res) => {
  try {
    const hojeIni = new Date(); hojeIni.setHours(0,0,0,0);
    const filtroHoje = { hora_retirada: { $gte: hojeIni } };

    const aguardando_normal = await Senha.find({ ...filtroHoje, status: "aguardando", tipo: "normal" }).sort({ numero: 1 });
    const aguardando_preferencial = await Senha.find({ ...filtroHoje, status: "aguardando", tipo: "preferencial" }).sort({ numero: 1 });
    const aguardando_proprietario = await Senha.find({ ...filtroHoje, status: "aguardando", tipo: "proprietario" }).sort({ numero: 1 });
    const aguardando_checkin = await Senha.find({ ...filtroHoje, status: "aguardando", tipo: "check-in" }).sort({ numero: 1 });
    const aguardando_checkout = await Senha.find({ ...filtroHoje, status: "aguardando", tipo: "check-out" }).sort({ numero: 1 });
    const chamando = await Senha.find({ ...filtroHoje, status: "chamando" }).sort({ hora_chamada: -1 });

    res.json({ aguardando_normal, aguardando_preferencial, aguardando_proprietario, aguardando_checkin, aguardando_checkout, chamando });
  } catch (e) {
    res.status(500).json({ error: "Erro ao buscar estado" });
  }
});

// GET /api/senhas?hoje=true|false  (relatórios simples)
router.get("/", async (req, res) => {
  try {
    const { hoje } = req.query;
    let filtro = {};
    if (hoje === "true") {
      const inicio = new Date(); inicio.setHours(0,0,0,0);
      const fim = new Date(); fim.setHours(23,59,59,999);
      filtro.hora_retirada = { $gte: inicio, $lte: fim };
    }
    const senhas = await Senha.find(filtro).sort({ hora_retirada: -1 }).limit(2000);
    res.json(senhas);
  } catch (e) {
    res.status(500).json({ error: "Erro ao listar" });
  }
});

// GET /api/senhas/stats?period=hoje (estatísticas do dia)
router.get("/stats", async (req, res) => {
  try {
    const { period = "hoje" } = req.query;
    const inicio = new Date();
    const fim = new Date();
    if (period === "hoje") {
      inicio.setHours(0,0,0,0);
      fim.setHours(23,59,59,999);
    }
    const filtro = { hora_retirada: { $gte: inicio, $lte: fim } };
    const total = await Senha.countDocuments(filtro);
    const aguardando = await Senha.countDocuments({ ...filtro, status: "aguardando" });
    const chamando = await Senha.countDocuments({ ...filtro, status: "chamando" });
    const atendidas = await Senha.countDocuments({ ...filtro, status: "atendida" });
    const canceladas = await Senha.countDocuments({ ...filtro, status: "cancelada" });

    // tempo médio (min) entre retirada -> atendimento (apenas atendidas)
    const concluidas = await Senha.find({ ...filtro, status: "atendida", hora_atendimento: { $ne: null } })
      .select("hora_retirada hora_atendimento tipo");
    const tempos = concluidas.map(s => (s.hora_atendimento - s.hora_retirada) / 60000);
    const tempoMedio = tempos.length ? Math.round(tempos.reduce((a,b)=>a+b,0)/tempos.length) : 0;

    res.json({ total, aguardando, chamando, atendidas, canceladas, tempoMedio });
  } catch (e) {
    res.status(500).json({ error: "Erro ao calcular estatísticas" });
  }
});

// --------- PROTEGIDO (JWT) ---------

// POST /api/senhas/chamar-proxima  { guiche, atendente }
router.post("/chamar-proxima", requireAuth, async (req, res) => {
  try {
    const { guiche, atendente } = req.body;
    if (!guiche || !atendente) return res.status(400).json({ error: "guiche e atendente obrigatórios" });

    const hojeIni = new Date(); hojeIni.setHours(0,0,0,0);
    const filtroHoje = { hora_retirada: { $gte: hojeIni }, status: "aguardando" };

    // Ordem de prioridade: preferencial > proprietario > check-in > check-out > normal
    const preferencial = await Senha.findOne({ ...filtroHoje, tipo: "preferencial" }).sort({ numero: 1 });
    const proprietario = await Senha.findOne({ ...filtroHoje, tipo: "proprietario" }).sort({ numero: 1 });
    const checkin = await Senha.findOne({ ...filtroHoje, tipo: "check-in" }).sort({ numero: 1 });
    const checkout = await Senha.findOne({ ...filtroHoje, tipo: "check-out" }).sort({ numero: 1 });
    const normal = await Senha.findOne({ ...filtroHoje, tipo: "normal" }).sort({ numero: 1 });
    const proxima = preferencial || proprietario || checkin || checkout || normal;

    if (!proxima) return res.status(404).json({ error: "Sem senhas aguardando" });

    proxima.status = "chamando";
    proxima.guiche = guiche;
    proxima.atendente = atendente;
    proxima.hora_chamada = new Date();
    await proxima.save();

    res.json(proxima);
  } catch (e) {
    res.status(500).json({ error: "Erro ao chamar próxima" });
  }
});

// PATCH /api/senhas/:id/voltar
router.patch("/:id/voltar", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const s = await Senha.findByIdAndUpdate(id, {
      status: "aguardando",
      guiche: "",
      atendente: "",
      hora_chamada: null
    }, { new: true });
    res.json(s);
  } catch (e) {
    res.status(500).json({ error: "Erro ao voltar senha" });
  }
});

// PATCH /api/senhas/:id/finalizar
router.patch("/:id/finalizar", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const s = await Senha.findByIdAndUpdate(id, {
      status: "atendida",
      hora_atendimento: new Date()
    }, { new: true });
    res.json(s);
  } catch (e) {
    res.status(500).json({ error: "Erro ao finalizar" });
  }
});

// PATCH /api/senhas/:id/cancelar
router.patch("/:id/cancelar", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const s = await Senha.findByIdAndUpdate(id, { status: "cancelada" }, { new: true });
    res.json(s);
  } catch (e) {
    res.status(500).json({ error: "Erro ao cancelar" });
  }
});

export default router;
