# Dashboard CTI — Coordenadoria de Tecnologia da Informação

Sistema full stack de monitoramento e visualização de dados da CTI.

## Estrutura

```
dashboard-cti/
  backend/    → NestJS + Prisma + PostgreSQL
  frontend/   → Next.js 14 + Tailwind + Recharts
  PROJETO.md  → Documentação completa do projeto
```

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente
- npm

---

## 🚀 Backend

### 1. Subir o banco de dados com Docker

```bash
cd backend
docker compose up -d
```

Isso sobe um PostgreSQL 16 na porta `5433` com:
- usuário: `postgres`
- senha: `postgres`
- banco: `dashboard_cti`

> A porta `5432` já está em uso por outro projeto. O dashboard CTI usa `5433`.

Para parar: `docker compose down`  
Para apagar os dados também: `docker compose down -v`

### 2. Variáveis de ambiente

O arquivo `backend/.env` já está configurado corretamente para o Docker:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/dashboard_cti?schema=public"
PORT=3334
```

> As portas `5432` e `3333` já estão em uso por outro projeto. O dashboard CTI usa `5433` (PostgreSQL) e `3334` (API).

### 3. Instalar dependências, migrar e gerar o client

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Popular dados (seed)

As planilhas já estão em `backend/data/`. Execute:

```bash
npm run db:seed
```

Saída esperada:
```
🌱 Iniciando seed do Dashboard CTI...

📋 Importando atividades...
  atividades: 2948/2948
  ✅ 2948 atividades importadas
🖥️  Importando bens patrimoniais...
  ✅ 422 bens importados
  ✅ 407 softwares importados
  ✅ 25 ramais importados
  ✅ 13 celulares importados

🎉 Seed concluído com sucesso!
```

### 5. Iniciar o servidor

```bash
npm run start:dev
# Rodando em http://localhost:3333
```

---

## 🎨 Frontend

### 1. Configurar variáveis

Edite `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### 2. Instalar e iniciar

```bash
cd frontend
npm install
npm run dev
# Rodando em http://localhost:3000
```

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /atividades | Lista paginada de atividades |
| GET | /atividades/stats | KPIs e distribuições |
| GET | /bens | Lista paginada de bens |
| GET | /bens/stats | KPIs dos bens |
| GET | /bens/softwares | Lista de softwares |
| GET | /bens/ramais | Lista de ramais |
| GET | /bens/celulares | Lista de celulares |
| POST | /upload/atividades | Upload de planilha de atividades |
| POST | /upload/bens | Upload de planilha de bens |

---

## Páginas do Dashboard

| Rota | Descrição |
|------|-----------|
| /dashboard/atividades | Dashboard com 7 gráficos de atividades |
| /dashboard/bens | Dashboard com 5 gráficos de bens |
| /tabelas/atividades | Tabela filtrada de atividades + export CSV |
| /tabelas/bens | Tabela filtrada de bens + export CSV |
| /tabelas/softwares | Lista de softwares inventariados |
| /tabelas/ramais | Ramais telefônicos por setor |
| /importar | Upload de planilhas |
| /power-bi | Em breve |
