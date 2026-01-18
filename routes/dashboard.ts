import { PrismaClient, TipoMovimentacao } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { verificaToken } from "../middlewares/verificaToken";

const prisma = new PrismaClient();
const router = Router();

const mesSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Formato inválido. Use YYYY-MM")
  .optional();

function getCompetenciaAtual(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

type ResumoResponse = {
  competencia: string;
  receitas: number;
  despesas: number;
  saldo: number;
};

router.get("/resumo", verificaToken, async (req, res) => {
  const usuarioId = String(req.userLogadoId);

  const parsed = mesSchema.safeParse(req.query.mes);
  if (!parsed.success) {
    return res.status(400).json({ erro: "Parâmetro mes inválido (YYYY-MM)" });
  }

  const competencia = parsed.data ?? getCompetenciaAtual();

  try {
    const agregados = await prisma.movimentacao.groupBy({
      by: ["tipo"],
      where: { usuarioId, competencia },
      _sum: { valor: true },
    });

    const totalReceitas =
      agregados.find((a) => a.tipo === TipoMovimentacao.RECEITA)?._sum.valor ?? 0;

    const totalDespesas =
      agregados.find((a) => a.tipo === TipoMovimentacao.DESPESA)?._sum.valor ?? 0;

    const resp: ResumoResponse = {
      competencia,
      receitas: Number(totalReceitas),
      despesas: Number(totalDespesas),
      saldo: Number(totalReceitas) - Number(totalDespesas),
    };

    return res.status(200).json(resp);
  } catch (error) {
    console.error("Erro ao buscar resumo do dashboard:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

type DespesaPorCategoriaItem = {
  categoriaId: string | null;
  categoriaNome: string;
  valor: number;
};

router.get("/despesas-categoria", verificaToken, async (req, res) => {
  const usuarioId = String(req.userLogadoId);

  const parsed = mesSchema.safeParse(req.query.mes);
  if (!parsed.success) {
    return res.status(400).json({ erro: "Parâmetro mes inválido (YYYY-MM)" });
  }

  const competencia = parsed.data ?? getCompetenciaAtual();

  try {
    const dados = await prisma.movimentacao.groupBy({
      by: ["categoriaId"],
      where: { usuarioId, competencia, tipo: TipoMovimentacao.DESPESA },
      _sum: { valor: true },
    });

    const categoriaIds = dados
      .map((d) => d.categoriaId)
      .filter((id): id is string => typeof id === "string");

    const categorias = await prisma.categoria.findMany({
      where: { id: { in: categoriaIds }, usuarioId },
      select: { id: true, nome: true },
    });

    const mapCategorias = new Map(categorias.map((c) => [c.id, c.nome]));

    const resposta: DespesaPorCategoriaItem[] = dados
      .map((d) => {
        const nome = d.categoriaId ? mapCategorias.get(d.categoriaId) : undefined;

        return {
          categoriaId: d.categoriaId,
          categoriaNome: nome ?? "Sem categoria",
          valor: Number(d._sum.valor ?? 0),
        };
      })
      .sort((a, b) => b.valor - a.valor);

    return res.status(200).json(resposta);
  } catch (error) {
    console.error("Erro ao buscar despesas por categoria:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

const recentSchema = z.coerce.number().int().min(1).max(50).optional();

router.get("/movimentacoes-recentes", verificaToken, async (req, res) => {
  const usuarioId = String(req.userLogadoId);

  const parsedLimit = recentSchema.safeParse(req.query.limit);
  if (!parsedLimit.success) {
    return res.status(400).json({ erro: "Parâmetro limit inválido" });
  }

  const limit = parsedLimit.data ?? 5;

  try {
    const movimentacoes = await prisma.movimentacao.findMany({
      where: { usuarioId },
      orderBy: { data: "desc" },
      take: limit,
      select: {
        id: true,
        descricao: true,
        valor: true,
        data: true,
        tipo: true,
        origem: true,
        competencia: true,
        observacoes: true,
        categoria: { select: { id: true, nome: true } },
        conta: { select: { id: true, nome: true } },
      },
    });

    return res.status(200).json(movimentacoes);
  } catch (error) {
    console.error("Erro ao buscar movimentações recentes:", error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

export default router;
