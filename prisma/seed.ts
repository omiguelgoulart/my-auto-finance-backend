import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  

  const usuario = await prisma.usuario.create({
    data: {
      nome: "Luis Miguel Rosa Goulart",
      email: "miguel@email.com",
      senha: "",
    },
  });

  const nubank = await prisma.banco.create({
    data: { nome: "Nubank", codigo: "0260" },
  });

  const bancoBrasil = await prisma.banco.create({
    data: { nome: "Banco do Brasil", codigo: "0001" },
  });

  const contaNubank = await prisma.conta.create({
    data: {
      usuarioId: usuario.id,
      bancoId: nubank.id,
      nome: "Conta Nubank",
      tipo: "CORRENTE",
      saldoInicial: 0,
    },
  });

  const contaBB = await prisma.conta.create({
    data: {
      usuarioId: usuario.id,
      bancoId: bancoBrasil.id,
      nome: "Conta Banco do Brasil",
      tipo: "CORRENTE",
      saldoInicial: 1.83,
    },
  });

  const categorias = await prisma.categoria.createMany({
    data: [
      { usuarioId: usuario.id, nome: "Alimentação", tipo: "DESPESA", cor: "#EF4444" },
      { usuarioId: usuario.id, nome: "Moradia", tipo: "DESPESA", cor: "#F59E0B" },
      { usuarioId: usuario.id, nome: "Transporte", tipo: "DESPESA", cor: "#3B82F6" },
      { usuarioId: usuario.id, nome: "Lazer", tipo: "DESPESA", cor: "#8B5CF6" },
      { usuarioId: usuario.id, nome: "Serviços", tipo: "DESPESA", cor: "#10B981" },
      { usuarioId: usuario.id, nome: "Transferências", tipo: "RECEITA", cor: "#22C55E" },
    ],
  });

  const alimentacao = await prisma.categoria.findFirst({
    where: { nome: "Alimentação", usuarioId: usuario.id },
  });

  const moradia = await prisma.categoria.findFirst({
    where: { nome: "Moradia", usuarioId: usuario.id },
  });

  const transferencias = await prisma.categoria.findFirst({
    where: { nome: "Transferências", usuarioId: usuario.id },
  });

  await prisma.movimentacao.createMany({
    data: [
      {
        usuarioId: usuario.id,
        contaId: contaNubank.id,
        categoriaId: transferencias?.id,
        descricao: "Pix recebido - TEIA ECOLOGICA",
        valor: 600,
        data: new Date("2025-12-02"),
        tipo: "RECEITA",
        origem: "EXTRATO",
        competencia: "2025-12",
      },
      {
        usuarioId: usuario.id,
        contaId: contaNubank.id,
        categoriaId: alimentacao?.id,
        descricao: "Mini Kalzone",
        valor: 23,
        data: new Date("2025-12-01"),
        tipo: "DESPESA",
        origem: "EXTRATO",
        competencia: "2025-12",
      },
      {
        usuarioId: usuario.id,
        contaId: contaNubank.id,
        categoriaId: alimentacao?.id,
        descricao: "Netflix",
        valor: 59.9,
        data: new Date("2025-12-11"),
        tipo: "DESPESA",
        origem: "EXTRATO",
        recorrente: true,
        recorrenciaTipo: "MENSAL",
        competencia: "2025-12",
        observacoes: "Assinatura mensal",
      },
      {
        usuarioId: usuario.id,
        contaId: contaNubank.id,
        categoriaId: moradia?.id,
        descricao: "Pagamento fatura cartão",
        valor: 319,
        data: new Date("2025-12-13"),
        tipo: "DESPESA",
        origem: "EXTRATO",
        competencia: "2025-12",
      },
      {
        usuarioId: usuario.id,
        contaId: contaBB.id,
        categoriaId: moradia?.id,
        descricao: "Pagamento boleto CEEE",
        valor: 204.3,
        data: new Date("2025-12-19"),
        tipo: "DESPESA",
        origem: "EXTRATO",
        competencia: "2025-12",
      },
    ],
  });
}

main()
  .then(() => {
    console.log("Seed executado com sucesso");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
