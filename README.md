# Sistema de Gerenciamento de Chamados de Manutenção - Sesc Guará

Sistema profissional para abertura, acompanhamento e gerenciamento de solicitações de manutenção desenvolvido para o Sesc Guará.

![Logo Sesc](client/public/sesc-logo.png)

## 🚀 Funcionalidades

### Para Usuários
- **Abertura Rápida de Chamados**: Formulário intuitivo com upload de fotos e geração automática de número
- **Acompanhamento em Tempo Real**: Consulta de status e histórico usando o número do chamado
- **Sistema de Avaliação**: Avaliação pós-serviço com estrelas (1-5) e comentários opcionais
- **Notificações Automáticas**: E-mails automáticos para solicitante e equipe de manutenção

### Para Administradores
- **Painel Kanban**: Visualização organizada por status (Aberto, Em Execução, Finalizado)
- **Drag and Drop**: Mova chamados entre status arrastando e soltando
- **Gerenciamento de Responsáveis**: Cadastro e atribuição de técnicos
- **Estatísticas em Tempo Real**: Métricas de chamados, taxa de conclusão e avaliações
- **Histórico Completo**: Timeline de todas as atualizações de cada chamado
- **Configurações Flexíveis**: E-mail de notificação e credenciais SMTP configuráveis

## 🛠️ Tecnologias

### Frontend
- **React 19** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset tipado de JavaScript
- **Tailwind CSS 4** - Framework CSS utility-first
- **Wouter** - Roteamento leve para React
- **shadcn/ui** - Componentes de UI reutilizáveis
- **Lucide React** - Ícones modernos
- **tRPC** - Type-safe API calls
- **TanStack Query** - Gerenciamento de estado assíncrono

### Backend
- **Node.js** - Runtime JavaScript
- **Express 4** - Framework web minimalista
- **tRPC 11** - End-to-end typesafe APIs
- **Drizzle ORM** - TypeScript ORM
- **MySQL/TiDB** - Banco de dados relacional
- **Nodemailer** - Envio de e-mails SMTP
- **Superjson** - Serialização de tipos complexos

### Infraestrutura
- **S3** - Armazenamento de imagens
- **OAuth** - Autenticação Manus
- **Vite** - Build tool e dev server

## 📋 Pré-requisitos

- Node.js 22.x ou superior
- pnpm (gerenciador de pacotes)
- MySQL ou TiDB (banco de dados)
- Conta SMTP para envio de e-mails (Gmail, Outlook, etc.)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/sistema-manutencao-sesc-guara.git
cd sistema-manutencao-sesc-guara
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL=mysql://usuario:senha@host:porta/database

# SMTP (opcional - pode ser configurado via interface)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app

# OAuth (fornecido pela plataforma Manus)
JWT_SECRET=seu-jwt-secret
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=seu-owner-open-id
OWNER_NAME=Seu Nome

# S3 Storage (fornecido pela plataforma Manus)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua-api-key
VITE_FRONTEND_FORGE_API_KEY=sua-frontend-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# App
VITE_APP_TITLE=Manutenção Sesc Guará
VITE_APP_LOGO=/sesc-logo.png
VITE_APP_URL=http://localhost:3000
```

4. Execute as migrações do banco de dados:
```bash
pnpm db:push
```

5. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

O sistema estará disponível em `http://localhost:3000`

## 📦 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Importe o projeto no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Node.js:
- Railway
- Render
- Heroku
- AWS
- Google Cloud

## 🗂️ Estrutura do Projeto

```
sistema-manutencao/
├── client/                 # Frontend React
│   ├── public/            # Arquivos estáticos
│   └── src/
│       ├── pages/         # Páginas da aplicação
│       ├── components/    # Componentes reutilizáveis
│       ├── lib/           # Configurações (tRPC)
│       └── hooks/         # React hooks customizados
├── server/                # Backend Express + tRPC
│   ├── routers.ts        # Definição de rotas tRPC
│   ├── db.ts             # Helpers de banco de dados
│   ├── email.ts          # Sistema de e-mails
│   └── _core/            # Infraestrutura (OAuth, context)
├── drizzle/              # Schema e migrações do banco
│   └── schema.ts         # Definição de tabelas
├── storage/              # Helpers S3
└── shared/               # Tipos e constantes compartilhadas
```

## 🎨 Personalização

### Cores e Tema

As cores do sistema podem ser personalizadas em `client/src/index.css`:

```css
:root {
  --primary: 220 90% 56%;      /* Azul */
  --secondary: 45 93% 47%;     /* Amarelo */
  /* ... outras variáveis */
}
```

### Logo

Substitua o arquivo `client/public/sesc-logo.png` pela sua logo.

### E-mail de Notificação

Configure o e-mail padrão através do painel administrativo em **Configurações**.

## 📧 Configuração de E-mail

### Gmail

1. Ative a verificação em duas etapas na sua conta Google
2. Gere uma senha de app em https://myaccount.google.com/apppasswords
3. Use as credenciais:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: `seu-email@gmail.com`
   - Pass: `senha-de-app-gerada`

### Outlook

- Host: `smtp-mail.outlook.com`
- Port: `587`
- User: `seu-email@outlook.com`
- Pass: `sua-senha`

## 🔐 Segurança

- Senhas SMTP são armazenadas de forma segura no banco de dados
- Autenticação via OAuth para área administrativa
- Upload de imagens com validação de tipo e tamanho
- Proteção contra SQL injection via Drizzle ORM
- HTTPS obrigatório em produção

## 📊 Banco de Dados

### Tabelas Principais

- **users**: Usuários administrativos
- **tickets**: Chamados de manutenção
- **technicians**: Responsáveis pela manutenção
- **ratings**: Avaliações pós-serviço
- **ticket_history**: Histórico de atualizações
- **settings**: Configurações do sistema

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto foi desenvolvido para o Sesc Guará.

## 👨‍💻 Autor

**Everton Carlos**

## 🙏 Agradecimentos

- Sesc Guará pela oportunidade
- Comunidade open source pelas ferramentas incríveis

---

© 2025 Manutenção Sesc Guará. Todos os direitos reservados.
