import nodemailer from 'nodemailer';
import { getNotificationEmail } from './db';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Cria um transporter do Nodemailer com as credenciais SMTP
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  console.log('[Email] Configuração SMTP:', {
    host,
    port,
    user,
    passLength: pass ? pass.length : 0,
  });
  
  if (!host || !user || !pass) {
    console.error('[Email] Credenciais SMTP incompletas:', {
      host: !!host,
      user: !!user,
      pass: !!pass,
    });
  }
  
  return nodemailer.createTransport({
    host,
    port,
    secure: false, // true para 465, false para outras portas
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Envia um e-mail
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"Sistema de Manutenção" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[Email] Enviado para ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('[Email] Erro ao enviar e-mail:', error);
    return false;
  }
}

/**
 * Envia notificação de novo chamado para o administrador e responsável
 */
export async function sendNewTicketNotification(ticket: {
  ticketNumber: string;
  requesterName: string;
  requesterEmail: string;
  location: string;
  problemType: string;
  description: string;
  urgency: string;
  imageUrl?: string | null;
  responsibleEmail?: string | null;
}) {
  const notificationEmail = await getNotificationEmail();
  
  if (!notificationEmail) {
    console.warn('[Email] E-mail de notificação não configurado');
    return false;
  }
  
  const emailsToSend = [notificationEmail];
  if (ticket.responsibleEmail && ticket.responsibleEmail !== notificationEmail) {
    emailsToSend.push(ticket.responsibleEmail);
  }

  const urgencyColors: Record<string, string> = {
    baixa: '#10b981',
    media: '#f59e0b',
    alta: '#ef4444',
  };

  const problemTypeLabels: Record<string, string> = {
    eletrica: 'Elétrica',
    hidraulica: 'Hidráulica',
    informatica: 'Informática',
    limpeza: 'Limpeza',
    estrutural: 'Estrutural',
    outros: 'Outros',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-row { margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #6b7280; display: inline-block; width: 150px; }
        .value { color: #111827; }
        .urgency-badge { 
          display: inline-block; 
          padding: 4px 12px; 
          border-radius: 12px; 
          color: white; 
          font-weight: bold;
          background: ${urgencyColors[ticket.urgency] || '#6b7280'};
        }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #2563eb; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Novo Chamado de Manutenção</h1>
        </div>
        <div class="content">
          <p>Um novo chamado foi aberto no sistema:</p>
          
          <div class="ticket-info">
            <div class="info-row">
              <span class="label">Número do Chamado:</span>
              <span class="value"><strong>${ticket.ticketNumber}</strong></span>
            </div>
            <div class="info-row">
              <span class="label">Solicitante:</span>
              <span class="value">${ticket.requesterName}</span>
            </div>
            <div class="info-row">
              <span class="label">E-mail:</span>
              <span class="value">${ticket.requesterEmail}</span>
            </div>
            <div class="info-row">
              <span class="label">Localidade:</span>
              <span class="value">${ticket.location}</span>
            </div>
            <div class="info-row">
              <span class="label">Tipo de Problema:</span>
              <span class="value">${problemTypeLabels[ticket.problemType] || ticket.problemType}</span>
            </div>
            <div class="info-row">
              <span class="label">Urgência:</span>
              <span class="urgency-badge">${ticket.urgency.toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span class="label">Descrição:</span>
              <div class="value" style="margin-top: 10px;">${ticket.description}</div>
            </div>
            ${ticket.imageUrl ? `
            <div class="info-row">
              <span class="label">Imagem:</span>
              <div class="value" style="margin-top: 10px;">
                <img src="${ticket.imageUrl}" alt="Foto do problema" style="max-width: 100%; border-radius: 8px;">
              </div>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center;">
            <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://seu-site.com'}/admin" class="button">
              Acessar Painel de Manutenção
            </a>
          </div>
        </div>
        <div class="footer">
          <p>Sistema de Manutenção - Notificação Automática</p>
        </div>
      </div>
    </body>
    </html>
  `;

  let allSent = true;
  for (const email of emailsToSend) {
    const sent = await sendEmail({
      to: email,
      subject: `\ud83d\udd27 Novo Chamado #${ticket.ticketNumber} - ${problemTypeLabels[ticket.problemType]}`,
      html,
    });
    if (!sent) allSent = false;
  }
  return allSent;
}

/**
 * Envia confirmação de abertura de chamado para o solicitante
 */
export async function sendTicketConfirmation(ticket: {
  ticketNumber: string;
  requesterName: string;
  requesterEmail: string;
  location: string;
  problemType: string;
  description: string;
  urgency: string;
}) {
  const problemTypeLabels: Record<string, string> = {
    eletrica: 'Elétrica',
    hidraulica: 'Hidráulica',
    informatica: 'Informática',
    limpeza: 'Limpeza',
    estrutural: 'Estrutural',
    outros: 'Outros',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .ticket-number { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; margin: 20px 0; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Chamado Recebido com Sucesso!</h1>
        </div>
        <div class="content">
          <p>Olá <strong>${ticket.requesterName}</strong>,</p>
          <p>Seu chamado foi registrado com sucesso em nosso sistema. Anote o número do chamado para acompanhamento:</p>
          
          <div class="ticket-number">#${ticket.ticketNumber}</div>
          
          <div class="info-box">
            <h3>Resumo do Chamado:</h3>
            <p><strong>Localidade:</strong> ${ticket.location}</p>
            <p><strong>Tipo:</strong> ${problemTypeLabels[ticket.problemType]}</p>
            <p><strong>Urgência:</strong> ${ticket.urgency}</p>
            <p><strong>Descrição:</strong> ${ticket.description}</p>
          </div>

          <p>Nossa equipe de manutenção foi notificada e em breve entrará em contato para resolver o problema.</p>
          <p>Você receberá atualizações por e-mail conforme o andamento do chamado.</p>
        </div>
        <div class="footer">
          <p>Sistema de Manutenção - Confirmação Automática</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: ticket.requesterEmail,
    subject: `✅ Chamado #${ticket.ticketNumber} Recebido - Sistema de Manutenção`,
    html,
  });
}

/**
 * Envia notificação de mudança de status
 */
export async function sendStatusUpdateNotification(ticket: {
  ticketNumber: string;
  requesterEmail: string;
  requesterName: string;
  status: string;
  technicianName?: string;
}) {
  const statusLabels: Record<string, string> = {
    aberto: 'Aberto',
    em_execucao: 'Em Execução',
    finalizado: 'Finalizado',
  };

  const statusColors: Record<string, string> = {
    aberto: '#6b7280',
    em_execucao: '#f59e0b',
    finalizado: '#10b981',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${statusColors[ticket.status] || '#6b7280'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .status-badge { 
          display: inline-block; 
          padding: 8px 16px; 
          border-radius: 12px; 
          color: white; 
          font-weight: bold;
          background: ${statusColors[ticket.status] || '#6b7280'};
          font-size: 18px;
        }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Atualização do Chamado</h1>
        </div>
        <div class="content">
          <p>Olá <strong>${ticket.requesterName}</strong>,</p>
          <p>O status do seu chamado <strong>#${ticket.ticketNumber}</strong> foi atualizado:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span class="status-badge">${statusLabels[ticket.status]}</span>
          </div>

          ${ticket.technicianName ? `<p><strong>Responsável:</strong> ${ticket.technicianName}</p>` : ''}
          
          ${ticket.status === 'finalizado' ? `
            <p style="margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <strong>⭐ Avalie nosso serviço!</strong><br>
              Sua opinião é muito importante para nós. Por favor, avalie o atendimento recebido.
            </p>
          ` : ''}
        </div>
        <div class="footer">
          <p>Sistema de Manutenção - Atualização Automática</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: ticket.requesterEmail,
    subject: `🔔 Chamado #${ticket.ticketNumber} - ${statusLabels[ticket.status]}`,
    html,
  });
}

/**
 * Testa a configuração de e-mail
 */
export async function testEmailConfiguration(testEmail: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Teste de Configuração de E-mail</h1>
        </div>
        <div class="content">
          <p>Este é um e-mail de teste do Sistema de Manutenção.</p>
          <p>Se você recebeu esta mensagem, a configuração SMTP está funcionando corretamente!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: testEmail,
    subject: '✅ Teste de Configuração - Sistema de Manutenção',
    html,
  });
}
