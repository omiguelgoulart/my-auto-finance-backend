-- CreateEnum
CREATE TYPE "Tema" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- CreateTable
CREATE TABLE "PreferenciaUsuario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "inicioMes" INTEGER NOT NULL DEFAULT 1,
    "tema" "Tema" NOT NULL DEFAULT 'SYSTEM',
    "idioma" TEXT NOT NULL DEFAULT 'pt-BR',
    "fusoHorario" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreferenciaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreferenciaUsuario_usuarioId_key" ON "PreferenciaUsuario"("usuarioId");

-- AddForeignKey
ALTER TABLE "PreferenciaUsuario" ADD CONSTRAINT "PreferenciaUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
