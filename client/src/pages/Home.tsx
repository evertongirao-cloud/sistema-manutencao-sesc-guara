import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, LayoutDashboard, Star, CheckCircle2, Clock, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  const { data: ticketStats, isLoading: loadingTickets } = trpc.tickets.stats.useQuery();
  const { data: ratingStats, isLoading: loadingRatings } = trpc.ratings.stats.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <img src="/sesc-logo.png" alt="Sesc" className="h-16 object-contain" />
          </Link>
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

        {/* Estatísticas */}
        <div className="max-w-6xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Estatísticas do Sistema</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loadingTickets ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : ticketStats ? (
              <>
                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total de Chamados</p>
                        <p className="text-3xl font-bold text-gray-900">{ticketStats.totalTickets}</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Finalizados</p>
                        <p className="text-3xl font-bold text-green-600">{ticketStats.completedTickets}</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Em Execução</p>
                        <p className="text-3xl font-bold text-yellow-600">{ticketStats.inProgressTickets}</p>
                      </div>
                      <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                        <p className="text-3xl font-bold text-blue-600">{ticketStats.completionRate}%</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>

          {/* Painel de Avaliações */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Avaliações Recebidas
              </CardTitle>
              <CardDescription>
                Feedback dos usuários sobre os serviços prestados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRatings ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : ratingStats && ratingStats.totalRatings > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-yellow-500">{ratingStats.averageRating}</div>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(ratingStats.averageRating)
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Média Geral</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">
                        {ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'avaliação' : 'avaliações'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Obrigado por nos ajudar a melhorar nossos serviços!
                      </p>
                    </div>
                  </div>

                  {ratingStats.recentRatings.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Avaliações Recentes</h4>
                      <div className="space-y-4">
                        {ratingStats.recentRatings.map((rating: any) => (
                          <div key={rating.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= rating.rating
                                        ? "fill-yellow-500 text-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(rating.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            {rating.comment && (
                              <p className="text-sm text-gray-700">{rating.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma avaliação recebida ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cards de Ação */}
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
              <Button className="w-full">Criar Chamado</Button>
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
              <Button variant="outline" className="w-full">Buscar Chamado</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = isAuthenticated ? '/admin' : getLoginUrl()}>
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
              <Button variant="outline" className="w-full">Acessar Painel</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Funcionalidades do Sistema */}
      <section className="bg-white py-20">
        <div className="container">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Funcionalidades do Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Abertura Rápida</h4>
              <p className="text-gray-600 text-sm">
                Formulário intuitivo com upload de fotos e geração automática de número
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Notificações</h4>
              <p className="text-gray-600 text-sm">
                E-mails automáticos para solicitante e equipe de manutenção
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Painel Kanban</h4>
              <p className="text-gray-600 text-sm">
                Visualização organizada por status: Aberto, Em Execução, Finalizado
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Avaliação</h4>
              <p className="text-gray-600 text-sm">
                Sistema de avaliação pós-serviço com estrelas e comentários
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container">
          <div className="flex flex-col items-center gap-6">
            <img src="/sesc-logo.png" alt="Sesc" className="h-16 object-contain opacity-80" />
            <p className="text-center text-blue-200">
              © 2025 Manutenção Sesc Guará. Todos os direitos reservados.
            </p>
            <p className="text-sm text-blue-300">
              Criado por Everton Carlos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
