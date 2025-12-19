import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from 'zod'
import { verificaToken } from "../middlewares/verificaToken"

const prisma = new PrismaClient()
const router = Router()

const categoriaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["RECEITA", "DESPESA"]),
  cor: z.string().optional(),
})

router.post("/", verificaToken, async (req, res) => {
  try {
    const dados = categoriaSchema.parse(req.body)
    const usuarioId = String(req.userLogadoId);
    const novaCategoria = await prisma.categoria.create({
      data: {
        usuarioId, 
        nome: dados.nome,
        tipo: dados.tipo,
        cor: dados.cor,
      },
    })
    return res.status(201).json(novaCategoria)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ erros: error.errors })
    }
    console.error("Erro ao criar categoria:", error)
    return res.status(500).json({ erro: "Erro interno do servidor" })
  }
})

router.get("/", verificaToken, async (req, res) => {
    const usuarioId = String(req.userLogadoId)
    try {
        const categorias = await prisma.categoria.findMany({
            where: { usuarioId },
        })
        return res.status(200).json(categorias)
    } catch (error) {
        console.error("Erro ao buscar categorias:", error)
        return res.status(500).json({ erro: "Erro interno do servidor" })
    }
})

router.delete("/:id", verificaToken,  async (req, res) => {
    const { id } = req.params
    try {
        const categoriaExistente = await prisma.categoria.findUnique({
            where: { id },
        })
        if (!categoriaExistente) {
            return res.status(404).json({ erro: "Categoria não encontrada" })
        }   
        await prisma.categoria.delete({
            where: { id },
        })
        return res.status(204).send()
    } catch (error) {
        console.error("Erro ao deletar categoria:", error)
        return res.status(500).json({ erro: "Erro interno do servidor" })
    }
})

router.patch("/:id", verificaToken, async (req, res) => {
    const { id } = req.params
    try {
        const dados = categoriaSchema.partial().parse(req.body)
        const categoriaAtualizada = await prisma.categoria.update({
            where: { id },
            data: dados,
        })
        return res.status(200).json(categoriaAtualizada)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ erros: error.errors })
        }
        console.error("Erro ao atualizar categoria:", error)
        return res.status(500).json({ erro: "Erro interno do servidor" })
    }
})

router.get("/:id", verificaToken, async (req, res) => {
    const { id } = req.params
    try {
        const categoria = await prisma.categoria.findUnique({
            where: { id },
        })
        if (!categoria) {
            return res.status(404).json({ erro: "Categoria não encontrada" })
        }
        return res.status(200).json(categoria)
    } catch (error) {
        console.error("Erro ao buscar categoria:", error)
        return res.status(500).json({ erro: "Erro interno do servidor" })
    }
})

export default router