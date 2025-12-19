import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { verificaToken } from "../middlewares/verificaToken";

const prisma = new PrismaClient();
const router = Router();

const movimentacaoSchemaBase = z.object({
    contaId: z.string().uuid("contaId inválido"),
    categoriaId: z.string().uuid("categoriaId inválido").optional(),
    descricao: z.string().min(1, "Descrição é obrigatória"),
    valor: z.number().positive("Valor deve ser positivo"),
    data: z.coerce.date(),
    tipo: z.enum(["RECEITA", "DESPESA"]),
    origem: z.enum(["MANUAL", "WHATSAPP", "EXTRATO"]),
    categoriaAutomatica: z.boolean().optional(),
    confiancaIA: z.number().min(0).max(1).optional(),
    idExterno: z.string().optional(),
    competencia: z.string().regex(/^\d{4}-\d{2}$/, "Competência deve estar no formato YYYY-MM").optional(),
    observacoes: z.string().optional(),
    recorrente: z.boolean().optional(),
    recorrenciaTipo: z.enum(["MENSAL", "SEMANAL", "ANUAL"]).optional(),
    recorrenciaIntervalo: z.number().int().positive().optional(),
    recorrenciaFim: z.coerce.date().optional(),
  });

const movimentacaoSchema = movimentacaoSchemaBase.refine((d) => !d.recorrente || !!d.recorrenciaTipo, {
  path: ["recorrenciaTipo"],
  message: "recorrenciaTipo é obrigatório quando recorrente = true",
});

const movimentacaoPatchSchema = movimentacaoSchemaBase.partial().omit({
  contaId: true,
  idExterno: true,
  origem: true,
});

router.post("/", verificaToken, async (req, res) => {
  try {
    const dados = movimentacaoSchema.parse(req.body);
    const usuarioId = String(req.userLogadoId);

    const conta = await prisma.conta.findFirst({
      where: { id: dados.contaId, usuarioId },
      select: { id: true },
    });

    if (!conta) {
      return res.status(403).json({ erro: "Conta inválida para este usuário." });
    }

    if (dados.categoriaId) {
      const categoria = await prisma.categoria.findFirst({
        where: { id: dados.categoriaId, usuarioId },
        select: { id: true },
      });

      if (!categoria) {
        return res
          .status(403)
          .json({ erro: "Categoria inválida para este usuário." });
      }
    }

    const novaMovimentacao = await prisma.movimentacao.create({
      data: {
        usuarioId,
        contaId: dados.contaId,
        categoriaId: dados.categoriaId ?? null,
        descricao: dados.descricao,
        valor: dados.valor,
        data: dados.data,
        tipo: dados.tipo,
        origem: dados.origem,
        categoriaAutomatica: dados.categoriaAutomatica ?? false,
        confiancaIA: dados.confiancaIA,
        idExterno: dados.idExterno ?? null,

        competencia: dados.competencia ?? null,
        observacoes: dados.observacoes ?? null,

        recorrente: dados.recorrente ?? false,
        recorrenciaTipo: dados.recorrente ? dados.recorrenciaTipo ?? null : null,
        recorrenciaIntervalo: dados.recorrente
          ? dados.recorrenciaIntervalo ?? 1
          : null,
        recorrenciaFim: dados.recorrente ? dados.recorrenciaFim ?? null : null,
      },
    });

    return res.status(201).json(novaMovimentacao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ erros: error.errors });
    }
    console.error("Erro ao criar movimentação:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.get("/", verificaToken, async (req, res) => {
  const usuarioId = String(req.userLogadoId);

  try {
    const movimentacoes = await prisma.movimentacao.findMany({
      where: { usuarioId },
      orderBy: { data: "desc" },
    });

    return res.status(200).json(movimentacoes);
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.get("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;
  const usuarioId = String(req.userLogadoId);

  try {
    const movimentacao = await prisma.movimentacao.findFirst({
      where: { id, usuarioId },
    });

    if (!movimentacao) {
      return res.status(404).json({ erro: "Movimentação não encontrada" });
    }

    return res.status(200).json(movimentacao);
  } catch (error) {
    console.error("Erro ao buscar movimentação:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;
  const usuarioId = String(req.userLogadoId);

  try {
    const movimentacaoExistente = await prisma.movimentacao.findFirst({
      where: { id, usuarioId },
      select: { id: true },
    });

    if (!movimentacaoExistente) {
      return res.status(404).json({ erro: "Movimentação não encontrada" });
    }

    await prisma.movimentacao.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar movimentação:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

router.patch("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;
  const usuarioId = String(req.userLogadoId);

  try {
    const dados = movimentacaoPatchSchema.parse(req.body);

    const movimentacaoExistente = await prisma.movimentacao.findFirst({
      where: { id, usuarioId },
      select: { id: true },
    });

    if (!movimentacaoExistente) {
      return res.status(404).json({ erro: "Movimentação não encontrada" });
    }

    if (dados.categoriaId) {
      const categoria = await prisma.categoria.findFirst({
        where: { id: dados.categoriaId, usuarioId },
        select: { id: true },
      });

      if (!categoria) {
        return res
          .status(403)
          .json({ erro: "Categoria inválida para este usuário." });
      }
    }

    const recorrente = dados.recorrente;
    const dataUpdate: Record<string, unknown> = {
      ...dados,
      categoriaId: dados.categoriaId ?? undefined,
      competencia: dados.competencia ?? undefined,
      observacoes: dados.observacoes ?? undefined,
    };

    if (recorrente === false) {
      dataUpdate.recorrenciaTipo = null;
      dataUpdate.recorrenciaIntervalo = null;
      dataUpdate.recorrenciaFim = null;
    }

    const movimentacaoAtualizada = await prisma.movimentacao.update({
      where: { id },
      data: dataUpdate,
    });

    return res.status(200).json(movimentacaoAtualizada);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ erros: error.errors });
    }
    console.error("Erro ao atualizar movimentação:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

export default router;
