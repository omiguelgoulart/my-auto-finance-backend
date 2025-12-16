/*
  Warnings:

  - You are about to drop the column `senha` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[telefone]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('ATIVO', 'BLOQUEADO', 'PENDENTE');

-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('USUARIO', 'ADMIN');

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "senha",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "emailVerificadoEm" TIMESTAMP(3),
ADD COLUMN     "fotoUrl" TEXT,
ADD COLUMN     "fusoHorario" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
ADD COLUMN     "idioma" TEXT NOT NULL DEFAULT 'pt-BR',
ADD COLUMN     "moedaPadrao" TEXT NOT NULL DEFAULT 'BRL',
ADD COLUMN     "papel" "PapelUsuario" NOT NULL DEFAULT 'USUARIO',
ADD COLUMN     "status" "StatusUsuario" NOT NULL DEFAULT 'ATIVO',
ADD COLUMN     "telefone" TEXT,
ADD COLUMN     "ultimoLoginEm" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "CredencialSenha" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "senhaAtualizadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CredencialSenha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenRecuperacaoSenha" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenRecuperacaoSenha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CredencialSenha_usuarioId_key" ON "CredencialSenha"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenRecuperacaoSenha_tokenHash_key" ON "TokenRecuperacaoSenha"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefone_key" ON "Usuario"("telefone");

-- AddForeignKey
ALTER TABLE "CredencialSenha" ADD CONSTRAINT "CredencialSenha_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenRecuperacaoSenha" ADD CONSTRAINT "TokenRecuperacaoSenha_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
