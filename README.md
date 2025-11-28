# Wolves Training Hub

Interface moderna em React + Vite para gerenciar treinos do time Wolves com backend Node/Express + SQLite. Agora o acesso ao painel exige autenticação (JWT) e todas as telas consomem apenas dados do banco.

## Estrutura

- `src/` – SPA (login, dashboard, cadastro, edição, lista, presença, histórico e sorteio), Tailwind e React Router.
- `server/` – API REST Express/TypeScript com SQLite (better-sqlite3), autenticação JWT e seeds opcionais.

## Pré-requisitos

- Node.js 20+
- npm 10+

## Variáveis de ambiente

| Arquivo | Chaves |
|---------|--------|
| `.env` (raiz) | `VITE_API_URL=http://localhost:3333`, `VITE_AUTH_STORAGE_KEY=wolves-traininghub-auth` |
| `server/.env` | `PORT`, `APP_ORIGIN`, `SEED_ON_START`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |

> Dica: em modo local, basta copiar os arquivos `.env.example` correspondentes e ajustar conforme necessário.

## Como executar

### Backend
```bash
cd server
npm install
npm run dev            # http://localhost:3333
```
O banco é criado em `server/data/wolves.db`. Um usuário administrador é gerado automaticamente com as credenciais definidas no `.env`. Para popular jogadores fictícios, defina `SEED_ON_START=true` antes da primeira execução.

### Frontend
```bash
npm install
npm run dev            # http://localhost:5173
```
Após subir o backend, faça login com o administrador para acessar o painel. Todos os requests usam o token salvo no storage.

### Produção
```bash
# frontend
npm run build

# backend
cd server
npm run build
npm start
```

## Endpoints

| Método | Caminho | Descrição |
|--------|--------|-----------|
| POST | /api/auth/login | Retorna token JWT e dados do usuario |
| GET | /api/dashboard | Totais de jogadores e presenca do dia |
| GET | /api/players | Lista jogadores cadastrados |
| POST | /api/players | Cadastra jogador |
| GET/PUT/DELETE | /api/players/:id | Operacoes individuais |
| GET | /api/attendance?date=YYYY-MM-DD | Lista presenca e resumo |
| PUT | /api/attendance/:date | Salva presenca em lote |
| GET | /api/history?days=30 | Estatisticas historicas por jogador |
| GET | /api/team-draws | Historico recente de sorteios com seed |
| POST | /api/team-draws | Gera e registra um novo sorteio reproduzivel |
| GET | /health | Ping da API |

Todos os endpoints (exceto `/health` e `/api/auth/login`) exigem token JWT via `Authorization: Bearer <token>`.

- Login com validacao do backend, armazenamento seguro do token e protecao de rotas via RequireAuth.
- Logout em qualquer tela (botao "Sair" na sidebar) que limpa o token e redireciona para /login.
- Listagem, cadastro e edicao de jogadores com persistencia real.
- Registro de presencas por dia, historico agregando estatisticas e sorteio de times usando apenas os dados ativos do banco.
- Sorteio auditavel com seed persistida e historico consultavel.
- Exportacao de presencas em CSV (UTF-8) direto da tela de historico.
- Listagem, cadastro e edição de jogadores com persistência real.
- Registro de presenças por dia, histórico agregando estatísticas e sorteio de times usando apenas os dados ativos do banco.