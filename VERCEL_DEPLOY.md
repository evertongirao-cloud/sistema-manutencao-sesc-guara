# 🚀 Guia Completo de Deploy no Vercel

Este guia contém instruções detalhadas para fazer deploy do Sistema de Manutenção Sesc Guará no Vercel de forma gratuita e permanente.

## ⚠️ Importante: Limitações

Este projeto foi originalmente desenvolvido para a plataforma Manus e usa alguns serviços específicos dessa plataforma. Para funcionar completamente no Vercel, você precisará configurar alternativas para:

1. **Banco de Dados** - Substituir por PlanetScale, Supabase ou Railway
2. **Autenticação** - Configurar alternativa ao OAuth Manus
3. **Storage S3** - Configurar bucket S3 próprio ou alternativa

---

## 📋 Pré-requisitos

- ✅ Conta no GitHub (já tem - código já está lá!)
- ✅ Conta no Vercel (criar em https://vercel.com)
- ⏳ Banco de dados MySQL (vamos configurar)
- ⏳ Credenciais SMTP (você já tem!)

---

## 🗄️ Passo 1: Configurar Banco de Dados

### Opção A: PlanetScale (Recomendado - Gratuito)

1. Acesse https://planetscale.com
2. Crie uma conta gratuita
3. Clique em "New database"
4. Nome: `sistema-manutencao-sesc`
5. Região: `AWS us-east-1` (mais próxima do Brasil)
6. Clique em "Create database"
7. Vá em "Connect" → "Create password"
8. Copie a **DATABASE_URL** (formato: `mysql://...`)

### Opção B: Railway (Alternativa Gratuita)

1. Acesse https://railway.app
2. Crie uma conta
3. Clique em "New Project" → "Provision MySQL"
4. Copie a **DATABASE_URL** nas variáveis

### Opção C: Supabase (PostgreSQL - Requer Adaptação)

1. Acesse https://supabase.com
2. Crie projeto
3. **Nota**: Precisará adaptar o código de MySQL para PostgreSQL

---

## 🔧 Passo 2: Preparar o Projeto

### 2.1 Criar Migrações do Banco

Após ter a DATABASE_URL, execute localmente:

```bash
cd sistema-manutencao-sesc-guara

# Instalar dependências
pnpm install

# Configurar .env local
echo "DATABASE_URL=sua-database-url-aqui" > .env

# Executar migrações
pnpm db:push
```

Isso criará todas as tabelas necessárias no banco de dados.

### 2.2 Inserir Configurações Iniciais

Execute este SQL no seu banco de dados (via PlanetScale Console ou Railway):

```sql
-- Inserir e-mail de notificação padrão
INSERT INTO settings (key, value, description) 
VALUES ('notification_email', 'everton.girao@gmail.com', 'E-mail para receber notificações de novos chamados');

-- Inserir credenciais SMTP
INSERT INTO settings (key, value, description) 
VALUES 
('smtp_host', 'smtp.gmail.com', 'Servidor SMTP'),
('smtp_port', '587', 'Porta SMTP'),
('smtp_user', 'sescguaramanutencao@gmail.com', 'Usuário SMTP'),
('smtp_pass', 'gmrf zkgg koce dydc', 'Senha SMTP');
```

---

## 🚀 Passo 3: Deploy no Vercel

### 3.1 Conectar Repositório

1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em "Add New" → "Project"
4. Selecione o repositório `sistema-manutencao-sesc-guara`
5. Clique em "Import"

### 3.2 Configurar Variáveis de Ambiente

Na tela de configuração, adicione estas variáveis:

#### Banco de Dados
```
DATABASE_URL=mysql://usuario:senha@host/database
```
(Cole a URL que você copiou do PlanetScale/Railway)

#### SMTP (E-mail)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sescguaramanutencao@gmail.com
SMTP_PASS=gmrf zkgg koce dydc
```

#### Aplicação
```
VITE_APP_TITLE=Manutenção Sesc Guará
VITE_APP_LOGO=/sesc-logo.png
VITE_APP_URL=https://seu-dominio.vercel.app
NODE_ENV=production
```

#### Autenticação (Simplificada - Sem OAuth)
```
JWT_SECRET=gere-uma-chave-secreta-aleatoria-aqui
```

Para gerar JWT_SECRET, use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.3 Configurar Build

- **Framework Preset**: Vite
- **Build Command**: `pnpm build` (deixe padrão)
- **Output Directory**: `dist` (deixe padrão)
- **Install Command**: `pnpm install` (deixe padrão)

### 3.4 Deploy

Clique em **"Deploy"** e aguarde alguns minutos.

---

## ✅ Passo 4: Verificar Deploy

Após o deploy:

1. Acesse a URL fornecida (ex: `https://sistema-manutencao-sesc-guara.vercel.app`)
2. Teste abrir um chamado
3. Verifique se o e-mail foi enviado
4. Teste acompanhar chamado

---

## 🔐 Passo 5: Configurar Autenticação (Opcional)

O projeto original usa OAuth da Manus. Para funcionar no Vercel, você tem opções:

### Opção A: Remover Autenticação Administrativa

Simplifique removendo o painel administrativo protegido e deixe apenas:
- Abertura de chamados (público)
- Acompanhamento (público)
- Avaliação (público)

### Opção B: Implementar Auth Simples

Use Clerk, Auth0 ou NextAuth para adicionar autenticação própria.

### Opção C: Senha Simples

Adicione uma senha fixa para acessar o painel administrativo.

---

## 🌐 Passo 6: Domínio Personalizado (Opcional)

1. No painel do Vercel, vá em "Settings" → "Domains"
2. Adicione seu domínio (ex: `manutencao.sescguara.com.br`)
3. Configure os DNS conforme instruções do Vercel
4. Aguarde propagação (até 48h)

---

## 📦 Passo 7: Configurar Storage para Imagens

O projeto usa S3 da Manus para upload de imagens. Alternativas:

### Opção A: Cloudinary (Gratuito)

1. Crie conta em https://cloudinary.com
2. Copie suas credenciais
3. Adapte o código em `server/storage.ts`

### Opção B: Vercel Blob

1. Ative Vercel Blob no seu projeto
2. Adapte o código para usar `@vercel/blob`

### Opção C: AWS S3 Próprio

1. Crie bucket no AWS S3
2. Configure credenciais IAM
3. Adicione variáveis:
```
AWS_ACCESS_KEY_ID=sua-key
AWS_SECRET_ACCESS_KEY=sua-secret
AWS_REGION=us-east-1
AWS_BUCKET_NAME=sistema-manutencao
```

---

## 🔄 Atualizações Automáticas

O Vercel faz deploy automático sempre que você fizer push para o GitHub:

```bash
git add .
git commit -m "Atualização do sistema"
git push github master
```

Em poucos minutos, as mudanças estarão no ar!

---

## 🐛 Solução de Problemas

### Erro: "Cannot connect to database"

- Verifique se a DATABASE_URL está correta
- Teste a conexão no PlanetScale/Railway
- Certifique-se de que executou `pnpm db:push`

### Erro: "Email not sending"

- Verifique credenciais SMTP
- Teste envio manual com Nodemailer
- Verifique se o Gmail permite "apps menos seguros"

### Página em branco

- Verifique logs no Vercel Dashboard
- Confirme que todas as variáveis de ambiente estão configuradas
- Teste localmente primeiro com `pnpm dev`

### Imagens não carregam

- Configure storage alternativo (Cloudinary/Vercel Blob)
- Ou desabilite temporariamente upload de imagens

---

## 📊 Monitoramento

No painel do Vercel você pode ver:
- 📈 Tráfego e visitantes
- 🐛 Logs de erros
- ⚡ Performance
- 💾 Uso de banda

---

## 💰 Custos

### Plano Gratuito do Vercel Inclui:

- ✅ 100 GB de banda por mês
- ✅ Builds ilimitados
- ✅ SSL automático
- ✅ Domínio personalizado
- ✅ Deploy automático

### PlanetScale Gratuito Inclui:

- ✅ 1 banco de dados
- ✅ 5 GB de armazenamento
- ✅ 1 bilhão de leituras/mês

**Total: R$ 0,00/mês** 🎉

---

## 🆘 Precisa de Ajuda?

- Documentação Vercel: https://vercel.com/docs
- Documentação PlanetScale: https://planetscale.com/docs
- GitHub Issues: Abra uma issue no repositório

---

## ✨ Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Configure domínio personalizado
2. ✅ Adicione Google Analytics
3. ✅ Configure backups automáticos do banco
4. ✅ Implemente monitoramento de uptime
5. ✅ Adicione testes automatizados

---

**Boa sorte com seu deploy! 🚀**

Se tiver dúvidas, consulte a documentação ou abra uma issue no GitHub.
