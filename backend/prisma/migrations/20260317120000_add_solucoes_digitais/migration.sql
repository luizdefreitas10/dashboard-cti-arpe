-- CreateTable
CREATE TABLE "solucoes_digitais" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "setor" TEXT,
    "stack" TEXT,
    "urlRepositorio" TEXT,
    "imagem" TEXT,
    "responsavel" TEXT,
    "dataInicio" TIMESTAMP(3),
    "observacoes" TEXT,
    "statusProjeto" TEXT NOT NULL,
    "urlProducao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solucoes_digitais_pkey" PRIMARY KEY ("id")
);
