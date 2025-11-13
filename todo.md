# Sistema de Manutenção - TODO

## Banco de Dados
- [x] Criar tabela de chamados (tickets) com todos os campos necessários
- [x] Criar tabela de responsáveis pela manutenção
- [x] Criar tabela de avaliações
- [x] Implementar helpers de banco de dados para CRUD de chamados
- [x] Implementar helpers para responsáveis e avaliações

## Sistema de E-mail
- [x] Configurar sistema de envio de e-mail SMTP (Outlook)
- [x] Criar template de e-mail para notificação de novo chamado
- [x] Criar template de e-mail para confirmação ao solicitante
- [x] Criar template de e-mail para notificação de mudança de status
- [x] Criar template de e-mail para solicitação de avaliação

## Backend API
- [x] Criar endpoint para abertura de chamado (público)
- [x] Criar endpoint para upload de imagem do problema
- [x] Criar endpoint para listar todos os chamados
- [x] Criar endpoint para atualizar status do chamado
- [x] Criar endpoint para designar responsável
- [x] Criar endpoint para adicionar observações/atualizações
- [x] Criar endpoint para buscar chamado por número
- [x] Criar endpoint para filtrar chamados (status, tipo, localidade, urgência)
- [x] Criar endpoint para excluir chamado
- [x] Criar endpoint para submeter avaliação
- [x] Criar endpoint para listar responsáveis
- [x] Criar endpoint para adicionar/editar responsáveis

## Frontend - Abertura de Chamado
- [x] Criar página de abertura de chamado (acesso público)
- [x] Implementar formulário com validação de campos
- [x] Implementar upload de foto (JPG, PNG, até 5MB)
- [x] Exibir número do chamado gerado após envio
- [x] Mostrar mensagem de confirmação

## Frontend - Painel Administrativo
- [x] Criar layout dashboard com menu lateral
- [x] Implementar painel Kanban com 3 colunas (Aberto, Em Execução, Finalizado)
- [x] Implementar drag-and-drop para mover chamados entre status
- [x] Criar modal/drawer para visualizar detalhes do chamado
- [x] Implementar edição de chamado (designar responsável, adicionar observações)
- [x] Implementar filtros (tipo, localidade, urgência, status)
- [x] Implementar busca por número de chamado
- [x] Implementar funcionalidade de excluir chamado

## Frontend - Acompanhamento
- [x] Criar página de acompanhamento de chamado (busca por número)
- [x] Exibir informações do chamado (status, responsável, histórico)
- [x] Mostrar linha do tempo de atualizações

## Frontend - Avaliação
- [x] Criar página de avaliação pós-serviço
- [x] Implementar sistema de estrelas (1-5)
- [x] Adicionar campo de comentário opcional
- [x] Exibir confirmação após envio

## Frontend - Gerenciamento de Responsáveis
- [x] Criar página para listar responsáveis
- [x] Implementar adição de novos responsáveis
- [x] Implementar edição de responsáveis existentes

## Design e UX
- [x] Definir paleta de cores profissional
- [x] Configurar tema no Tailwind CSS
- [x] Adicionar ícones (Lucide React)
- [x] Garantir responsividade total (mobile, tablet, desktop)
- [x] Implementar estados de loading e feedback visual

## Configuração e Deploy
- [x] Configurar variáveis de ambiente para SMTP
- [x] Configurar e-mail de notificação padrão
- [x] Testar fluxo completo de abertura até avaliação
- [x] Criar checkpoint final

## Configurações do Sistema
- [x] Criar tabela de configurações no banco de dados
- [x] Implementar página de configurações para alterar e-mail de notificação
- [x] Permitir teste de envio de e-mail nas configurações


## Personalização
- [x] Alterar cores para azul e amarelo
- [x] Adicionar título "Manutenção Sesc Guará" no cabeçalho
- [x] Adicionar crédito "Criado por Everton Carlos" no rodapé

- [x] Gerar logo da Sesc Guará
- [x] Integrar logo no cabeçalho
- [x] Adicionar logo ao rodapé


## Manutenção
- [x] Reiniciar servidor de desenvolvimento

- [x] Substituir logo gerado pelo logo oficial do Sesc Fecomércio Senac
- [x] Configurar credenciais SMTP para envio de e-mail
- [x] Testar envio de e-mail de notificação

- [x] Adicionar atalho para voltar ao início em todas as páginas
- [x] Corrigir envio de e-mail para responsável quando chamado é aberto
- [x] Corrigir envio de e-mail para gerenciador quando chamado é aberto

- [x] Corrigir configuração SMTP e salvar credenciais corretamente

- [x] Investigar e corrigir falha de envio de e-mail SMTP

- [x] Armazenar credenciais SMTP no banco de dados de forma segura
- [x] Criar interface para gerenciar credenciais SMTP no painel administrativo
- [x] Testar envio de e-mail com credenciais armazenadas

- [x] Criar endpoint para buscar estatísticas de avaliações
- [x] Criar endpoint para buscar estatísticas de chamados executados
- [x] Adicionar painel de avaliações na página inicial
- [x] Adicionar painel de estatísticas de chamados na página inicial

- [x] Atualizar templates de e-mail com link para o site
- [x] Adicionar botão de avaliação na página de acompanhamento de chamados
- [x] Permitir avaliação direta de chamados finalizados sem precisar de link especial

- [x] Atualizar rodapé para 2025 em todas as páginas
- [x] Configurar repositório Git
- [x] Exportar projeto para GitHub

- [ ] Criar arquivo vercel.json
- [ ] Criar guia de deploy no Vercel
- [ ] Fazer push das alterações para GitHub
