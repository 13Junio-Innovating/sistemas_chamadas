import mongoose from "mongoose";

const SenhaSchema = new mongoose.Schema({
  numero: { type: Number, required: true },                // sequencial por tipo
  tipo: { type: String, enum: ["normal", "preferencial", "proprietario", "check-in", "check-out"], required: true },
  status: { type: String, enum: ["aguardando", "chamando", "atendida", "cancelada"], default: "aguardando" },
  guiche: { type: String, default: "" },
  atendente: { type: String, default: "" },
  hora_retirada: { type: Date, required: true, default: Date.now },
  hora_chamada: { type: Date, default: null },
  hora_atendimento: { type: Date, default: null }
}, { timestamps: true });

SenhaSchema.index({ tipo: 1, numero: -1 });

export default mongoose.model("Senha", SenhaSchema);
