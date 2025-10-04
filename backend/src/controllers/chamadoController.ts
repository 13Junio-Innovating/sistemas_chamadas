import { Request, Response } from "express";
import Chamado from "../models/Chamado";

export const criarChamado = async (req: Request, res: Response) => {
  try {
    const chamado = new Chamado(req.body);
    await chamado.save();
    res.status(201).json(chamado);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar chamado" });
  }
};

export const listarChamados = async (req: Request, res: Response) => {
  try {
    const chamados = await Chamado.find().sort({ criadoEm: -1 });
    res.json(chamados);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar chamados" });
  }
};
