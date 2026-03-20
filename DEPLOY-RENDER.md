# Deploy do backend no Render — passo a passo

Este guia explica como subir o **backend** (NestJS + Prisma + PostgreSQL) no [Render](https://render.com) de forma gratuita.

**Workspace do projeto:** Luizo-Workspace (no dashboard do Render, use este nome para identificar o workspace onde estão os serviços deste projeto).

---

## O que você vai precisar

- Conta no [Render](https://render.com) (login com GitHub).
- Repositório do projeto no GitHub já com o código (ex.: `luizdefreitas10/dashboard-cti-arpe`).

---

## Parte 1 — Criar o banco PostgreSQL no Render

1. Acesse **https://dashboard.render.com** e faça login.
2. Clique em **New +** → **PostgreSQL**.
3. Preencha:
   - **Name:** por exemplo `dashboard-cti-db`.
   - **Database:** pode deixar o padrão.
   - **User / Region:** deixe como está (free).
   - **Plan:** escolha **Free**.
4. Clique em **Create Database**.
5. Aguarde alguns minutos até o status ficar **Available**.
6. Na tela do banco, em **Connections**, copie a **Internal Database URL** (uso dentro do Render).  
   - Anote também a **External Database URL** se for conectar de fora do Render.
   - No nosso caso, como a API vai rodar no Render, use a **Internal Database URL** nas variáveis do Web Service.

Guarde essa URL; você vai usá-la como `DATABASE_URL` no serviço da API.

---

## Parte 2 — Criar o Web Service (API NestJS)

1. No dashboard do Render, clique em **New +** → **Web Service**.
2. **Connect a repository:**
   - Se ainda não conectou o GitHub, clique em **Connect GitHub** e autorize o Render.
   - Selecione o repositório do projeto (ex.: `dashboard-cti-arpe`).
   - Clique em **Connect**.

3. **Configurar o serviço:**

   | Campo | Valor |
   |------|--------|
   | **Name** | `dashboard-cti-api` (ou outro nome) |
   | **Region** | Escolha a mais próxima (ex.: Oregon) |
   | **Branch** | `main` |
   | **Root Directory** | `backend` ⚠️ **Importante:** o código do backend está na pasta `backend/` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && npx prisma generate && npm run build` |
   | **Start Command** | `npx prisma migrate deploy && npm run start:prod` |

4. **Plan:** escolha **Free**.

5. **Variáveis de ambiente (Environment Variables):**

   Clique em **Add Environment Variable** e adicione:

   | Key | Value | Observação |
   |-----|--------|-------------|
   | `DATABASE_URL` | *(cole a Internal Database URL do PostgreSQL que você criou)* | Obrigatório. No Render, pode usar “Connect” no banco e copiar a Internal URL. |
   | `CORS_ORIGIN` | `https://seu-app.vercel.app` | Substitua pelo domínio real do front na Vercel (ex.: `https://dashboard-cti-arpe.vercel.app`). Se tiver mais de um, use vírgula: `https://app1.vercel.app,https://app2.vercel.app`. |

   - Se o front ainda não estiver no ar, crie o Web Service mesmo assim e depois edite `CORS_ORIGIN` quando tiver a URL da Vercel.

6. Clique em **Create Web Service**.

7. O Render vai fazer o primeiro deploy (build + start). Acompanhe os **Logs**.
   - Se der erro em **prisma migrate deploy**, confira se o `DATABASE_URL` está correto e se o banco está **Available**.
   - Build costuma levar 2–5 minutos.

8. Quando o deploy terminar, a URL do backend será algo como:
   - `https://dashboard-cti-api.onrender.com`  
   Anote essa URL; você usará no frontend (Vercel) como `NEXT_PUBLIC_API_URL`.

---

## Parte 3 — Ajustes comuns

### Erro de build (Prisma / Node)

- Confirme que **Root Directory** está como `backend`.
- Build command exatamente:  
  `npm install && npx prisma generate && npm run build`

### Erro ao subir (migrate ou conexão)

- **Start command:**  
  `npx prisma migrate deploy && npm run start:prod`
- Confirme que `DATABASE_URL` é a **Internal** URL do PostgreSQL (recomendado quando API e DB estão no Render).
- No free tier o banco pode levar 1–2 min para “acordar”; se der timeout, tente de novo.

### CORS (front não consegue chamar a API)

- No Web Service, em **Environment**, defina `CORS_ORIGIN` com a URL exata do front (ex.: `https://dashboard-cti-arpe.vercel.app`), **sem barra no final**.
- Redeploy o Web Service após alterar variáveis.

### Cold start (primeira visita muito lenta — ~30s a 1 min)

No **plano Free**, o Web Service **hiberna** após ~**15 minutos** sem tráfego. A **primeira** requisição depois disso precisa **subir de novo** o container Node + Nest + Prisma — por isso dashboards, tabelas, Power BI e Soluções Digitais podem ficar **muito tempo** em loading na **primeira** pessoa que acessa depois do sono.

**O código do projeto já ajuda um pouco:**

- `GET /health` — endpoint leve (sem bater no banco), ideal para monitoramento.
- O **middleware** do Next.js dispara um ping a `/health` em paralelo ao carregar rotas do app (não elimina o cold start sozinho, mas inicia o “acordar” cedo).
- As **Server Actions** dos dashboards de Atividades e Bens chamam `pingApiHealth()` antes das consultas pesadas quando a página é renderizada no servidor.

**Para uso real com link público (recomendado):**

1. Cadastre um monitor **gratuito** (ex.: [UptimeRobot](https://uptimerobot.com), [Cron-Job.org](https://cron-job.org)) para fazer **HTTP GET** na URL da sua API a cada **10–14 minutos**, por exemplo:  
   `https://SEU-SERVICO.onrender.com/health`  
   Assim o serviço quase não hiberna e as telas respondem **rápido** para qualquer visitante.

2. Ou faça **upgrade** do Web Service no Render (plano pago) para **não hibernar**.

### Keep-alive via GitHub Actions (já no repositório)

Foi adicionado o workflow `.github/workflows/keep-api-awake.yml`, que faz **GET** na URL que você configurar **a cada 10 minutos**.

1. No GitHub: abra o repositório → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. **Name:** `RENDER_HEALTH_URL`  
3. **Secret:** a URL completa do health da sua API, por exemplo:  
   `https://SEU-SERVICO.onrender.com/health`
4. Salve. O próximo agendamento (ou um run manual) passará a pingar a API.

Para testar na hora: **Actions** → **Keep API awake (ping /health)** → **Run workflow**.

> O GitHub Actions é gratuito dentro dos limites da conta; o cron usa **UTC**.

---

## Parte 4 — Configurar o frontend na Vercel

1. No projeto do frontend na Vercel, vá em **Settings** → **Environment Variables**.
2. Crie:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://dashboard-cti-api.onrender.com` (troque pelo **nome real** do seu Web Service no Render).
3. Faça um novo deploy do front para carregar a variável.

Depois disso, o front em produção passará a usar a API hospedada no Render.

---

## Resumo dos comandos no Render

| Etapa | Comando |
|--------|--------|
| **Build** | `npm install && npx prisma generate && npm run build` |
| **Start** | `npx prisma migrate deploy && npm run start:prod` |

O `.gitignore` da raiz não lista `backend/dist/`, para o Render incluir `dist` no artefato; `backend/.gitignore` tem `dist/` para não versionar no Git.

## Resumo das variáveis

| Onde | Variável | Exemplo |
|------|----------|--------|
| **Render (Web Service)** | `DATABASE_URL` | Internal URL do PostgreSQL |
| **Render (Web Service)** | `CORS_ORIGIN` | `https://seu-app.vercel.app` |
| **Vercel (Frontend)** | `NEXT_PUBLIC_API_URL` | `https://dashboard-cti-api.onrender.com` |

---

## Seed (dados iniciais) — opcional

O **Start Command** só roda as migrações. Para popular o banco com dados iniciais (seed) uma vez em produção:

1. No Render, abra o **Shell** do Web Service (ou use “Run command” se disponível).
2. Rode:  
   `npx prisma db seed`  
   (ou o comando que você tiver no `package.json` para seed).

Se preferir rodar seed localmente apontando para o banco de produção, use a **External Database URL** no `.env` local, com cuidado para não sobrescrever dados reais.

---

Se algo falhar, confira os **Logs** do Web Service e do PostgreSQL no Render; a maioria dos erros aparece ali (build, migrate ou conexão).

---

## Renomear o workspace para Luizo-Workspace

Se o seu workspace no Render ainda tiver outro nome (ex.: "Luizinho") e você quiser deixá-lo como **Luizo-Workspace**:

1. Acesse **https://dashboard.render.com** e faça login.
2. No canto superior esquerdo, clique no **nome do workspace** (dropdown).
3. Clique em **Workspace Settings** (ou **Account Settings**).
4. Em **Workspace Name** (ou **Team Name**), altere para `Luizo-Workspace` e salve.

Assim o workspace fica alinhado ao nome usado neste projeto.
