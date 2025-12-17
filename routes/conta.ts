import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from 'zod'
import { verificaToken } from "../middlewares/verificaToken"

const prisma = new PrismaClient()
const router = Router()

const contaSchema = z.object({
  bancoId: z.string().min(1, "Banco é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["CORRENTE", "POUPANCA", "CARTAO_CREDITO", "DINHEIRO"]),
  saldoInicial: z.number().optional(),
});

router.post("/", verificaToken, async (req, res) => {
  try {
    const dados = contaSchema.parse(req.body)
    const usuarioId = String(req.userLogadoId);
    const novaConta = await prisma.conta.create({
      data: {
        usuarioId, 
        bancoId: dados.bancoId,
        nome: dados.nome,
        tipo: dados.tipo,
        saldoInicial: dados.saldoInicial ?? 0,
      },
    })
    return res.status(201).json(novaConta)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ erros: error.errors })
    }
    console.error("Erro ao criar conta:", error)
    return res.status(500).json({ erro: "Erro interno do servidor" })
  }
})

router.get("/:id", verificaToken, async (req, res) => {
    const { id } = req.params
    try {
        const conta = await prisma.conta.findUnique({
            where: { id },
        })
        if (!conta) {
            return res.status(404).json({ erro: "Conta não encontrada" })
        }
        return res.status(200).json(conta)
    } catch (error) {
        console.error("Erro ao buscar conta:", error)
        return res.status(500).json({ erro: "Erro interno do servidor" })
    }
})

router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;
  const usuarioId = String(req.userLogadoId);

  try {
    const contaExistente = await prisma.conta.findFirst({
      where: { id, usuarioId },
      select: { id: true },
    });

    if (!contaExistente) {
      return res.status(404).json({ erro: "Conta não encontrada" });
    }

    await prisma.conta.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.patch("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;
  const usuarioId = String(req.userLogadoId);

  try {
    const dados = contaSchema.partial().parse(req.body);

    const contaExistente = await prisma.conta.findFirst({
      where: { id, usuarioId },
      select: { id: true },
    });

    if (!contaExistente) {
      return res.status(404).json({ erro: "Conta não encontrada" });
    }

    const contaAtualizada = await prisma.conta.update({
      where: { id },
      data: dados,
    });

    return res.status(200).json(contaAtualizada);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ erros: error.errors });
    }
    console.error("Erro ao atualizar conta:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.get("/", verificaToken, async (req, res) => {
  const usuarioId = String(req.userLogadoId);

  try {
    const contas = await prisma.conta.findMany({
      where: { usuarioId },
    });

    return res.status(200).json(contas);
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});


export default router;