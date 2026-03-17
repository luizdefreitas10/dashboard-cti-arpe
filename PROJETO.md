# PROMPT DE CRIAÇÃO — Dashboard CTI
## Coordenadoria de Tecnologia da Informação

---

## Contexto e Dados Reais

Os dados foram extraídos das planilhas oficiais da CTI e devem ser
carregados diretamente no banco de dados na inicialização do projeto
(seed/import). As planilhas são a fonte da verdade.

---

## FONTE 1 — Atividades CTI (`atividades_padronizadas.xlsx`)

### Sheet principal: `BASE_PADRONIZADA`
**2.948 registros | Período: março/2024 a março/2026**

| Coluna | Tipo | Valores/Exemplos |
|--------|------|-----------------|
| CATEGORIA DA ATIVIDADE | string enum | Suporte Técnico e Helpdesk (1803), Instalação e Configuração de Software/Hardware (609), Suporte Administrativo (172), Administração de Rede e Servidor (149), Administração de Usuários e Acessos (90), Suporte de Telemática (102), Desenvolvimento de Software (2) |
| NOME DA ATIVIDADE | string | Ativação Office, Teste de Rede, Instalação Webcam... |
| DIA DA SEMANA | string | Segunda (649), Quinta (613), Quarta (588), Terça (580), Sexta (503) |
| DATA | date | range de 2024-03-01 a 2026-03-04 |
| HORÁRIO | time | HH:mm:ss |
| RESPONSÁVEL POR REALIZAR | string | Guilherme (1170), Jonathas (916), João (107), Eryka (84), Luiz (49), Italo (45), Victor (25)... |
| SOLICITANTE | string | nome do solicitante |
| SETOR | string | Ouvidoria (287), RH (247), Financeiro (245), Energia/Gás (243), CTI (231), GAP (215), Presidência (186), COJUR (160), Tarifas (154), Transportes (146)... |
| PRIORIDADE | string enum | Alta (1315), Média (1298), Baixa (335) |
| ESTADO DE EVOLUÇÃO | string | Feito (100% dos registros) |
| OBSERVAÇÃO | string? | texto livre, nullable |

### Sheets auxiliares
- `MAPEAMENTO`: de-para entre nome original e nome padronizado (1.703 registros)
- `CATALOGO_ATIVIDADES`: catálogo com ID, nome padronizado e quantidade (156 atividades únicas)
  - Top: Outros/Não Categorizado (1094), Instalação Eset (91), Desinstalação Ndd (69), Instalação OCS Inventory (60), Instalação de Driver (56)...

---

## FONTE 2 — Monitoramento de Bens (`Monitoramento de Bens - CTI.xlsx`)

### Sheet: `Monitoramento_Bens`
**422 bens patrimoniais**

| Coluna | Tipo | Valores |
|--------|------|---------|
| TOMBAMENTO | string | "41201.000182.2016" (formato único) |
| TIPO DE HARDWARE | string enum | Monitor (205), Computador Desktop (121), Microcomputador (35), Notebook (24), Switch (11), Tablet (9), Câmera (7) |
| MODELO | string | HP (261), Lenovo (84), Daten (50), Apple (9) |
| USUÁRIO | string | nome do responsável pelo bem |
| SETOR | string | CTI (53), CTI - Sala do Servidor (50), Saneamento (32), Energia/Gás (31), Tarifas (29)... |
| FINALIDADE PRINCIPAL | string | Estação de Trabalho (94), "-" (199), null (123) |
| SISTEMA OPERACIONAL | string | Windows 10 Pro (119), Windows 11 (35), "-" (211) |
| CRITICIDADE | string | null/"-" dominante, "QUEIMOU" (2) |

### Sheet: `Ativos_Software`
**407 softwares no inventário**
- Colunas: NOME DO SOFTWARE, VERSÃO, FINALIDADE
- Exemplos: NDDPrint Agent, OCS Inventory NG Agent, Adobe Acrobat Reader, AnyDesk, Google Chrome

