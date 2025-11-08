import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function RateTicket() {
  const params = useParams();
  const ticketId = params.ticketId ? parseInt(params.ticketId) : 0;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: ticket, isLoading: ticketLoading } = trpc.tickets.getById.useQuery(
    { id: ticketId },
    { enabled: ticketId > 0 }
  );

  const { data: existingRating } = trpc.ratings.getByTicket.useQuery(
    { ticketId },
    { enabled: ticketId > 0 }
  );

  const createRating = trpc.ratings.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Avaliação enviada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao enviar avaliação: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Por favor, selecione uma avaliação de 1 a 5 estrelas");
      return;
    }

    createRating.mutate({
      ticketId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  if (ticketLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Chamado Não Encontrado</CardTitle>
            <CardDescription>
              Não foi possível encontrar o chamado solicitado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ticket.status !== "finalizado") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Chamado Ainda Não Finalizado</CardTitle>
            <CardDescription>
              Este chamado ainda está em andamento. A avaliação só pode ser feita após a finalização.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/acompanhar/${ticket.ticketNumber}`}>Acompanhar Chamado</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (existingRating || submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl text-green-600">Avaliação Recebida!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Obrigado por avaliar nosso serviço
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                Sua avaliação é muito importante para melhorarmos continuamente nossos serviços de manutenção.
              </AlertDescription>
            </Alert>

            {(existingRating || submitted) && (
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Label>Sua Avaliação:</Label>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < (existingRating?.rating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {(existingRating?.comment || comment) && (
                  <div>
                    <Label>Comentário:</Label>
                    <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                      {existingRating?.comment || comment}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">Voltar ao Início</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/acompanhar/${ticket.ticketNumber}`}>Ver Chamado</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container py-4">
          <img src="/sesc-guara-logo-horizontal.png" alt="Sesc Guará" className="h-16 object-contain" />
        </div>
      </header>
      <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">\u2b50 Avalie o Serviço</h1>
          <p className="text-lg text-gray-600">
            Sua opinião é muito importante para nós
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chamado #{ticket.ticketNumber}</CardTitle>
            <CardDescription>
              Finalizado em {ticket.completedAt ? new Date(ticket.completedAt).toLocaleDateString("pt-BR") : "N/A"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-lg">Como você avalia o atendimento?</Label>
                <div className="flex justify-center gap-2 py-4">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starValue = i + 1;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-12 w-12 ${
                            starValue <= (hoverRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm text-gray-600">
                    {rating === 1 && "Muito insatisfeito"}
                    {rating === 2 && "Insatisfeito"}
                    {rating === 3 && "Neutro"}
                    {rating === 4 && "Satisfeito"}
                    {rating === 5 && "Muito satisfeito"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Comentário (opcional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte-nos mais sobre sua experiência..."
                  rows={5}
                />
                <p className="text-sm text-muted-foreground">
                  Seus comentários nos ajudam a melhorar continuamente
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/acompanhar/${ticket.ticketNumber}`}>Cancelar</Link>
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createRating.isPending || rating === 0}
                >
                  {createRating.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Avaliação"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
