import { Router } from "express";

const router = Router();

// Com Supabase Auth, o login é feito no frontend usando supabase-js.
// Mantemos uma rota de verificação opcional que retorna dados do usuário a partir do token do Supabase já enviado via Authorization.
router.get("/me", (req, res) => {
  const u = req.user; // preenchido pelo middleware requireAuth
  if (!u) return res.status(401).json({ error: "Não autenticado" });
  res.json({ user: u });
});

export default router;