### Sheet: `Monitoramento_Telefones`
**25 setores | 63 ramais totais**
- Colunas: SETOR, DIGITAL (15 total), ANALÓGICO (48 total), TOTAL, DESCRIÇÃO
- Cada setor tem ramais listados com extensão e responsável

### Sheet: `Monitoramento_Celulares`
**13 celulares**
- Colunas: MODELO, SETOR, IMEI
- Modelos: Galaxy A12 (5), Galaxy A52s 5G (4), Motorola Moto E7 (2), Galaxy A54 (1)
- Setores: CTI (10), Presidência (1), Energia/Gás (1), Ouvidoria (1)

---

## Stack Tecnológica

### Backend
- **NestJS** com Clean Architecture + DDD
- **PostgreSQL** + **Prisma ORM**
- **JWT RS256** com guards globais
- **Multer** para upload de planilhas
- **xlsx** (npm) para parse de arquivos Excel
- **Zod** para validação de entradas (ZodValidationPipe)
- Use cases retornam `Either<DomainError, Output>`

### Frontend
- **Next.js 14+** com App Router (TypeScript)
- **Tailwind CSS** + design tokens em `globals.css`
- **Shadcn/ui** como biblioteca de componentes base
- **Recharts** para gráficos interativos
- **TanStack Table v8** para tabelas
- **Axios** com arquitetura em camadas (apiClient → services → actions)
- **React Context** + Server Actions
- **React Hook Form** + **Yup** para formulários
- **Lucide React** para ícones
- **react-hot-toast** para notificações

---

## Prisma Schema

```prisma
// Atividades
model Atividade {
  id          String    @id @default(cuid())
  categoria   String
  nome        String
  diaSemana   String?
  data        DateTime?
  horario     String?
  responsavel String?
  solicitante String?
  setor       String?
  prioridade  String?
  estado      String?
  observacao  String?
  createdAt   DateTime  @default(now())
}

// Bens Patrimoniais
model Bem {
  id                  String  @id @default(cuid())
  tombamento          String  @unique
  tipoHardware        String?
  modelo              String?
  usuario             String?
  setor               String?
  finalidadePrincipal String?
  sistemaOperacional  String?
  criticidade         String?
}

// Softwares
model Software {
  id         String  @id @default(cuid())
  nome       String
  versao     String?
  finalidade String?
}

// Ramais Telefônicos
model Ramal {
  id        String  @id @default(cuid())
  setor     String
  digital   Int     @default(0)
  analogico Int     @default(0)
  total     Int     @default(0)
  descricao String?
}

// Celulares
model Celular {
  id     String @id @default(cuid())
  modelo String
  setor  String
  imei   String @unique
}
```

---

## Páginas e Rotas

```
/                         → redirect para /dashboard/atividades
/dashboard/atividades     → Dashboard principal de atividades
/dashboard/bens           → Dashboard principal de bens
/tabelas/atividades       → Tabela completa de atividades + filtros
/tabelas/bens             → Tabela completa de bens + filtros
/tabelas/softwares        → Tabela de softwares inventariados
/tabelas/ramais           → Tabela de ramais por setor
/importar                 → Upload de novas planilhas
/power-bi                 → Placeholder (fase futura)
```

---

## Dashboard de Atividades — Visualizações

### KPI Cards (topo da página)

| Card | Valor | Detalhe |
|------|-------|---------|
| Total de Atividades | 2.948 | período completo |
| Atividades em 2025 | ~1.000 | filtro por ano |
| Responsável mais ativo | Guilherme (1.170) | destaque |
| Setor com mais demandas | Ouvidoria (287) | destaque |

### Gráfico 1 — Barras: Atividades por Mês
- Eixo X: mês/ano (mar/2024 → mar/2026)
- Eixo Y: quantidade
- Cor de destaque nos meses com maior volume (mai/2024: 300, jan/2025: 243)
- Recharts `<BarChart>` com tooltip customizado

### Gráfico 2 — Donut: Distribuição por Categoria
- 7 categorias com cores distintas
- Centro mostra total
- Suporte Técnico e Helpdesk domina (61%)
- Recharts `<PieChart>` com `<Cell>` por categoria

