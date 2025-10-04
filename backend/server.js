import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import senhasRouter from "./src/routes/senhas.js";
import authRouter from "./src/routes/auth.js";
import { requireAuth } from "./src/middleware/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { PORT = 5000, MONGO_URI } = process.env;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("Erro MongoDB:", err));

app.get("/", (_, res) => res.send("API Sistema de Chamadas OK"));
app.use("/api/auth", requireAuth, authRouter);
app.use("/api/senhas", senhasRouter);

app.listen(PORT, () => console.log(`🚀 Backend rodando em http://localhost:${PORT}`));
