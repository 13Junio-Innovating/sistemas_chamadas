import axios from "axios";

// Cole aqui o token que você recebeu ao logar
const token = "1234";

async function testToken() {
  if (!token) {
    console.log("❌ Token não definido");
    return;
  }

  try {
    const res = await axios.get("http://localhost:5000/api/senhas/estado", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ Requisição autorizada!");
    console.log(res.data);
  } catch (err) {
    console.error("❌ Erro na requisição:", err.response?.status, err.response?.data);
  }
}

testToken();