### Gráfico 3 — Barras Horizontais: Top 10 Setores
- Setores: Ouvidoria, RH, Financeiro, Energia/Gás, CTI...
- Ordenado por volume decrescente
- Recharts `<BarChart layout="vertical">`

### Gráfico 4 — Barras Agrupadas: Prioridade por Mês
- Cada mês: 3 barras (Alta, Média, Baixa)
- Cores: vermelho (Alta), amarelo (Média), verde (Baixa)
- Recharts `<BarChart>` com múltiplos `<Bar>`

### Gráfico 5 — Barras: Produtividade por Responsável
- Top 8 responsáveis: Guilherme (1170), Jonathas (916), João (107), Eryka (84)...
- Recharts `<BarChart>` horizontal

### Gráfico 6 — Área: Evolução Temporal
- Atividades acumuladas por mês
- Recharts `<AreaChart>` com gradiente suave

### Gráfico 7 — Heatmap: Atividades por Dia da Semana × Mês
- Linhas: dias da semana (Seg, Ter, Qua, Qui, Sex)
- Colunas: meses do período
- Intensidade de cor = volume de atividades
- CSS grid customizado

---

## Dashboard de Bens — Visualizações

### KPI Cards (topo da página)

| Card | Valor |
|------|-------|
| Total de Bens Patrimoniais | 422 |
| Total de Softwares | 407 |
| Total de Ramais | 63 |
| Total de Celulares | 13 |

### Gráfico 1 — Donut: Distribuição por Tipo de Hardware
- Monitor (205), Computador Desktop (121), Microcomputador (35), Notebook (24), Switch (11), Tablet (9), Câmera (7)

### Gráfico 2 — Barras: Bens por Setor (Top 15)
- CTI (53), CTI Sala do Servidor (50), Saneamento (32), Energia/Gás (31)...

### Gráfico 3 — Donut: Distribuição por Modelo/Fabricante
- HP (261), Lenovo (84), Daten (50), Apple (9)

### Gráfico 4 — Barras: Sistema Operacional
- Windows 10 Pro (119), Windows 11 (35), Sem SO / Não se aplica (268)
- Mostra percentual de atualização para Win 11

### Gráfico 5 — Barras Horizontais Empilhadas: Ramais por Setor
- Cada setor com barra dividida: digital vs analógico
- Recharts `<BarChart>` com barras empilhadas

### Painel: Celulares
- Lista dos 13 celulares com modelo, setor, IMEI parcial (privacidade)

---

## Tabelas Interativas

### Tabela de Atividades
**Colunas**: Categoria | Nome da Atividade | Data | Dia | Responsável | Setor | Prioridade | Estado | Observação

**Filtros avançados**:
- Date range picker (data início / data fim)
- Multi-select: Categoria (7 opções)
- Multi-select: Responsável (dropdown com busca)
- Multi-select: Setor (dropdown com busca)
- Multi-select: Prioridade (Alta / Média / Baixa)
- Busca por texto livre (nome da atividade, solicitante, observação)
- Ordenação por qualquer coluna
- Paginação: 10 / 25 / 50 por página
- Exportar para CSV

### Tabela de Bens
**Colunas**: Tombamento | Tipo | Modelo | Usuário | Setor | Finalidade | Sistema Operacional | Criticidade

**Filtros avançados**:
- Multi-select: Tipo de Hardware
- Multi-select: Setor
- Multi-select: Modelo/Fabricante
- Multi-select: Sistema Operacional
- Busca por tombamento ou usuário
- Exportar para CSV

### Tabela de Softwares
**Colunas**: Nome | Versão | Finalidade

### Tabela de Ramais
**Colunas**: Setor | Digital | Analógico | Total | Descrição

---

## Design e UI/UX

