import mongoose, { Schema, Document } from "mongoose";

export interface IChamado extends Document {
  titulo: string;
  descricao: string;
  prioridade: "normal" | "preferencial";
  maquina: string;
  ip: string;
  status: "aberto" | "em andamento" | "resolvido";
  criadoEm: Date;
}

const ChamadoSchema: Schema = new Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  prioridade: { type: String, enum: ["normal", "preferencial"], default: "normal" },
  maquina: { type: String, required: true },
  ip: { type: String, required: true },
  status: { type: String, enum: ["aberto", "em andamento", "resolvido"], default: "aberto" },
  criadoEm: { type: Date, default: Date.now }
});

export default mongoose.model<IChamado>("Chamado", ChamadoSchema);
// back/src/models/Chamado.ts