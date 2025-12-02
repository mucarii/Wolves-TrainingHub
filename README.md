# Wolves Training Hub

SPA em React + Vite para gerenciar treinos do time Wolves com backend Node/Express + SQLite. Acesso ao painel via autenticacao JWT; todas as telas consomem dados reais do banco.

## Estrutura
- `src/` - SPA (login, dashboard, cadastro/edicao/lista de jogadores, presenca, historico e sorteio), Tailwind e React Router.
- `server/` - API REST Express/TypeScript com SQLite (better-sqlite3), autenticacao JWT e seeds opcionais.

## Pre-requisitos
- Node.js 20+
- npm 10+

## Variaveis de ambiente
| Arquivo | Chaves |
|---------|--------|
| `.env` (raiz) | `VITE_API_URL=http://localhost:3333`, `VITE_AUTH_STORAGE_KEY=wolves-traininghub-auth` |
| `server/.env` | `PORT`, `APP_ORIGIN`, `SEED_ON_START`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |

Copie os arquivos `.env.example` para ajustar valores locais. Nao inclua senhas ou tokens reais no versionamento.

## Como executar
### Backend
```bash
cd server
npm install
npm run dev            # http://localhost:3333
```
O banco e criado em `server/data/wolves.db`. O usuario administrador usa as credenciais definidas no `server/.env`. Para popular jogadores ficticios, defina `SEED_ON_START=true` antes de rodar.

### Frontend
```bash
npm install
npm run dev            # http://localhost:5173
```
Com o backend ativo, faca login com o administrador para acessar o painel. O token JWT e armazenado no storage e enviado em todos os requests.

### Producao
```bash
# frontend
npm run build

# backend
cd server
npm run build
npm start
```

## Endpoints
| Metodo | Caminho | Descricao |
|--------|---------|-----------|
| POST | /api/auth/login | Retorna token JWT e dados do usuario |
| GET | /api/dashboard | Totais de jogadores e presenca do dia |
| GET | /api/players | Lista jogadores cadastrados |
| POST | /api/players | Cadastra jogador |
| GET/PUT/DELETE | /api/players/:id | Operacoes individuais |
| GET | /api/attendance?date=YYYY-MM-DD | Lista presenca e resumo |
| PUT | /api/attendance/:date | Salva presenca em lote |
| GET | /api/history?days=30 | Estatisticas historicas por jogador |
| GET | /api/team-draws | Historico de sorteios com seed |
| POST | /api/team-draws | Gera e registra um novo sorteio reproduzivel |
| GET | /health | Ping da API |

Todos os endpoints (exceto `/health` e `/api/auth/login`) exigem header `Authorization: Bearer <token>`.

## Recursos principais
- Login com validacao no backend, armazenamento de token e protecao de rotas.
- Cadastro/edicao/listagem de jogadores com persistencia em SQLite.
- Registro de presencas por dia, historico com estatisticas e exportacao CSV.
- Sorteio auditavel de times com seed persistida e historico consultavel.
- Logout em qualquer tela (botao "Sair" na sidebar) que limpa o token e redireciona para `/login`.

## Desenvolvedores
- Murilo Luiz Calore Ritto
- Giovana Sena
- Lucas Gabriel
- Matheus Rubio
- Vinicius Silva
