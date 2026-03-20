# Soluções Digitais — Especificação e prompt de implementação

Documento para orientar a implementação da sessão **Soluções Digitais** no Dashboard CTI. Fluxo alinhado ao **Power BI**: importação via **Importar Dados**, substituição total dos registros a cada carga, listagem em **cards** com filtros, skeleton no carregamento e estado vazio orientativo.

**Arquivo de referência (dados reais):** `frontend/public/solucoes-digitais/SOLUCOES-DIGITAIS-CTI.xlsx` — o parser e a UI devem aceitar **exatamente** esta estrutura de colunas e os padrões de preenchimento descritos abaixo.

---

## 1. Objetivo do produto

- Nova área **Soluções Digitais** no menu lateral.
- Duas classificações: **Automações** (`automacao`) e **Soluções Web** (`solucao_web`).
- **Layout único para todos os cards** (mesmos blocos de informação para automação e solução web). Campos sem valor na planilha **nunca ficam em branco silencioso**: exibir textos padronizados do tipo *“Informação não disponível”*, *“Imagem indisponível”*, *“Repositório não disponível”*, *“Link de produção não disponível”*, conforme a regra de cada campo.
- **Performance:** GET enxuto, `Cache-Control: no-store`, imagens estáticas ou URL externa; **skeleton** no grid durante o fetch (não travar a página).
- **Responsividade:** grid e cards adaptados a mobile (1 coluna estreita, tipografia e espaçamentos confortáveis para toque).

---

## 2. Semântica das colunas (planilha real)

**Cabeçalhos (linha 1)** — normalizar no parser (trim, case-insensitive):

`TIPO` | `NOME` | `DESCRICAO` | `SETOR` | `STACK` | `LINK` | `IMAGEM` | `RESPONSAVEL` | `DATA DE INICIO` | `OBSERVACOES`

| Coluna | Obrigatório na planilha | Uso |
|--------|-------------------------|-----|
| **TIPO** | Sim | `automacao` ou `solucao_web` (aceitar sinônimos). |
| **NOME** | Sim | Título do card. |
| **DESCRICAO** | Sim | Texto longo; UI com line-clamp + expansão opcional. |
| **SETOR** | Sim | Setor beneficiário. |
| **STACK** | Sim | Separadores: `;` ou `,` (ex.: `Python; Pandas; OpenPyXL`). |
| **LINK** | **Não** (pode vazio) | **URL do repositório GitHub** quando existir. Vazio → UI: *“Repositório não disponível”*; não exibir link quebrado. |
| **IMAGEM** | **Não** (pode vazio) | Nome do arquivo em `public/solucoes-digitais/` ou URL `https://...`. Vazio ou arquivo inexistente → área do card com estado **“Imagem indisponível”** (placeholder visual, sem quebrar layout). |
| **RESPONSAVEL** | Sim | Uma ou **várias pessoas** separadas pelo conector **` e `** (espaço + e + espaço), ex.: `Thays Barbosa e Luiz de Freitas`. Na UI: exibir como lista, chips ou texto com quebras; preservar o separador na lógica de parse se útil para chips. |
| **DATA DE INICIO** | Sim | Pode vir como **número serial do Excel** (ex.: `45962`) **ou** texto data (`AAAA-MM-DD`, `DD/MM/AAAA`). O backend deve converter serial Excel para data ao persistir ou normalizar na importação. |
| **OBSERVACOES** | Sim | Ver **seção 3** — combina **status do projeto** e, quando aplicável, **URL de produção**. |

**Linhas vazias** no final da planilha: **ignorar** (ex.: linha sem `NOME` e sem `TIPO`).

---

## 3. Coluna OBSERVACOES — status + URL de produção

A coluna **OBSERVACOES** não é apenas nota livre: ela define o **status** e pode carregar o **link clicável de produção**.

### 3.1 Valores de status (normalizar no parser)

1. **Concluída** — projeto concluído, **sem** URL na mesma célula (só a palavra ou frase equivalente).  
   - **Comportamento do card:** **não** usar clique no card para abrir site. Exibir no card que **não há link de URL em produção** (texto explícito). Ações secundárias: se **LINK** (GitHub) existir, botão/link “Abrir repositório”; senão *“Repositório não disponível”*.

2. **Concluída - &lt;url&gt;** — texto começa com **Concluída** seguido de separador e **uma URL http(s)** (ex.: `Concluída - https://dashboard-cti-arpe.vercel.app/dashboard/atividades`).  
   - **Extrair** a URL com regex ou split após `Concluída - ` / `Concluída –` (tratar hífen/en-dash).  
   - **Comportamento:** o **clique principal no card** (ou CTA visível) abre essa **URL em produção** em nova aba. GitHub em **LINK** permanece como ação secundária *“Repositório”* quando preenchido.

3. **Em andamento — …** — ex.: `Em andamento — solução ainda não disponível para uso` (aceitar variações de travessão `—`, `-`, hífen).  
   - **Comportamento:** badge **Em andamento**; card **não** navega para produção; mensagem alinhada ao texto; repositório conforme coluna **LINK**.

### 3.2 Regras de clique resumidas

