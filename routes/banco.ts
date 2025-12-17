import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from 'zod'
import { verificaToken } from "../middlewares/verificaToken"

const prisma = new PrismaClient()
const router = Router()

const bancoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().optional(),
})

router.post("/", verificaToken, async (req, res) => {
  try {
    const dados = bancoSchema.parse(req.body)
    const novoBanco = await prisma.banco.create({
      data: {
        nome: dados.nome,
        codigo: dados.codigo,
      },
    })
    return res.status(201).json(novoBanco)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ erros: error.errors })
    }
    console.error("Erro ao criar banco:", error)
    return res.status(500).json({ erro: "Erro interno do servidor" })
  }
})

router.get("/", verificaToken, async (req, res) => {
    const usuarioId = String(req.userLogadoId)
    try {
        const bancos = await prisma.banco.findMany({
            include: {
                contas: {
                    where: { usuarioId },
                },
            },
        })
        return res.status(200).json(bancos)
    } catch (error) {
        console.error("Erro ao buscar bancos:", error)
        return res.status(500).json({ erro: "Erro interno do servidor" })
    }
})

router.delete("/:id", verificaToken,  async (req, res) => {
    const { id } = req.params
    try {
        const bancoExistente = await prisma.banco.findUnique({
            where: { id },
        })
        if (!bancoExistente) {
            return res.status(404).json({ erro: "Banco não encontrado" })
        }
        await prisma.banco.delete({
            where: { id },
        })
        return res.status(204).send()
    } catch (error) {
        console.error("Erro ao deletar banco:", error)
        return res.status(500).json({ erro: "Erro interno do servidor" })
    }
})

router.patch("/:id", verificaToken, async (req, res) => {
    const { id } = req.params
    try {
        const dados = bancoSchema.partial().parse(req.body)
        const bancoAtualizado = await prisma.banco.update({
            where: { id },
            data: dados,
        })
        return res.status(200).json(bancoAtualizado)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ erros: error.errors })
        }   
        console.error("Erro ao atualizar banco:", error)
        return res.status(500).json({ erro: "Erro interno do servidor" })
    }
})

router.get("/:id", verificaToken, async (req, res) => {
  const { id } = req.params
  const usuarioId = String(req.userLogadoId)

  try {
    const banco = await prisma.banco.findUnique({
      where: { id },
      include: {
        contas: {
          where: { usuarioId },
        },
      },
    })

    if (!banco) {
      return res.status(404).json({ erro: "Banco não encontrado" })
    }

    return res.status(200).json(banco)
  } catch (error) {
    console.error("Erro ao buscar banco:", error)
    return res.status(500).json({ erro: "Erro interno do servidor" })
  }
})

export default router