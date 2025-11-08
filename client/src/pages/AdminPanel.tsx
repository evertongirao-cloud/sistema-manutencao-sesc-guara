import { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Search, X, Calendar, User, MapPin, AlertCircle, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

type Ticket = {
  id: number;
  ticketNumber: string;
  requesterName: string;
  requesterEmail: string;
  location: string;
  problemType: string;
  description: string;
  urgency: string;
  status: string;
  imageUrl: string | null;
  technicianId: number | null;
  notes: string | null;
  estimatedCompletion: Date | null;
  createdAt: Date;
};

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

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newNote, setNewNote] = useState("");

  const utils = trpc.useUtils();
  const { data: tickets, isLoading } = trpc.tickets.list.useQuery();
  const { data: technicians } = trpc.technicians.list.useQuery();
  const { data: history } = trpc.tickets.getHistory.useQuery(
    { ticketId: selectedTicket?.id || 0 },
    { enabled: !!selectedTicket }
  );

  const updateStatus = trpc.tickets.updateStatus.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate();
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  const assignTechnician = trpc.tickets.assignTechnician.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate();
      toast.success("Responsável designado com sucesso!");
    },
  });

  const addNotes = trpc.tickets.addNotes.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate();
      utils.tickets.getHistory.invalidate();
      setNewNote("");
      toast.success("Observação adicionada!");
    },
  });

  const deleteTicket = trpc.tickets.delete.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate();
      setIsDetailOpen(false);
      setSelectedTicket(null);
      toast.success("Chamado excluído com sucesso!");
    },
  });

  const filteredTickets = useMemo(() => {
    if (!tickets) return { aberto: [], em_execucao: [], finalizado: [] };

    const filtered = tickets.filter((ticket) => {
      const search = searchTerm.toLowerCase();
      return (
        ticket.ticketNumber.toLowerCase().includes(search) ||
        ticket.requesterName.toLowerCase().includes(search) ||
        ticket.location.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search)
      );
    });

    return {
      aberto: filtered.filter((t) => t.status === "aberto"),
      em_execucao: filtered.filter((t) => t.status === "em_execucao"),
      finalizado: filtered.filter((t) => t.status === "finalizado"),
    };
  }, [tickets, searchTerm]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const ticketId = parseInt(draggableId);
    const newStatus = destination.droppableId as "aberto" | "em_execucao" | "finalizado";

    updateStatus.mutate({ id: ticketId, status: newStatus });
  };

  const handleAddNote = () => {
    if (!selectedTicket || !newNote.trim()) return;
    addNotes.mutate({ ticketId: selectedTicket.id, notes: newNote });
  };

  const handleDelete = () => {
    if (!selectedTicket) return;
    if (confirm(`Tem certeza que deseja excluir o chamado #${selectedTicket.ticketNumber}?`)) {
      deleteTicket.mutate({ id: selectedTicket.id });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Painel de Manutenção - Sesc Guará</h1>
            <p className="text-gray-600 mt-1">Gerencie todos os chamados de manutenção</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/responsaveis">Gerenciar Responsáveis</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/configuracoes">Configurações</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Buscar por número, nome, localidade ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["aberto", "em_execucao", "finalizado"] as const).map((status) => (
              <div key={status} className="flex flex-col">
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                  <h2 className="font-semibold text-lg flex items-center justify-between">
                    {statusLabels[status]}
                    <Badge variant="secondary">{filteredTickets[status].length}</Badge>
                  </h2>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 p-4 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-50"
                      }`}
                      style={{ minHeight: "400px" }}
                    >
                      {filteredTickets[status].map((ticket, index) => (
                        <Draggable key={ticket.id} draggableId={ticket.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-pointer hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? "shadow-lg" : ""
                              }`}
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setIsDetailOpen(true);
                              }}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                      #{ticket.ticketNumber}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                                    </p>
                                  </div>
                                  <Badge className={urgencyColors[ticket.urgency]}>
                                    {ticket.urgency.toUpperCase()}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <p className="font-medium text-sm">{problemTypeLabels[ticket.problemType]}</p>
                                <div className="flex items-center text-xs text-gray-600">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {ticket.location}
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                  <User className="h-3 w-3 mr-1" />
                                  {ticket.requesterName}
                                </div>
                                <p className="text-xs text-gray-700 line-clamp-2">{ticket.description}</p>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Ticket Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-2xl">
                        Chamado #{selectedTicket.ticketNumber}
                      </DialogTitle>
                      <DialogDescription>
                        Aberto em {new Date(selectedTicket.createdAt).toLocaleDateString("pt-BR")}
                      </DialogDescription>
                    </div>
                    <Badge className={urgencyColors[selectedTicket.urgency]}>
                      {selectedTicket.urgency.toUpperCase()}
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Problema</Label>
                      <p className="text-sm mt-1">{problemTypeLabels[selectedTicket.problemType]}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <p className="text-sm mt-1">{statusLabels[selectedTicket.status]}</p>
                    </div>
                    <div>
                      <Label>Solicitante</Label>
                      <p className="text-sm mt-1">{selectedTicket.requesterName}</p>
                    </div>
                    <div>
                      <Label>E-mail</Label>
                      <p className="text-sm mt-1">{selectedTicket.requesterEmail}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>Localidade</Label>
                      <p className="text-sm mt-1">{selectedTicket.location}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedTicket.description}</p>
                  </div>

                  {selectedTicket.imageUrl && (
                    <div>
                      <Label>Foto do Problema</Label>
                      <img
                        src={selectedTicket.imageUrl}
                        alt="Problema"
                        className="mt-2 rounded-lg max-h-64 object-contain"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Designar Responsável</Label>
                    <Select
                      value={selectedTicket.technicianId?.toString() || ""}
                      onValueChange={(value) => {
                        assignTechnician.mutate({
                          ticketId: selectedTicket.id,
                          technicianId: parseInt(value),
                        });
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione um responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians?.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id.toString()}>
                            {tech.name} {tech.specialty && `(${tech.specialty})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTicket.notes && (
                    <div>
                      <Label>Observações Anteriores</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">
                        {selectedTicket.notes}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Adicionar Observação</Label>
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Digite uma observação sobre o chamado..."
                      className="mt-1"
                      rows={3}
                    />
                    <Button onClick={handleAddNote} className="mt-2" size="sm" disabled={!newNote.trim()}>
                      <FileText className="h-4 w-4 mr-2" />
                      Adicionar Observação
                    </Button>
                  </div>

                  {history && history.length > 0 && (
                    <div>
                      <Label>Histórico</Label>
                      <div className="mt-2 space-y-2">
                        {history.map((item) => (
                          <div key={item.id} className="text-sm p-2 bg-gray-50 rounded">
                            <p className="font-medium">{item.description}</p>
                            <p className="text-xs text-gray-500">
                              {item.performedBy} - {new Date(item.createdAt).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="destructive" onClick={handleDelete} className="flex-1">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Chamado
                    </Button>
                    <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="flex-1">
                      Fechar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