### Tema
- **Dark mode obrigatório** como padrão
- Fundo principal: `#0a0d14`
- Sidebar: `#0f1320`
- Cards: `#131929` com border `rgba(255,255,255,0.06)`
- Cor institucional primária: azul `#3b82f6` (blue-500)
- Cor de destaque: índigo `#6366f1`

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px fixo)         │  MAIN CONTENT                 │
│                              │                               │
│  ▪ Logo CTI + nome           │  Header: título da página +   │
│    "Coordenadoria de TI"     │  breadcrumb + filtro período  │
│                              │  ───────────────────────────  │
│  ── DASHBOARDS ──            │  KPI Cards (grid 4 colunas)   │
│  ▸ Atividades                │  ───────────────────────────  │
│  ▸ Bens Patrimoniais         │  Gráficos (grid 2 colunas)    │
│                              │  ───────────────────────────  │
│  ── TABELAS ──               │  Tabela (largura total)       │
│  ▸ Atividades                │                               │
│  ▸ Bens                      │                               │
│  ▸ Softwares                 │                               │
│  ▸ Ramais                    │                               │
│                              │                               │
│  ── IMPORTAR ──              │                               │
│  ▸ Upload de Planilha        │                               │
│                              │                               │
│  ── EM BREVE ──              │                               │
│  ▸ Power BI (desabilitado)   │                               │
└──────────────────────────────────────────────────────────────┘
```

### Cores para categorias de atividades

| Categoria | Cor | Hex |
|-----------|-----|-----|
| Suporte Técnico e Helpdesk | blue-500 | `#3b82f6` |
| Instalação e Config. SW/HW | violet-500 | `#8b5cf6` |
| Suporte Administrativo | emerald-500 | `#10b981` |
| Administração de Rede e Servidor | orange-500 | `#f97316` |
| Administração de Usuários | rose-500 | `#f43f5e` |
| Suporte de Telemática | cyan-500 | `#06b6d4` |
| Desenvolvimento de Software | yellow-500 | `#eab308` |

### Cores para prioridade

| Prioridade | Cor | Hex |
|-----------|-----|-----|
| Alta | rose-400 | vermelho |
| Média | amber-400 | amarelo |
| Baixa | emerald-400 | verde |

---

## Arquitetura Backend

```
src/
  core/
    entities/entity.ts
    either.ts
    errors/app-error.ts
  domain/
    atividades/
      enterprise/entities/atividade.ts
      application/
        use-cases/
          list-atividades.ts
          list-atividades-by-filters.ts
          get-atividades-stats.ts
          import-atividades.ts
        repositories/atividades-repository.ts
    bens/
      enterprise/entities/
        bem.ts
        software.ts
        ramal.ts
        celular.ts
      application/
        use-cases/
          list-bens.ts
          get-bens-stats.ts
          import-bens.ts
        repositories/bens-repository.ts
  infra/
    database/
      prisma/
        schema.prisma
        seed.ts               ← importa os dados das planilhas na seed
        mappers/
          atividade-mapper.ts
          bem-mapper.ts
        repositories/
          prisma-atividades-repository.ts
          prisma-bens-repository.ts
    http/
      controllers/
        atividades.controller.ts
        atividades-stats.controller.ts
        bens.controller.ts
        bens-stats.controller.ts
        upload.controller.ts
      presenters/
        atividade.presenter.ts
        bem.presenter.ts
        stats.presenter.ts
    uploads/
      parsers/
        atividades-parser.ts
        bens-parser.ts
```

### Endpoints REST

```
GET  /atividades                        → lista paginada com filtros
GET  /atividades/stats                  → KPIs, distribuições, agrupamentos
GET  /atividades/stats/por-mes          → agrupado por mês
GET  /atividades/stats/por-categoria    → distribuição por categoria
GET  /atividades/stats/por-setor        → top setores
GET  /atividades/stats/por-responsavel  → por responsável
GET  /atividades/stats/por-prioridade   → por prioridade
GET  /bens                              → lista paginada
GET  /bens/stats                        → KPIs dos bens
GET  /bens/stats/por-tipo               → por tipo de hardware
GET  /bens/stats/por-setor              → por setor
GET  /softwares                         → lista de softwares
GET  /ramais                            → lista de ramais
GET  /celulares                         → lista de celulares
POST /upload/atividades                 → upload e parse de planilha
POST /upload/bens                       → upload e parse de planilha
```