| Situação | Card “clicável” para produção? | Mensagem / ações |
|----------|-------------------------------|------------------|
| Status concluído + URL extraída de OBSERVACOES | **Sim** (abre produção) | Opcional: segundo link para GitHub se LINK preenchido |
| Status concluído + sem URL em OBSERVACOES | **Não** | Informar explicitamente *“Link de produção não disponível”* |
| Status em andamento | **Não** | Badge + texto de indisponibilidade de uso |
| LINK (GitHub) vazio | — | *“Repositório não disponível”* |
| IMAGEM vazia ou asset 404 | — | *“Imagem indisponível”* (placeholder no card) |

**Nota:** Na planilha de referência, a coluna **LINK** costuma ser **GitHub** também para `solucao_web`. A **URL de produção** para o clique principal vem de **OBSERVACOES** quando no formato **Concluída - https://...**. A implementação não deve assumir que `LINK` é o site em produção.

---

## 4. Imagens (`frontend/public/solucoes-digitais/`)

1. Arquivos físicos na pasta **`frontend/public/solucoes-digitais/`**.
2. Na coluna **IMAGEM**: só o **nome do arquivo** (ex.: `dashboard-cti.png`) ou URL `https://...`.
3. **Nome divergente** (typo planilha ≠ arquivo no disco) ou célula vazia: tratar como **imagem indisponível** (`onError` no `<img>` + placeholder).

---

## 5. Ordenação

Sem coluna **ORDEM**: manter **ordem das linhas** no `.xlsx` (primeira linha de dados = primeiro card). Persistir campo `ordem` incremental na importação para o GET devolver estável.

---

## 6. Backend (resumo técnico)

- Modelo sugerido (conceitual): além dos campos espelhando a planilha, armazenar derivados se útil: `statusProjeto` (`concluida` | `em_andamento`), `urlProducao` (nullable, parse OBSERVACOES), `urlRepositorio` (nullable, coluna LINK), `ordem` (int).
- `POST /upload/solucoes-digitais`: multipart `.xlsx`; transação `deleteMany` + `createMany`; validar `TIPO` e URLs quando presentes; converter **DATA DE INICIO** (Excel serial).
- `GET /solucoes-digitais`: `Cache-Control: no-store`; ordenar por `ordem`.

---

## 7. Frontend (UX / UI)

- **Página** `/solucoes-digitais` (ou rota alinhada ao app): grid responsivo (1 / 2 / 3 colunas).
- **Skeleton:** 6 placeholders no loading inicial (mesmo padrão visual da sessão Power BI).
- **Card padronizado:** badge tipo (Automação / Solução web) + badge status (Concluída / Em andamento); área de imagem com fallback; nome; descrição; setor; stack (chips ou texto); responsáveis (suportar múltiplos via ` e `); data formatada em pt-BR; bloco observações ou status resumido; linha **Produção** / **Repositório** com estados “não disponível” quando faltar dado.
- **Clicável:** somente quando `urlProducao` existir; usar `<a>` ou botão com `role` adequado; caso contrário `div`/`article` sem navegação enganosa.
- **Filtros:** Todos | Automações | Soluções Web; opcional filtro Concluídas | Em andamento (derivado do status parseado).
- **Busca:** nome, descrição, setor, stack, responsável.
- **Contadores:** total, automações, soluções web (e opcionalmente concluídas / em andamento).
- **Importar:** bloco para upload de `SOLUCOES-DIGITAIS-CTI.xlsx` (ou nome documentado); após sucesso, refresh da lista ou redirect.

---

## 8. Prompt colável para o agente de implementação

```
Implementar Soluções Digitais no dashboard-cti conforme docs/solucoes-digitais-prompt-implementacao.md.

Planilha de referência: frontend/public/solucoes-digitais/SOLUCOES-DIGITAIS-CTI.xlsx
Cabeçalhos: TIPO, NOME, DESCRICAO, SETOR, STACK, LINK, IMAGEM, RESPONSAVEL, DATA DE INICIO, OBSERVACOES.

Regras obrigatórias:
- LINK = URL GitHub opcional; vazio → "Repositório não disponível" na UI.
- IMAGEM opcional; vazio ou erro de load → placeholder "Imagem indisponível".
- RESPONSAVEL: múltiplos nomes separados por " e ".
- DATA DE INICIO: aceitar serial Excel e datas texto; normalizar no import.
- OBSERVACOES: parsear status "Concluída" / "Em andamento — …" e extrair URL após "Concluída - " para urlProducao.
- Card clicável para abrir site SOMENTE se urlProducao existir; senão mostrar "Link de produção não disponível" e não usar <a> enganoso.
- Layout de card idêntico para automacao e solucao_web; todos os campos com fallback textual se vazio onde aplicável.
- Ordem = ordem das linhas da planilha; ignorar linhas sem TIPO/NOME.
- GET no-store; skeleton no grid; mobile-first responsivo.
- Menu lateral + upload em /importar; replace total no DB a cada import.
```

---

## 9. Estado sem dados

Mensagem com link para **Importar Dados**, citando o arquivo **Solucoes digitais** e a pasta de imagens.

---

## 10. Checklist pós-implementação

- [ ] Import do xlsx real sem erros; datas serial corretas.
- [ ] Dashboard CTI: clique abre Vercel; GitHub como link secundário.
- [ ] Linhas sem LINK e sem imagem: copy correta de indisponível.
- [ ] README em `public/solucoes-digitais/` atualizado (imagem + planilha).

---

*Fonte da verdade para implementação; ajustes futuros de coluna devem ser refletidos aqui.*
