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
O banco é criado em `server/data/wolves.db`. Um usuário administrador é gerado automaticamente com as credenciais definidas no `.env` (padrão `admin@wolves.com / wolves123`). Para popular jogadores fictícios, defina `SEED_ON_START=true` antes da primeira execução.

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
| POST | `/api/auth/login` | Retorna token JWT e dados do usuário |
| GET | `/api/dashboard` | Totais de jogadores e presença do dia |
| GET | `/api/players` | Lista jogadores cadastrados |
| POST | `/api/players` | Cadastra jogador |
| GET/PUT/DELETE | `/api/players/:id` | Operações individuais |
| GET | `/api/attendance?date=YYYY-MM-DD` | Lista presença e resumo |
| PUT | `/api/attendance/:date` | Salva presença em lote |
| GET | `/api/history?days=30` | Estatísticas históricas por jogador |
| GET | `/health` | Ping da API |

Todos os endpoints (exceto `/health` e `/api/auth/login`) exigem token JWT via `Authorization: Bearer <token>`.

## Fluxos implementados

- Login com validação do backend, armazenamento seguro do token e proteção de rotas via `RequireAuth`.
- Logout em qualquer tela (botão “Sair” na sidebar) que limpa o token e redireciona para `/login`.
- Listagem, cadastro e edição de jogadores com persistência real.
- Registro de presenças por dia, histórico agregando estatísticas e sorteio de times usando apenas os dados ativos do banco.

## Próximos passos sugeridos

1. Implementar cadastro/gestão de usuários e redefinição de senha.
2. Exigir token também para exportações/relatórios e adicionar refresh tokens.
3. Criar scripts utilitários (`npm run dev:full`) para subir front e back juntos.
4. Versionar migrações com ferramenta dedicada (ex.: `better-sqlite3-migrations`). 