### Query Params para listagem de atividades

```
?page=1
&size=25
&dataInicio=2024-03-01
&dataFim=2025-12-31
&categoria=Suporte Técnico e Helpdesk
&responsavel=Guilherme
&setor=RH
&prioridade=Alta
&busca=texto livre
```

---

## Arquitetura Frontend

```
src/
  app/
    layout.tsx
    (dashboard)/
      layout.tsx                    ← sidebar + header
      page.tsx                      ← redirect /dashboard/atividades
      dashboard/
        atividades/
          page.tsx                  ← Dashboard Atividades (RSC)
          actions.ts
        bens/
          page.tsx                  ← Dashboard Bens (RSC)
          actions.ts
      tabelas/
        atividades/
          page.tsx
          actions.ts
        bens/
          page.tsx
          actions.ts
        softwares/page.tsx
        ramais/page.tsx
      importar/
        page.tsx
        actions.ts
      power-bi/
        page.tsx                    ← placeholder
  components/
    layout/
      sidebar.tsx
      sidebar-item.tsx
      header.tsx
      breadcrumb.tsx
    dashboard/
      kpi-card.tsx
      kpi-card-skeleton.tsx
      section-header.tsx
    charts/
      atividades-por-mes.tsx        ← BarChart
      distribuicao-categorias.tsx   ← PieChart/Donut
      top-setores.tsx               ← BarChart horizontal
      prioridade-por-mes.tsx        ← BarChart agrupado
      produtividade-responsavel.tsx ← BarChart horizontal
      evolucao-temporal.tsx         ← AreaChart
      heatmap-dias.tsx              ← Grid customizado
      bens-por-tipo.tsx             ← PieChart/Donut
      bens-por-setor.tsx            ← BarChart horizontal
      so-distribuicao.tsx           ← BarChart
      ramais-por-setor.tsx          ← BarChart empilhado
    tables/
      atividades-table.tsx
      bens-table.tsx
      softwares-table.tsx
      ramais-table.tsx
      data-table.tsx                ← componente base TanStack
      columns/
        atividades-columns.tsx
        bens-columns.tsx
    filters/
      filter-panel.tsx
      date-range-picker.tsx
      multi-select.tsx
      search-input.tsx
      reset-filters-button.tsx
    ui/                             ← Shadcn/ui components
  services/
    apiClient.ts
    api.ts
    error/index.ts
    methods/
      get/index.ts
      post/index.ts
    models/
      atividades/index.ts
      bens/index.ts
      upload/index.ts
  context/
    AtividadesContext.tsx
    BensContext.tsx
  @types/
    atividade.d.ts
    bem.d.ts
    stats.d.ts
  lib/
    utils.ts
    formatters.ts                   ← formatDate, formatNumber, etc.
    chart-colors.ts                 ← constantes de cores
    export-csv.ts                   ← utilitário de exportação
```

---

## Variáveis de Ambiente

### Backend (`.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dashboard_cti
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...
PORT=3333
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

---

## Seed do Banco de Dados

O arquivo `prisma/seed.ts` deve:
1. Ler `atividades_padronizadas.xlsx` da pasta `/data`
2. Ler `Monitoramento de Bens - CTI.xlsx` da pasta `/data`
3. Parsear cada sheet com `xlsx` (npm)
4. Fazer `upsert` em batch de 100 registros
5. Logar progresso: `Importando atividades... 2948/2948 ✓`

---

## Padrões de Implementação

### Backend
- Use cases retornam `Either<DomainError, Output>`
- Controllers mapeiam erros para HTTP exceptions
- Prisma mappers convertem entre entidade de domínio e modelo Prisma
- Zod valida todos os payloads de entrada nos controllers
- Upload: Multer recebe o arquivo → controller → use case de importação → parser lê linha a linha → persiste em batch

