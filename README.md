# myAutoFinance

**myAutoFinance** é uma aplicação web para controle de gastos e receitas pessoais, com foco em **automação**, **organização financeira** e **facilidade de uso**.

O sistema permite que usuários registrem movimentações financeiras de forma manual, via **WhatsApp** ou por **importação de extratos bancários**, utilizando **IA para categorização automática** das despesas e receitas.

---

## 🚀 Funcionalidades

- Cadastro e autenticação de usuários (multiusuário)
- Controle de receitas e despesas
- Múltiplas contas por usuário
- Associação de contas a bancos escolhidos pelo usuário
- Categorias personalizadas
- Categorização automática com IA
- Entrada de dados por:
  - Formulário web
  - WhatsApp (via n8n)
  - Extratos bancários (CSV / OFX / PDF)
- Identificação da origem do lançamento
- Aprendizado automático a partir das correções do usuário

---

## 🧠 Diferenciais

- Funciona como uma **planilha financeira inteligente**
- IA sugere categorias com nível de confiança
- Sistema aprende com o comportamento do usuário
- Estrutura preparada para escalar como SaaS

---

## 🏗️ Tecnologias (stack prevista)

- **Frontend:** Next.js + React + TypeScript
- **Backend:** Node.js + API (REST ou Server Actions)
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL / MySQL
- **Automação:** n8n
- **IA:** LLM para categorização financeira
- **Estilo:** Tailwind CSS

---

## 📁 Estrutura geral do projeto

myAutoFinance/
├── frontend/
├── backend/
├── prisma/
├── n8n/
└── README.md

yaml
Copiar código

---

## 📌 Status do projeto

🚧 Em desenvolvimento  
Este projeto está em fase de **MVP**, com foco inicial no controle financeiro pessoal e automação de lançamentos.

---

## 📄 Licença

Este projeto é de uso educacional e pessoal.