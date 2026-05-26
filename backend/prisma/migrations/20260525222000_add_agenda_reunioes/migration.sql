-- CreateTable
CREATE TABLE "agenda_reunioes" (
    "id" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "descricaoPauta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_reunioes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agenda_reunioes_data_horaInicio_idx" ON "agenda_reunioes"("data", "horaInicio");

-- CreateIndex
CREATE INDEX "agenda_reunioes_createdAt_idx" ON "agenda_reunioes"("createdAt" DESC);