### Frontend
- Server Actions para buscar dados no SSR (página inicial)
- React Context + Service direto para interações client-side (filtros, paginação)
- Componentes de gráfico são todos `"use client"`
- Tabelas com TanStack Table, paginação server-side via query params na URL
- Filtros persistem na URL com `useSearchParams` e `router.push`
- Design tokens definidos em `globals.css` (cores, radius, spacing)
- Nenhum componente usa cores Tailwind diretas — sempre via tokens

---

## Ordem de Implementação

### Fase 1 — Fundação Backend
1. Setup NestJS + Prisma + PostgreSQL
2. Schema Prisma com todas as entidades
3. Seed com dados reais das planilhas
4. Repositórios e use cases de listagem e stats
5. Controllers REST com filtros e paginação

### Fase 2 — Fundação Frontend
6. Setup Next.js + Tailwind + Shadcn/ui + Recharts
7. Design tokens no `globals.css` (cores, radius)
8. Layout base: sidebar, header, breadcrumb
9. Serviços Axios e contexts

### Fase 3 — Dashboard de Atividades
10. KPI Cards com skeleton loading
11. Gráficos: por mês, por categoria, por setor
12. Gráficos: por responsável, por prioridade, área temporal
13. Heatmap dias da semana

### Fase 4 — Dashboard de Bens
14. KPI Cards de bens
15. Gráficos: por tipo, por setor, por fabricante, por SO
16. Gráfico de ramais empilhado

### Fase 5 — Tabelas
17. Tabela de atividades com TanStack + filtros avançados
18. Tabela de bens com filtros
19. Tabelas auxiliares: softwares, ramais, celulares
20. Exportação CSV

### Fase 6 — Upload
21. Página de importação de planilhas
22. Endpoint de upload no backend
23. Parser e seed incremental

### Fase 7 — Polimento
24. Responsividade (desktop + tablet)
25. Skeleton loading em todos os componentes
26. Filtros persistentes na URL (query params)
27. Acessibilidade (Lighthouse ≥ 90)
28. Placeholder da seção Power BI

---

## Critérios de Aceitação

- [ ] Seed popula o banco com os 2.948 registros de atividades
- [ ] Seed popula com os 422 bens + 407 softwares + 63 ramais + 13 celulares
- [ ] Dashboard de atividades exibe todos os 7 gráficos
- [ ] Dashboard de bens exibe todos os 5 gráficos
- [ ] Tabela de atividades com paginação, ordenação, filtros e export CSV
- [ ] Tabela de bens com paginação, ordenação, filtros e export CSV
- [ ] Filtros persistem na URL via query params
- [ ] Skeleton loading em todos os componentes assíncronos
- [ ] Dark mode consistente em todo o sistema
- [ ] Responsivo para desktop (1440px) e tablet (768px)
- [ ] Lighthouse Accessibility ≥ 90
- [ ] Upload de nova planilha funcional via interface

---

## Resumo dos Dados

| Fonte | Registros | Observação |
|-------|-----------|------------|
| Atividades | 2.948 | mar/2024 a mar/2026 |
| Bens patrimoniais | 422 | hardware inventariado |
| Softwares | 407 | ativos de software |
| Ramais telefônicos | 63 | 25 setores |
| Celulares | 13 | majoritariamente CTI |

### Insights dos dados

- **61% das atividades** são de Suporte Técnico e Helpdesk
- **Guilherme** é o responsável mais ativo com 1.170 registros (40%)
- **Ouvidoria** é o setor que mais demanda TI (287 chamados)
- Distribuição de prioridade quase igualitária entre Alta (45%) e Média (44%)
- **100% das atividades** estão com estado "Feito" — base histórica
- Pico de atividades: **maio/2024** (300) e **janeiro/2025** (243)
- **HP domina** o inventário de hardware com 261 dos 422 equipamentos (62%)
- Apenas **35 máquinas** com Windows 11 vs **119** ainda em Windows 10 Pro
- **Monitores** são o tipo de bem mais comum (205 de 422 — 49%)
