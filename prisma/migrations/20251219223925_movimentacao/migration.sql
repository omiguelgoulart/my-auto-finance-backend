/*
  Warnings:

  - The values [CARTAO_DEBITO,PIX] on the enum `TipoConta` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoRecorrencia" AS ENUM ('MENSAL', 'SEMANAL', 'ANUAL');

-- AlterEnum
BEGIN;
CREATE TYPE "TipoConta_new" AS ENUM ('CORRENTE', 'POUPANCA', 'CARTAO_CREDITO', 'DINHEIRO');
ALTER TABLE "Conta" ALTER COLUMN "tipo" TYPE "TipoConta_new" USING ("tipo"::text::"TipoConta_new");
ALTER TYPE "TipoConta" RENAME TO "TipoConta_old";
ALTER TYPE "TipoConta_new" RENAME TO "TipoConta";
DROP TYPE "TipoConta_old";
COMMIT;

-- AlterTable
ALTER TABLE "Movimentacao" ADD COLUMN     "competencia" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "recorrenciaFim" TIMESTAMP(3),
ADD COLUMN     "recorrenciaIntervalo" INTEGER,
ADD COLUMN     "recorrenciaTipo" "TipoRecorrencia",
ADD COLUMN     "recorrente" BOOLEAN NOT NULL DEFAULT false;
