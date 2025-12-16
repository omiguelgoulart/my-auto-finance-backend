/*
  Warnings:

  - You are about to drop the `CredencialSenha` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `senha` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CredencialSenha" DROP CONSTRAINT "CredencialSenha_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "senha" TEXT NOT NULL;

-- DropTable
DROP TABLE "CredencialSenha";
