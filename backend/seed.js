import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import argon2 from "argon2";
import User from "./src/models/User.js";

const { MONGO_URI } = process.env;

async function seed() {
  await mongoose.connect(MONGO_URI);
  
  // Criar usuário admin
  const adminEmail = "admin@costao.com";
  const adminExists = await User.findOne({ email: adminEmail });
  if (adminExists) {
    console.log("Usuário admin já existe:", adminEmail);
  } else {
    const adminPasswordHash = await argon2.hash("admin@123", { type: argon2.argon2id });
    await User.create({ name: "Administrador", email: adminEmail, password_hash: adminPasswordHash, role: "admin" });
    console.log("✅ Admin criado:", adminEmail, "senha: admin@123");
  }

  // Criar usuários de guichê (guiche1, guiche2, etc.)
  const guiches = ["guiche1", "guiche2", "guiche3", "guiche4", "guiche5", "guiche6", "guiche7", "guiche8", "guiche9", "guiche10"];
  const senhaGuiche = "asd123";
  
  for (const guiche of guiches) {
    const email = `${guiche}@costao.com`;
    const exists = await User.findOne({ email });
    if (exists) {
      console.log(`Usuário ${guiche} já existe:`, email);
    } else {
      const passwordHash = await argon2.hash(senhaGuiche, { type: argon2.argon2id });
      await User.create({ 
        name: `Atendente ${guiche.toUpperCase()}`, 
        email, 
        password_hash: passwordHash, 
        role: "atendente",
        guiche: guiche
      });
      console.log(`✅ ${guiche} criado:`, email, "senha:", senhaGuiche);
    }
  }
  
  await mongoose.disconnect();
}
seed().catch((e) => { console.error(e); process.exit(1); });
