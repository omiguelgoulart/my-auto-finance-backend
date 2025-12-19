import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase(),
  senha: z.string().min(1, "Senha obrigatória"),
});

router.post("/", async (req: Request, res: Response) => {
  const mensaPadrao = "Login ou senha incorretos";

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ erro: mensaPadrao });
  }

  const { email, senha } = parsed.data;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true, nome: true, email: true, senha: true },
    });

    if (!usuario || !usuario.senha) {
      return res.status(401).json({ erro: mensaPadrao });
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senha);
    if (!senhaConfere) {
      return res.status(401).json({ erro: mensaPadrao });
    }

    const jwtKey = process.env.JWT_KEY;
    if (!jwtKey) {
      return res.status(500).json({ erro: "JWT_KEY não configurada no servidor" });
    }

    const token = jwt.sign(
      { userLogadoId: usuario.id, userLogadoNome: usuario.nome },
      jwtKey,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      token,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ erro: "Erro interno ao fazer login" });
  }
});

export default router;
