-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'agent',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "agenda_reunioes"
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT;

-- AlterTable
ALTER TABLE "data_import_logs"
ADD COLUMN "actorId" TEXT,
ADD COLUMN "actorName" TEXT,
ADD COLUMN "actorEmail" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_active_idx" ON "users"("active");

-- CreateIndex
CREATE INDEX "agenda_reunioes_createdById_idx" ON "agenda_reunioes"("createdById");

-- CreateIndex
CREATE INDEX "agenda_reunioes_updatedById_idx" ON "agenda_reunioes"("updatedById");

-- CreateIndex
CREATE INDEX "data_import_logs_actorId_idx" ON "data_import_logs"("actorId");

-- CreateIndex
CREATE INDEX "bens_historico_importLogId_idx" ON "bens_historico"("importLogId");

-- AddForeignKey
ALTER TABLE "agenda_reunioes" ADD CONSTRAINT "agenda_reunioes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_reunioes" ADD CONSTRAINT "agenda_reunioes_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_import_logs" ADD CONSTRAINT "data_import_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bens_historico" ADD CONSTRAINT "bens_historico_importLogId_fkey" FOREIGN KEY ("importLogId") REFERENCES "data_import_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
