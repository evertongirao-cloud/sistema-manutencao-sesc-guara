# 📤 Guia de Exportação para GitHub

Este guia contém instruções passo a passo para exportar o projeto para o GitHub.

## Opção 1: Usando a Interface Web do GitHub (Mais Fácil)

### Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Preencha os campos:
   - **Repository name**: `sistema-manutencao-sesc-guara`
   - **Description**: `Sistema de Gerenciamento de Chamados de Manutenção para Sesc Guará`
   - **Visibility**: Public (Público)
   - **NÃO** marque "Initialize this repository with a README"
3. Clique em "Create repository"

### Passo 2: Conectar o Repositório Local

Copie a URL do repositório que aparece na tela (algo como: `https://github.com/SEU_USUARIO/sistema-manutencao-sesc-guara.git`)

### Passo 3: Fazer Push do Código

Execute os seguintes comandos no terminal do projeto:

```bash
# Navegar para o diretório do projeto
cd /home/ubuntu/sistema-manutencao

# Adicionar o remote do GitHub
git remote add github https://github.com/SEU_USUARIO/sistema-manutencao-sesc-guara.git

# Fazer push do código
git push github master
```

Quando solicitado, insira suas credenciais do GitHub:
- **Username**: seu nome de usuário do GitHub
- **Password**: use um Personal Access Token (veja instruções abaixo)

---

## Opção 2: Usando GitHub CLI (gh)

### Passo 1: Fazer Login no GitHub CLI

```bash
gh auth login
```

Siga as instruções interativas:
1. Escolha "GitHub.com"
2. Escolha "HTTPS"
3. Escolha "Login with a web browser"
4. Copie o código que aparece
5. Pressione Enter para abrir o navegador
6. Cole o código e autorize

### Passo 2: Criar e Fazer Push do Repositório

```bash
cd /home/ubuntu/sistema-manutencao

gh repo create sistema-manutencao-sesc-guara \
  --public \
  --source=. \
  --description="Sistema de Gerenciamento de Chamados de Manutenção para Sesc Guará" \
  --remote=github \
  --push
```

---

## 🔑 Como Criar um Personal Access Token (PAT)

Se você escolheu a Opção 1 e precisa de um token:

1. Acesse https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome descritivo (ex: "Sistema Manutenção Sesc")
4. Selecione os escopos:
   - ✅ `repo` (Full control of private repositories)
5. Clique em "Generate token"
6. **COPIE O TOKEN IMEDIATAMENTE** (você não poderá vê-lo novamente)
7. Use este token como senha ao fazer push

---

## ✅ Verificar se Funcionou

Após fazer o push, acesse:
```
https://github.com/SEU_USUARIO/sistema-manutencao-sesc-guara
```

Você deverá ver todos os arquivos do projeto!

---

## 🚀 Próximos Passos: Deploy no Vercel

### Opção A: Via Interface Web

1. Acesse https://vercel.com
2. Clique em "Add New" → "Project"
3. Importe o repositório do GitHub
4. Configure as variáveis de ambiente (copie do arquivo .env)
5. Clique em "Deploy"

### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
cd /home/ubuntu/sistema-manutencao
vercel --prod
```

---

## 📋 Variáveis de Ambiente para o Vercel

Ao fazer deploy no Vercel, adicione estas variáveis de ambiente:

```
DATABASE_URL=mysql://...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
JWT_SECRET=...
VITE_APP_ID=...
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=...
OWNER_NAME=...
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_APP_TITLE=Manutenção Sesc Guará
VITE_APP_LOGO=/sesc-logo.png
```

**⚠️ IMPORTANTE**: Não compartilhe suas variáveis de ambiente publicamente!

---

## 🆘 Problemas Comuns

### "Permission denied (publickey)"

Você precisa configurar uma chave SSH ou usar HTTPS com token.

**Solução**: Use HTTPS e um Personal Access Token como senha.

### "Repository not found"

Verifique se:
1. O repositório foi criado corretamente no GitHub
2. A URL do remote está correta (`git remote -v`)
3. Você tem permissão de acesso ao repositório

### "Authentication failed"

Se estiver usando HTTPS:
- Use um Personal Access Token, não sua senha do GitHub
- Tokens devem ter o escopo `repo`

---

## 📞 Suporte

Se tiver problemas, consulte:
- Documentação do GitHub: https://docs.github.com
- Documentação do Vercel: https://vercel.com/docs
- GitHub CLI: https://cli.github.com/manual

---

**Boa sorte com seu deploy! 🚀**
