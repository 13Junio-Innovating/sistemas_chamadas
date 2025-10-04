import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import chamadoRoutes from "./routes/chamadoRoutes";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/suporte";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch(err => {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  });

app.use("/api/chamados", chamadoRoutes);

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
