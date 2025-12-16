import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { verificaToken } from "../middlewares/verificaToken"

const prisma = new PrismaClient()
const router = Router()

export const usuarioCadastroSchema = z.object({
    nome: z.string().min(2, "Nome muito curto"),
    email: z.string().email("Email inválido").toLowerCase(),
    telefone: z.string().min(10, "Telefone inválido").max(20, "Telefone inválido").optional(),
    senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmarSenha: z.string().min(8),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  });
  
  function validaSenha(senha: string) {
  
    const mensa: string[] = []
  
    // .length: retorna o tamanho da string (da senha)
    if (senha.length < 8) {
      mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
    }
  
    // contadores
    let pequenas = 0
    let grandes = 0
    let numeros = 0
    let simbolos = 0
  
    // senha = "abc123"
    // letra = "a"
  
    // percorre as letras da variável senha
    for (const letra of senha) {
      // expressão regular
      if ((/[a-z]/).test(letra)) {
        pequenas++
      }
      else if ((/[A-Z]/).test(letra)) {
        grandes++
      }
      else if ((/[0-9]/).test(letra)) {
        numeros++
      } else {
        simbolos++
      }
    }
  
    if (pequenas == 0 ) {
      mensa.push("Erro... senha deve possuir letras minúsculas")
    }
    if (grandes == 0 ) {
      mensa.push("Erro... senha deve possuir letras maiúsculas")
    }
    if (numeros == 0 ) {
      mensa.push("Erro... senha deve possuir números")
    }
    if (simbolos == 0 ) {
      mensa.push("Erro... senha deve possuir símbolos")
    }
  
    return mensa
  }

router.post("/cadastro",  async (req, res) => {
    try {
        const dados = usuarioCadastroSchema.parse(req.body)
        const errosSenha = validaSenha(dados.senha)
        if (errosSenha.length > 0) {
            return res.status(400).json({ erros: errosSenha })
        }
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: dados.email }
        })
        if (usuarioExistente) {
            return res.status(400).json({ erro: "Email já cadastrado." })
        }
        const senhaHash = await bcrypt.hash(dados.senha, 10)
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome: dados.nome,
                email: dados.email,
                telefone: dados.telefone,
                senha: senhaHash,
            }
        })
        return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso.", usuarioId: novoUsuario.id })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ erros: error.errors })
        }
        console.error("Erro ao cadastrar usuário:", error)
        return res.status(500).json({ erro: "Erro interno do servidor." })
    }
})

router.get("/", verificaToken, async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                createdAt: true,
            }
        })
        return res.json(usuarios)
    } catch (error) {
        console.error("Erro ao buscar usuários:", error)
        return res.status(500).json({ erro: "Erro interno do servidor." })
    }
})

router.get("/:id", verificaToken, async (req, res) => {
    const { id } = req.params
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                createdAt: true,
            }
        })
        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado." })
        }
        return res.json(usuario)
    } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        return res.status(500).json({ erro: "Erro interno do servidor." })
    }
})

router.delete("/:id", verificaToken, async (req, res) => {
    const { id } = req.params
    try {
        await prisma.usuario.delete({
            where: { id }
        })
        return res.json({ mensagem: "Usuário deletado com sucesso." })
    } catch (error) {
        console.error("Erro ao deletar usuário:", error)
        return res.status(500).json({ erro: "Erro interno do servidor." })
    }
})

router.patch("/:id", verificaToken, async (req, res) => {
    const { id } = req.params
    const dadosParaAtualizar = req.body
    try {
        await prisma.usuario.update({
            where: { id },
            data: dadosParaAtualizar
        })
        return res.json({ mensagem: "Usuário atualizado com sucesso." })
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error)
        return res.status(500).json({ erro: "Erro interno do servidor." })
    } 
})

export default router