import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Send, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";

export default function Settings() {
  const [notificationEmail, setNotificationEmail] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [showSmtpForm, setShowSmtpForm] = useState(false);

  const { data: emailSetting, isLoading } = trpc.settings.get.useQuery({ key: "notification_email" });
  const { data: allSettings } = trpc.settings.list.useQuery();

  const setSetting = trpc.settings.set.useMutation({
    onSuccess: () => {
      toast.success("Configuração atualizada com sucesso!");
    },
  });

  const testEmailMutation = trpc.settings.testEmail.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("E-mail de teste enviado com sucesso!");
      } else {
        toast.error("Falha ao enviar e-mail de teste. Verifique as configurações SMTP.");
      }
    },
  });

  useEffect(() => {
    if (emailSetting?.value) {
      setNotificationEmail(emailSetting.value);
    } else if (allSettings && allSettings.length > 0) {
      const setting = allSettings.find((s: any) => s.key === "notification_email");
      if (setting?.value) {
        setNotificationEmail(setting.value);
      }
      
      const host = allSettings.find((s: any) => s.key === "smtp_host");
      const port = allSettings.find((s: any) => s.key === "smtp_port");
      const user = allSettings.find((s: any) => s.key === "smtp_user");
      const pass = allSettings.find((s: any) => s.key === "smtp_pass");
      
      if (host?.value) setSmtpHost(host.value);
      if (port?.value) setSmtpPort(port.value);
      if (user?.value) setSmtpUser(user.value);
      if (pass?.value) setSmtpPass(pass.value);
    }
  }, [emailSetting, allSettings]);

  const handleSaveEmail = () => {
    if (!notificationEmail.trim()) {
      toast.error("Digite um e-mail válido");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notificationEmail)) {
      toast.error("Digite um e-mail válido");
      return;
    }

    setSetting.mutate({
      key: "notification_email",
      value: notificationEmail,
      description: "E-mail que receberá notificações de novos chamados e atualizações",
    });
  };

  const handleTestEmail = () => {
    if (!testEmail.trim()) {
      toast.error("Digite um e-mail para teste");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast.error("Digite um e-mail válido");
      return;
    }

    testEmailMutation.mutate({ email: testEmail });
  };

  const handleSaveSmtp = () => {
    if (!smtpHost.trim() || !smtpUser.trim() || !smtpPass.trim()) {
      toast.error("Preencha todos os campos SMTP");
      return;
    }

    setSetting.mutate({ key: "smtp_host", value: smtpHost, description: "Servidor SMTP" });
    setSetting.mutate({ key: "smtp_port", value: smtpPort, description: "Porta SMTP" });
    setSetting.mutate({ key: "smtp_user", value: smtpUser, description: "Usuário SMTP" });
    setSetting.mutate({ key: "smtp_pass", value: smtpPass, description: "Senha SMTP" });
    
    toast.success("Configurações SMTP salvas com sucesso!");
    setShowSmtpForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Configurações do Sistema - Sesc Guará</h1>
            <p className="text-gray-600 mt-1">Configure as preferências do sistema de manutenção</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">← Voltar ao Painel</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* E-mail de Notificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                E-mail de Notificação
              </CardTitle>
              <CardDescription>
                Configure o e-mail que receberá notificações de novos chamados e atualizações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="notificationEmail">E-mail de Notificação</Label>
                    <Input
                      id="notificationEmail"
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      placeholder="notificacoes@empresa.com"
                    />
                    <p className="text-sm text-muted-foreground">
                      Este e-mail receberá notificações automáticas quando novos chamados forem abertos
                      ou quando houver mudanças de status.
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveEmail}
                    disabled={setSetting.isPending}
                    className="w-full"
                  >
                    {setSetting.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar E-mail"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Teste de E-mail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Testar Configuração de E-mail
              </CardTitle>
              <CardDescription>
                Envie um e-mail de teste para verificar se a configuração SMTP está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">E-mail para Teste</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
                <p className="text-sm text-muted-foreground">
                  Digite um e-mail para receber uma mensagem de teste e verificar se o sistema
                  está enviando e-mails corretamente.
                </p>
              </div>
              <Button
                onClick={handleTestEmail}
                disabled={testEmailMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {testEmailMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar E-mail de Teste
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Configurações SMTP */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Configurações SMTP
            </CardTitle>
            <CardDescription>
              Configure as credenciais do servidor SMTP para envio de e-mails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showSmtpForm ? (
              <Button
                onClick={() => setShowSmtpForm(true)}
                className="w-full"
              >
                Configurar SMTP
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Servidor SMTP</Label>
                  <Input
                    id="smtpHost"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Porta</Label>
                    <Input
                      id="smtpPort"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Usuário/E-mail</Label>
                  <Input
                    id="smtpUser"
                    type="email"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPass">Senha</Label>
                  <Input
                    id="smtpPass"
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="Sua senha"
                  />
                  <p className="text-sm text-muted-foreground">
                    Para Gmail, use uma senha de aplicativo em vez da senha da conta.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveSmtp}
                    disabled={setSetting.isPending}
                    className="flex-1"
                  >
                    {setSetting.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Configurações"
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowSmtpForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
