-- CreateTable
CREATE TABLE "contratos_servicos" (
    "id" TEXT NOT NULL,
    "prestador" TEXT NOT NULL,
    "nomeServico" TEXT NOT NULL,
    "numeroReferencia" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataFinal" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos_pagamentos_mensais" (
    "id" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "pagamento" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_pagamentos_mensais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contratos_servicos_prestador_nomeServico_key" ON "contratos_servicos"("prestador", "nomeServico");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_pagamentos_servico_ano_mes_key" ON "contratos_pagamentos_mensais"("servicoId", "ano", "mes");

-- CreateIndex
CREATE INDEX "contratos_pagamentos_mensais_ano_mes_idx" ON "contratos_pagamentos_mensais"("ano", "mes");

-- AddForeignKey
ALTER TABLE "contratos_pagamentos_mensais"
ADD CONSTRAINT "contratos_pagamentos_mensais_servicoId_fkey"
FOREIGN KEY ("servicoId") REFERENCES "contratos_servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
