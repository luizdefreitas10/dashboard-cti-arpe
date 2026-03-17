-- CreateTable
CREATE TABLE "atividades" (
    "id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "diaSemana" TEXT,
    "data" TIMESTAMP(3),
    "horario" TEXT,
    "responsavel" TEXT,
    "solicitante" TEXT,
    "setor" TEXT,
    "prioridade" TEXT,
    "estado" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bens" (
    "id" TEXT NOT NULL,
    "tombamento" TEXT NOT NULL,
    "tipoHardware" TEXT,
    "modelo" TEXT,
    "usuario" TEXT,
    "setor" TEXT,
    "finalidadePrincipal" TEXT,
    "sistemaOperacional" TEXT,
    "criticidade" TEXT,

    CONSTRAINT "bens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "softwares" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "versao" TEXT,
    "finalidade" TEXT,

    CONSTRAINT "softwares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ramais" (
    "id" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "digital" INTEGER NOT NULL DEFAULT 0,
    "analogico" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "descricao" TEXT,

    CONSTRAINT "ramais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "celulares" (
    "id" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "imei" TEXT NOT NULL,

    CONSTRAINT "celulares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bens_tombamento_key" ON "bens"("tombamento");

-- CreateIndex
CREATE UNIQUE INDEX "celulares_imei_key" ON "celulares"("imei");
