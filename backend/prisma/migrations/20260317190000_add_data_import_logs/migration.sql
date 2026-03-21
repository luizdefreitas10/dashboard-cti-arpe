-- CreateTable
CREATE TABLE "data_import_logs" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "filename" TEXT,
    "rowsCount" INTEGER,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_import_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "data_import_logs_createdAt_idx" ON "data_import_logs"("createdAt" DESC);
