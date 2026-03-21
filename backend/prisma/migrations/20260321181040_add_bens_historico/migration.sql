-- CreateTable
CREATE TABLE "bens_historico" (
    "id" TEXT NOT NULL,
    "tombamento" TEXT NOT NULL,
    "operacao" TEXT NOT NULL,
    "campo" TEXT,
    "valorAnterior" TEXT,
    "valorNovo" TEXT,
    "importLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bens_historico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bens_historico_tombamento_idx" ON "bens_historico"("tombamento");

-- CreateIndex
CREATE INDEX "bens_historico_createdAt_idx" ON "bens_historico"("createdAt" DESC);
