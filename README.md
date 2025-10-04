# Sistema de Chamadas

Aplicação completa (frontend + backend) para gestão de senhas/atendimentos com painel, administração e relatórios.

## Tecnologias
- Backend: Node.js, Express, MongoDB (Mongoose), JWT
- Frontend: React + Vite, React Router, Tailwind CSS, Axios

## Pré-requisitos
- Node.js 18+ instalado
- MongoDB em execução local (padrão: `mongodb://localhost:27017`)

## Estrutura
```
sistema_chamada/
├── backend/   # API Express + MongoDB
└── frontend/  # Aplicação React (Vite)
```

## Configuração do Backend
1. Crie o arquivo `.env` dentro de `backend/` (já existe no projeto). Configure as variáveis conforme seu ambiente:
   - `PORT=5001` (porta em que o backend vai rodar)
   - `MONGO_URI=mongodb://localhost:27017/sistema_chamadas` (ajuste se necessário)
   - `JWT_SECRET=<defina_um_segredo_forte>`

## Instalação
Em dois terminais (ou passo a passo):

- Backend
  ```bash
  cd backend
  npm install
  npm run seed   # opcional: cria usuários iniciais (admin e guichês)
  npm run dev    # inicia em http://localhost:5001
  ```

- Frontend
  ```bash
  cd frontend
  npm install
  npm run dev    # inicia em http://localhost:5173
  ```

## Acesso Rápido (Usuários de exemplo)
Após rodar `npm run seed` no backend:
- Administrador: `admin@costao.com` | senha: `admin@123`
- Guichês: `guiche1@costao.com` até `guiche10@costao.com` | senha: `asd123`

## Rotas da Aplicação (Frontend)
- `/` Home: emissão de senhas
- `/login` Login: acesso rápido para admin/guichê
- `/admin` Administração: controle de filas (protegida)
- `/painel` Painel: exibição das senhas chamadas
- `/relatorios` Relatórios: listagem das senhas (protegida)

## Integração Frontend ↔ Backend
- O frontend usa Axios com `baseURL` configurável via `VITE_API_URL` (arquivo `frontend/src/services/api.js`). Padrão local: `http://localhost:5001/api`.
- Endpoints principais do backend estão sob `/api/auth` e `/api/senhas`.

## Autenticação com Supabase (Plano B)
- Configure variáveis de ambiente do frontend:
  - `VITE_SUPABASE_URL` = `https://kfnajsywpkhfwalvudsf.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `<sua anon key do Supabase>`
- Configure variáveis do backend (arquivo `backend/.env`):
  - `SUPABASE_URL` = `https://kfnajsywpkhfwalvudsf.supabase.co`
- Fluxo de login passa a ser feito pelo Supabase (frontend). O backend valida o JWT via JWKS (`jose`).

## Comandos úteis
- Backend:
  - `npm run start` – inicia sem nodemon
  - `npm run seed` – popula usuários (admin e guichês)
- Frontend:
  - `npm run build` – build de produção
  - `npm run preview` – pré-visualização do build

## Dicas de Troubleshooting
- Erro de conexão com MongoDB: verifique se o serviço MongoDB está rodando e se o `MONGO_URI` está correto.
- CORS/porta incorreta: confirme se o backend está na porta `5001` e o frontend em `5173`.
- Token/401: o frontend envia o token automaticamente via interceptor do Axios; após expirar, faça login novamente.

## Observações
- Em produção, ajuste `baseURL` da API e variáveis de ambiente conforme o servidor/infraestrutura.