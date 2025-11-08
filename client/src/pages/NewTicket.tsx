import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function NewTicket() {
  const [formData, setFormData] = useState({
    requesterName: "",
    requesterEmail: "",
    location: "",
    problemType: "",
    description: "",
    urgency: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  const createTicket = trpc.tickets.create.useMutation({
    onSuccess: (data) => {
      setTicketNumber(data.ticketNumber);
      toast.success("Chamado criado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar chamado: ${error.message}`);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error("Apenas arquivos JPG e PNG são permitidos");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.requesterName || !formData.requesterEmail || !formData.location || 
        !formData.problemType || !formData.description || !formData.urgency) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    let imageData: string | undefined;
    let imageMimeType: string | undefined;

    if (imageFile && imagePreview) {
      imageData = imagePreview;
      imageMimeType = imageFile.type;
    }

    createTicket.mutate({
      ...formData,
      problemType: formData.problemType as any,
      urgency: formData.urgency as any,
      imageData,
      imageMimeType,
    });
  };

  if (ticketNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl text-green-600">Chamado Criado com Sucesso!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Anote o número do seu chamado para acompanhamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Número do Chamado</p>
              <p className="text-4xl font-bold text-blue-600">#{ticketNumber}</p>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você receberá um e-mail de confirmação com os detalhes do chamado. 
                Nossa equipe de manutenção foi notificada e entrará em contato em breve.
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setTicketNumber(null);
                  setFormData({
                    requesterName: "",
                    requesterEmail: "",
                    location: "",
                    problemType: "",
                    description: "",
                    urgency: "",
                  });
                  setImageFile(null);
                  setImagePreview(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Abrir Novo Chamado
              </Button>
              <Button 
                onClick={() => window.location.href = `/acompanhar/${ticketNumber}`}
                className="flex-1"
              >
                Acompanhar Chamado
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
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/sesc-logo.png" alt="Sesc" className="h-16 object-contain" />
          </Link>
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">← Voltar ao Início</Link>
        </div>
      </header>
      <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">\ud83d\udd27 Novo Chamado</h1>
        <p className="text-lg text-gray-600">Abra um novo chamado de manutenção</p>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Novo Chamado</CardTitle>
            <CardDescription>
              Preencha todos os campos abaixo para registrar seu chamado de manutenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="requesterName">Nome Completo *</Label>
                  <Input
                    id="requesterName"
                    value={formData.requesterName}
                    onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requesterEmail">E-mail *</Label>
                  <Input
                    id="requesterEmail"
                    type="email"
                    value={formData.requesterEmail}
                    onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localidade *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Sala 201, Prédio A"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="problemType">Tipo de Problema *</Label>
                  <Select value={formData.problemType} onValueChange={(value) => setFormData({ ...formData, problemType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eletrica">⚡ Elétrica</SelectItem>
                      <SelectItem value="hidraulica">💧 Hidráulica</SelectItem>
                      <SelectItem value="informatica">💻 Informática</SelectItem>
                      <SelectItem value="limpeza">🧹 Limpeza</SelectItem>
                      <SelectItem value="estrutural">🏗️ Estrutural</SelectItem>
                      <SelectItem value="outros">📦 Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Nível de Urgência *</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">🟢 Baixa</SelectItem>
                      <SelectItem value="media">🟡 Média</SelectItem>
                      <SelectItem value="alta">🔴 Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Detalhada *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o problema em detalhes..."
                  rows={5}
                  required
                  minLength={10}
                />
                <p className="text-sm text-muted-foreground">
                  Mínimo de 10 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Foto do Problema (opcional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        Remover Imagem
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="image" className="cursor-pointer block">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Clique para fazer upload</p>
                      <p className="text-xs text-gray-500">JPG ou PNG, até 5MB</p>
                      <input
                        id="image"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={createTicket.isPending}
              >
                {createTicket.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando Chamado...
                  </>
                ) : (
                  "Enviar Chamado"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
