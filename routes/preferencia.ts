import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { verificaToken } from "../middlewares/verificaToken";

type Tema = "SYSTEM" | "LIGHT" | "DARK";

const prisma = new PrismaClient();
const router = Router();

const preferenciasSchema = z.object({
    moeda: z.string().min(1).optional(),
    inicioMes: z.number().int().min(1).max(31).optional(),
    tema: z.enum(["SYSTEM", "LIGHT", "DARK"]).optional(),
})

router.post("/", verificaToken, async (req, res) => {
    try {
        const usuarioId = String(req.userLogadoId)
        const dados = preferenciasSchema.parse(req.body)

        const preferencias = await prisma.preferenciaUsuario.upsert({
            where: { usuarioId },
            create: {
                usuarioId,
                moeda: dados.moeda ?? "BRL",
                inicioMes: dados.inicioMes ?? 1,
                tema: (dados.tema ?? "SYSTEM") as Tema,
            },
            update: {
                ...(dados.moeda !== undefined ? { moeda: dados.moeda } : {}),
                ...(dados.inicioMes !== undefined ? { inicioMes: dados.inicioMes } : {}),
                ...(dados.tema !== undefined ? { tema: dados.tema as Tema } : {}),
            },
        })

        return res.status(200).json(preferencias)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ erros: error.errors })
        }
        console.error("Erro ao salvar preferencias:", error)
        return res.status(500).json({ erro: "Erro interno do servidor" })
    }
})

router.get("/", verificaToken, async (req, res) => {
    const usuarioId = req.userLogadoId;

    const preferencias = await prisma.preferenciaUsuario.findUnique({
        where: { usuarioId },
    });

    if (!preferencias) {
        return res.json({
            moeda: "BRL",
            inicioMes: 1,
            tema: "SYSTEM",
            idioma: "pt-BR",
            fusoHorario: "America/Sao_Paulo",
        });
    }

    return res.json(preferencias);
});

router.patch("/", verificaToken, async (req, res) => {
    const usuarioId = req.userLogadoId;

    const dados = req.body;

    const preferencias = await prisma.preferenciaUsuario.upsert({
        where: { usuarioId },
        create: { usuarioId, ...dados },
        update: dados,
    });

    return res.json(preferencias);
});


export default router;