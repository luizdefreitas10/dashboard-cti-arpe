-- CreateTable
CREATE TABLE "power_bi_reports" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "descricao" TEXT,
    "autores" TEXT,
    "status" TEXT NOT NULL DEFAULT 'concluido',
    "imagem" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "power_bi_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "power_bi_reports_link_key" ON "power_bi_reports"("link");
