import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";

export default function Settings() {
  const [notificationEmail, setNotificationEmail] = useState("");
  const [testEmail, setTestEmail] = useState("");

  const { data: emailSetting, isLoading } = trpc.settings.get.useQuery({ key: "notification_email" });
  const { data: allSettings } = trpc.settings.list.useQuery();

  const setSetting = trpc.settings.set.useMutation({
    onSuccess: () => {
      toast.success("E-mail de notificação atualizado com sucesso!");
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

        {/* Informações SMTP */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações SMTP</CardTitle>
            <CardDescription>
              As configurações SMTP são gerenciadas através de variáveis de ambiente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Informação:</strong> As credenciais SMTP (servidor, porta, usuário e senha)
                são configuradas de forma segura através de variáveis de ambiente. Para alterar essas
                configurações, entre em contato com o administrador do sistema.
              </p>
              <div className="mt-4 space-y-2 text-sm text-blue-800">
                <p><strong>Servidor SMTP:</strong> Configurado via SMTP_HOST</p>
                <p><strong>Porta:</strong> Configurada via SMTP_PORT</p>
                <p><strong>Usuário:</strong> Configurado via SMTP_USER</p>
                <p><strong>Senha:</strong> Configurada via SMTP_PASS (protegida)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
