import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { verificaToken } from "../middlewares/verificaToken";

const prisma = new PrismaClient();
const router = Router();

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