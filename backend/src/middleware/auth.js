import { createRemoteJWKSet, jwtVerify } from "jose";

let JWKS;
function getJWKS() {
  if (!JWKS) {
    const base = process.env.SUPABASE_URL;
    if (!base) {
      throw new Error("SUPABASE_URL não configurada no ambiente");
    }
    JWKS = createRemoteJWKSet(new URL(`${base}/auth/v1/.well-known/jwks.json`));
  }
  return JWKS;
}

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token ausente" });
  }

  // Espera "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ error: "Token malformatado" });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: "Token malformatado" });
  }

  try {
    const base = process.env.SUPABASE_URL;
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: `${base}/auth/v1`,
    });
    req.user = { id: payload.sub, email: payload.email, name: payload.user_metadata?.name || payload.email };
    return next();
  } catch (err) {
    console.error("Erro verificação Supabase JWT:", err?.message);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
