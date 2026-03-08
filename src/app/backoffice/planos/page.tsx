"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/services/api";

interface PlanoSaude {
  id: number;
  nome: string;
  ativo: boolean;
}

// SVG Conceitual: A prancheta isométrica wireframe representando o contrato de convênio
const EmptyStateIllustration = () => (
  <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
    {/* Base Isométrica do Documento */}
    <path d="M80 40 L130 65 L80 90 L30 65 Z" stroke="currentColor" className="text-text-muted" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M30 65 L30 85 L80 110 L130 85 L130 65" stroke="currentColor" className="text-text-muted/30" strokeWidth="1.5" strokeLinejoin="round"/>
    
    {/* Linhas de wireframe na prancheta */}
    <path d="M60 55 L100 75" stroke="currentColor" className="text-text-muted" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M55 62 L85 77" stroke="currentColor" className="text-text-muted" strokeWidth="1.5" strokeLinecap="round"/>
    
    {/* O "Nó" Vital / Ponto de acento flutuando acima da prancheta */}
    <path d="M80 20 L80 32 M74 26 L86 26" stroke="currentColor" className="text-accent-primary" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="80" cy="26" r="4" className="fill-accent-primary" />
  </svg>
);

export default function PlanosSaudePage() {
  const [data, setData] = useState<PlanoSaude[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<PlanoSaude[]>('/planos-saude');
      setData(response.data);
    } catch (error) {
      console.error("Erro ao buscar planos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setNome("");
    setAtivo(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plano: PlanoSaude) => {
    setEditingId(plano.id);
    setNome(plano.nome);
    setAtivo(plano.ativo);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      setErrorMsg("O nome do plano é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = { nome, ativo };

    try {
      if (editingId) {
        await api.put(`/planos-saude/${editingId}`, payload);
      } else {
        await api.post('/planos-saude', payload);
      }
      setIsModalOpen(false);
      await fetchPlanos();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Erro ao salvar o plano.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      await api.delete(`/planos-saude/${id}`);
      setData(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.message || "Não foi possível excluir.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Planos de Saúde</h1>
          <p className="text-text-secondary mt-1">Gerencie os convênios aceitos pela clínica.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="gap-2 bg-accent-gradient text-white rounded-button shadow-float font-bold border-none hover:opacity-90">
              <Plus size={18} />
              Novo Convênio
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px] bg-surface-card border-border-subtle shadow-float rounded-card">
            <DialogHeader>
              <DialogTitle className="text-text-primary">{editingId ? "Editar Convênio" : "Adicionar Convênio"}</DialogTitle>
              <DialogDescription className="text-text-secondary">
                Insira os dados do plano. Apenas planos ativos aparecerão no agendamento.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-text-primary font-semibold">Nome do Plano</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: SulAmérica, Bradesco"
                  disabled={isSubmitting}
                  className="bg-surface-card border-border-default rounded-panel text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
                />
              </div>
              
              {/* Custom Toggle alinhado com a identidade (sem inputs nativos) */}
              <div 
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => !isSubmitting && setAtivo(!ativo)}
              >
                <div className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors duration-200 ease-in-out ${ativo ? 'bg-accent-primary' : 'bg-surface-page border border-border-default'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${ativo ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <Label className="text-text-primary cursor-pointer font-medium group-hover:text-accent-primary transition-colors">
                  Convênio Ativo
                </Label>
              </div>

              {errorMsg && <p className="text-xs text-status-error">{errorMsg}</p>}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)} 
                disabled={isSubmitting}
                className="bg-transparent border-border-default text-text-primary rounded-button hover:bg-surface-page"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="bg-accent-gradient text-white rounded-button shadow-float font-bold border-none hover:opacity-90"
              >
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="border border-border-subtle rounded-panel overflow-hidden shadow-card bg-surface-card">
        <Table>
          <TableHeader className="bg-surface-page">
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="font-bold text-text-primary pl-6 w-20">ID</TableHead>
              <TableHead className="font-bold text-text-primary">Plano de Saúde</TableHead>
              <TableHead className="font-bold text-text-primary w-32">Status</TableHead>
              <TableHead className="font-bold text-text-primary text-right w-32 pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-text-muted">
                  <Loader2 className="size-6 animate-spin mx-auto text-accent-primary opacity-50" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64">
                  <div className="flex flex-col items-center justify-center text-text-muted h-full">
                    <EmptyStateIllustration />
                    <span className="block mb-4 font-medium text-text-primary">O painel está vazio</span>
                    <span className="block mb-6 text-sm">Organize a rotina cadastrando o primeiro convênio.</span>
                    <Button 
                      variant="outline" 
                      onClick={handleOpenCreate}
                      className="bg-transparent border-border-default text-text-primary rounded-button hover:bg-surface-page"
                    >
                      Cadastrar Convênio
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((plano) => (
                <TableRow key={plano.id} className="border-border-subtle hover:bg-surface-page transition-colors">
                  <TableCell className="text-text-muted pl-6">{plano.id}</TableCell>
                  <TableCell className="font-medium text-text-primary">{plano.nome}</TableCell>
                  <TableCell>
                    {plano.ativo ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-primary bg-accent-subtle px-3 py-1 rounded-full">
                        <CheckCircle size={14} /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted bg-surface-page px-3 py-1 rounded-full border border-border-subtle">
                        <XCircle size={14} /> Inativo
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleOpenEdit(plano)} className="text-text-secondary hover:text-accent-primary rounded-button">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(plano.id)} className="text-text-secondary hover:text-status-error rounded-button">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}