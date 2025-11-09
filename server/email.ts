import nodemailer from 'nodemailer';
import { getNotificationEmail } from './db';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Cria um transporter do Nodemailer com as credenciais SMTP
 * Primeiro tenta usar credenciais do banco de dados, depois variáveis de ambiente
 */
async function createTransporter() {
  let host = process.env.SMTP_HOST;
  let port = parseInt(process.env.SMTP_PORT || '587');
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;
  
  // Tentar obter credenciais do banco de dados
  try {
    const dbHost = await getSmtpSetting('smtp_host');
    const dbPort = await getSmtpSetting('smtp_port');
    const dbUser = await getSmtpSetting('smtp_user');
    const dbPass = await getSmtpSetting('smtp_pass');
    
    if (dbHost && dbUser && dbPass) {
      host = dbHost;
      port = parseInt(dbPort || '587');
      user = dbUser;
      pass = dbPass;
      console.log('[Email] Usando credenciais SMTP do banco de dados');
    }
  } catch (error) {
    console.log('[Email] Usando credenciais SMTP das variáveis de ambiente');
  }
  
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
    secure: false,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Obtém uma configuração SMTP do banco de dados
 */
async function getSmtpSetting(key: string): Promise<string | null> {
  try {
    const db = await import('./db');
    const setting = await db.getSetting(key);
    return setting?.value || null;
  } catch (error) {
    console.log('[Email] Não foi possível obter configuração do banco:', key);
    return null;
  }
}

/**
 * Envia um e-mail
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = await createTransporter();
    
    console.log('[Email] Tentando enviar e-mail para:', options.to);
    
    const smtpUser = process.env.SMTP_USER || 'noreply@sistema-manutencao.com';
    
    const info = await transporter.sendMail({
      from: `"Sistema de Manutenção" <${smtpUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[Email] ✓ Enviado com sucesso para ${options.to}:`, info.messageId);
    return true;
  } catch (error) {
    console.error('[Email] ✗ Erro ao enviar e-mail:', {
      error: error instanceof Error ? error.message : String(error),
      to: options.to,
      subject: options.subject,
    });
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
            <a href="https://seu-site.com/admin" class="button">
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
      subject: `🔧 Novo Chamado #${ticket.ticketNumber} - ${problemTypeLabels[ticket.problemType]}`,
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
        .ticket-number { font-size: 24px; font-weight: bold; color: #10b981; margin: 20px 0; }
        .info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Chamado Recebido</h1>
        </div>
        <div class="content">
          <p>Olá ${ticket.requesterName},</p>
          
          <p>Seu chamado de manutenção foi recebido com sucesso! Aqui estão os detalhes:</p>
          
          <div class="ticket-number">
            Número do Chamado: #${ticket.ticketNumber}
          </div>
          
          <div class="info">
            <p><strong>Localidade:</strong> ${ticket.location}</p>
            <p><strong>Tipo de Problema:</strong> ${problemTypeLabels[ticket.problemType]}</p>
            <p><strong>Urgência:</strong> ${ticket.urgency.toUpperCase()}</p>
          </div>
          
          <p>Você pode acompanhar o status do seu chamado usando o número acima no sistema.</p>
          
          <p>Obrigado por usar nosso sistema de manutenção!</p>
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
    subject: `✓ Chamado #${ticket.ticketNumber} Recebido`,
    html,
  });
}

/**
 * Envia notificação de mudança de status
 */
export async function sendStatusChangeNotification(ticket: {
  ticketNumber: string;
  requesterEmail: string;
  requesterName: string;
  newStatus: string;
  notes?: string;
}) {
  const statusLabels: Record<string, string> = {
    aberto: 'Aberto',
    em_execucao: 'Em Execução',
    finalizado: 'Finalizado',
  };

  const statusColors: Record<string, string> = {
    aberto: '#3b82f6',
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
        .header { background: ${statusColors[ticket.newStatus] || '#6b7280'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .status-badge { display: inline-block; padding: 8px 16px; background: ${statusColors[ticket.newStatus] || '#6b7280'}; color: white; border-radius: 6px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Atualização de Status</h1>
        </div>
        <div class="content">
          <p>Olá ${ticket.requesterName},</p>
          
          <p>O status do seu chamado foi atualizado:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="status-badge">${statusLabels[ticket.newStatus]}</span>
          </div>
          
          <p><strong>Número do Chamado:</strong> #${ticket.ticketNumber}</p>
          
          ${ticket.notes ? `<p><strong>Observações:</strong> ${ticket.notes}</p>` : ''}
          
          <p>Obrigado!</p>
        </div>
        <div class="footer">
          <p>Sistema de Manutenção - Notificação Automática</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: ticket.requesterEmail,
    subject: `📋 Chamado #${ticket.ticketNumber} - Status: ${statusLabels[ticket.newStatus]}`,
    html,
  });
}

/**
 * Envia solicitação de avaliação
 */
export async function sendRatingRequest(ticket: {
  ticketNumber: string;
  requesterEmail: string;
  requesterName: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #fbbf24; color: #1f2937; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 24px; background: #fbbf24; color: #1f2937; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⭐ Sua Opinião é Importante</h1>
        </div>
        <div class="content">
          <p>Olá ${ticket.requesterName},</p>
          
          <p>O serviço referente ao chamado <strong>#${ticket.ticketNumber}</strong> foi finalizado.</p>
          
          <p>Gostaríamos de saber sua opinião sobre o atendimento. Sua avaliação nos ajuda a melhorar continuamente!</p>
          
          <div style="text-align: center;">
            <a href="https://seu-site.com/avaliar/${ticket.ticketNumber}" class="button">Avaliar Serviço</a>
          </div>
          
          <p>Obrigado!</p>
        </div>
        <div class="footer">
          <p>Sistema de Manutenção - Solicitação de Avaliação</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: ticket.requesterEmail,
    subject: `⭐ Avalie o Serviço - Chamado #${ticket.ticketNumber}`,
    html,
  });
}
