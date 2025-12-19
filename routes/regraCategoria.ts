import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { verificaToken } from "../middlewares/verificaToken";

const prisma = new PrismaClient();
const router = Router();

const regraCategoriaSchema = z.object({
  palavraChave: z.string().min(1, "palavraChave é obrigatória").toLowerCase().trim(),
  categoriaId: z.string().uuid("categoriaId inválido"),
  prioridade: z.number().int().min(1).max(999).optional(),
});

router.post("/", verificaToken, async (req, res) => {
  try {
    const dados = regraCategoriaSchema.parse(req.body);
    const usuarioId = String(req.userLogadoId);
    const categoria = await prisma.categoria.findFirst({
      where: { id: dados.categoriaId, usuarioId },
      select: { id: true },
    });
    if (!categoria) {
      return res.status(403).json({ erro: "Categoria inválida para este usuário." });
    }
    const novaRegra = await prisma.regraCategoria.create({
      data: {
        usuarioId,
        palavraChave: dados.palavraChave,
        categoriaId: dados.categoriaId,
        prioridade: dados.prioridade ?? 999,
        },
    });
    return res.status(201).json(novaRegra);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ erros: error.errors });
    }
    console.error("Erro ao criar regra de categoria:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.get("/", verificaToken, async (req, res) => {
  const usuarioId = String(req.userLogadoId);
    try {
        const regras = await prisma.regraCategoria.findMany({
            where: { usuarioId },
        });
        return res.status(200).json(regras);
    } catch (error) {
        console.error("Erro ao buscar regras de categoria:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

router.delete("/:id", verificaToken,  async (req, res) => {
    const { id } = req.params;
    try {
        const regraExistente = await prisma.regraCategoria.findUnique({
            where: { id },
        });
        if (!regraExistente) {
            return res.status(404).json({ erro: "Regra de categoria não encontrada" });
        }
        await prisma.regraCategoria.delete({
            where: { id },
        });
        return res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar regra de categoria:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

router.patch("/:id", verificaToken, async (req, res) => {
    const { id } = req.params;
    try {
        const dados = regraCategoriaSchema.partial().parse(req.body);
        const regraExistente = await prisma.regraCategoria.findUnique({
            where: { id },
        });
        if (!regraExistente) {
            return res.status(404).json({ erro: "Regra de categoria não encontrada" });
        }
        const regraAtualizada = await prisma.regraCategoria.update({
            where: { id },
            data: dados,
        });
        return res.status(200).json(regraAtualizada);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ erros: error.errors });
        }
        console.error("Erro ao atualizar regra de categoria:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

router.get("/:id", verificaToken, async (req, res) => {
    const { id } = req.params;
    try {
        const regra = await prisma.regraCategoria.findUnique({
            where: { id },
        });
        if (!regra) {
            return res.status(404).json({ erro: "Regra de categoria não encontrada" });
        }
        return res.status(200).json(regra);
    } catch (error) {
        console.error("Erro ao buscar regra de categoria:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

export default router