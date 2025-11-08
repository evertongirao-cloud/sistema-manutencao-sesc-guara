import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/sesc-guara-logo-horizontal.png" alt="Sesc Guará" className="h-16 object-contain" />
          </div>
          {!isAuthenticated ? (
            <Button asChild>
              <a href={getLoginUrl()}>Área Administrativa</a>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/admin">Painel Administrativo</Link>
            </Button>
          )}
        </div>
      </header>

      <section className="container py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Gerenciamento de Chamados de Manutenção
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Sistema profissional para abertura, acompanhamento e gerenciamento de solicitações de manutenção
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/novo-chamado'}>
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Abrir Novo Chamado</CardTitle>
              <CardDescription>
                Registre um novo chamado de manutenção de forma rápida e simples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/novo-chamado">Criar Chamado</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/acompanhar'}>
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Acompanhar Chamado</CardTitle>
              <CardDescription>
                Consulte o status e histórico do seu chamado usando o número
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/acompanhar">Buscar Chamado</Link>
              </Button>
            </CardContent>
          </Card>

          {isAuthenticated && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin'}>
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Painel Administrativo</CardTitle>
                <CardDescription>
                  Gerencie todos os chamados e responsáveis pela manutenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin">Acessar Painel</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Funcionalidades do Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Abertura Rápida</h4>
              <p className="text-gray-600 text-sm">
                Formulário intuitivo com upload de fotos e geração automática de número
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Notificações</h4>
              <p className="text-gray-600 text-sm">
                E-mails automáticos para solicitante e equipe de manutenção
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Painel Kanban</h4>
              <p className="text-gray-600 text-sm">
                Visualização organizada por status: Aberto, Em Execução, Finalizado
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Avaliação</h4>
              <p className="text-gray-600 text-sm">
                Sistema de avaliação pós-serviço com estrelas e comentários
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-blue-900 text-white py-8">
        <div className="container">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src="/sesc-guara-logo-horizontal.png" alt="Sesc Guará" className="h-12 object-contain" />
          </div>
          <p className="text-blue-200 text-center">
            © 2024 Manutenção Sesc Guará. Todos os direitos reservados.
          </p>
          <p className="text-blue-300 text-sm mt-2 text-center">
            Criado por Everton Carlos
          </p>
        </div>
      </footer>
    </div>
  );
}
