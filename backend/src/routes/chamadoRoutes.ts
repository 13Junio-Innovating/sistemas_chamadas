import { Router } from "express";
import { criarChamado, listarChamados } from "../controllers/chamadoController";

const router = Router();

router.post("/", criarChamado);
router.get("/", listarChamados);

export default router;
