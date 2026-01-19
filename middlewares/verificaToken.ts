import jwt, { JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userLogadoId?: string;
      userLogadoNome?: string;
      userLogadoEmail?: string;
    }
  }
}

interface TokenI extends JwtPayload {
  userLogadoId?: string;
  userLogadoNome?: string;
  email?: string;
  id?: string;
  nome?: string;
}

export function verificaToken(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ error: "Token não informado" });
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Formato do token inválido. Use: Bearer <token>" });
  }

  const jwtKey = process.env.JWT_KEY;
  if (!jwtKey) {
    return res.status(500).json({ error: "JWT_KEY não configurada no servidor" });
  }

  try {
    const decoded = jwt.verify(token, jwtKey) as TokenI;

    const id = decoded.userLogadoId ?? decoded.id;
    const nome = decoded.userLogadoNome ?? decoded.nome;

    if (typeof id !== "string" || typeof nome !== "string") {
      return res.status(401).json({ error: "Token inválido (payload incompleto)" });
    }

    req.userLogadoId = id;
    req.userLogadoNome = nome;
    req.userLogadoEmail = decoded.email;

    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
