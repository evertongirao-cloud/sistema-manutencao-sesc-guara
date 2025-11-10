import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, Calendar, User, MapPin, Star } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

const problemTypeLabels: Record<string, string> = {
  eletrica: "⚡ Elétrica",
  hidraulica: "💧 Hidráulica",
  informatica: "💻 Informática",
  limpeza: "🧹 Limpeza",
  estrutural: "🏗️ Estrutural",
  outros: "📦 Outros",
};

const urgencyColors: Record<string, string> = {
  baixa: "bg-green-100 text-green-800",
  media: "bg-yellow-100 text-yellow-800",
  alta: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_execucao: "Em Execução",
  finalizado: "Finalizado",
};

const statusColors: Record<string, string> = {
  aberto: "bg-gray-100 text-gray-800",
  em_execucao: "bg-blue-100 text-blue-800",
  finalizado: "bg-green-100 text-green-800",
};

export default function TrackTicket() {
  const params = useParams();
  const ticketNumberFromUrl = params.ticketNumber;

  const [ticketNumber, setTicketNumber] = useState(ticketNumberFromUrl || "");
  const [searchedNumber, setSearchedNumber] = useState(ticketNumberFromUrl || "");
  
  // Rating state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: ticket, isLoading, error } = trpc.tickets.getByNumber.useQuery(
    { ticketNumber: searchedNumber },
    { enabled: !!searchedNumber }
  );

  const { data: history } = trpc.tickets.getHistory.useQuery(
    { ticketId: ticket?.id || 0 },
    { enabled: !!ticket }
  );

  const { data: existingRating, refetch: refetchRating } = trpc.ratings.getByTicket.useQuery(
    { ticketId: ticket?.id || 0 },
    { enabled: !!ticket }
  );

  const createRating = trpc.ratings.create.useMutation({
    onSuccess: () => {
      toast.success("Avaliação enviada com sucesso!");
      refetchRating();
      setRating(0);
      setComment("");
    },
    onError: (error) => {
      toast.error(`Erro ao enviar avaliação: ${error.message}`);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketNumber.trim()) {
      setSearchedNumber(ticketNumber.trim());
    }
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Por favor, selecione uma avaliação de 1 a 5 estrelas");
      return;
    }

    if (!ticket) return;

    createRating.mutate({
      ticketId: ticket.id,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/sesc-logo.png" alt="Sesc" className="h-16 object-contain" />
          </Link>
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">← Voltar ao Início</Link>
        </div>
      </header>
      <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Acompanhar Chamado</h1>
          <p className="text-gray-600">Digite o número do chamado para consultar o status</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Digite o número do chamado (ex: MNT-20250108-0001)"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Chamado não encontrado. Verifique o número e tente novamente.
            </AlertDescription>
          </Alert>
        )}

        {ticket && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      Chamado #{ticket.ticketNumber}
                    </CardTitle>
                    <CardDescription>
                      Aberto em {new Date(ticket.createdAt).toLocaleString("pt-BR")}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[ticket.status]}>
                    {statusLabels[ticket.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Tipo de Problema</Label>
                    <p className="text-lg font-medium">{problemTypeLabels[ticket.problemType]}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Urgência</Label>
                    <div className="mt-1">
                      <Badge className={urgencyColors[ticket.urgency]}>
                        {ticket.urgency.charAt(0).toUpperCase() + ticket.urgency.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Localidade</Label>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {ticket.location}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Solicitante</Label>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {ticket.requesterName}
                    </p>
                  </div>
                  {ticket.estimatedCompletion && (
                    <div>
                      <Label className="text-muted-foreground">Previsão de Conclusão</Label>
                      <p className="text-lg font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(ticket.estimatedCompletion).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground">Descrição do Problema</Label>
                  <p className="mt-2 p-4 bg-gray-50 rounded-lg">{ticket.description}</p>
                </div>

                {ticket.imageUrl && (
                  <div>
                    <Label className="text-muted-foreground">Foto do Problema</Label>
                    <img
                      src={ticket.imageUrl}
                      alt="Problema"
                      className="mt-2 rounded-lg max-h-96 object-contain border"
                    />
                  </div>
                )}

                {ticket.notes && (
                  <div>
                    <Label className="text-muted-foreground">Observações da Equipe</Label>
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg whitespace-pre-wrap">
                      {ticket.notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {history && history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Atualizações</CardTitle>
                  <CardDescription>
                    Acompanhe todas as atualizações do seu chamado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex gap-4 ${index !== history.length - 1 ? "pb-4 border-b" : ""}`}
                      >
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                          {index !== history.length - 1 && (
                            <div className="flex-1 w-0.5 bg-blue-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.performedBy} -{" "}
                            {new Date(item.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Avaliação inline para chamados finalizados */}
            {ticket.status === "finalizado" && !existingRating && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Avalie o Serviço
                  </CardTitle>
                  <CardDescription>
                    Seu chamado foi finalizado. Que tal avaliar o atendimento?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRatingSubmit} className="space-y-4">
                    <div>
                      <Label>Avaliação *</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-10 w-10 ${
                                star <= (hoverRating || rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Você selecionou {rating} {rating === 1 ? "estrela" : "estrelas"}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="comment">Comentário (opcional)</Label>
                      <Textarea
                        id="comment"
                        placeholder="Conte-nos sobre sua experiência..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createRating.isPending || rating === 0}
                    >
                      {createRating.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar Avaliação"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Avaliação já enviada */}
            {existingRating && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Avaliação Enviada</CardTitle>
                  <CardDescription>
                    Obrigado por avaliar nosso serviço!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < existingRating.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {existingRating.comment && (
                    <p className="mt-3 p-3 bg-white rounded-lg text-sm">{existingRating.comment}</p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">← Voltar ao Início</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/novo-chamado">Abrir Novo Chamado</Link>
              </Button>
            </div>
          </div>
        )
      }
      </div>
      </div>
    </div>
  );
}
