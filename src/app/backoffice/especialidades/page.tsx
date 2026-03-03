"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
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

// Tipagem baseada no EspecialidadeDTO do Backend
interface Especialidade {
  id: number;
  nome: string;
}

export default function EspecialidadesPage() {
  const [data, setData] = useState<Especialidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [nome, setNome] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Especialidade[]>('/especialidades');
      setData(response.data);
    } catch (error) {
      console.error("Erro ao buscar especialidades", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setNome("");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (esp: Especialidade) => {
    setEditingId(esp.id);
    setNome(esp.nome);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (editingId) {
        await api.put(`/especialidades/${editingId}`, { nome });
      } else {
        await api.post('/especialidades', { nome });
      }
      setIsModalOpen(false);
      await fetchEspecialidades(); // Recarrega a lista
    } catch (error: any) {
      console.error("Erro ao salvar especialidade", error);
      setErrorMsg(error.response?.data?.message || "Erro ao salvar a especialidade.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta especialidade?")) return;

    try {
      await api.delete(`/especialidades/${id}`);
      setData(prev => prev.filter(e => e.id !== id));
    } catch (error: any) {
      console.error("Erro ao deletar especialidade", error);
      alert(error.response?.data?.message || "Não foi possível excluir.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Especialidades</h1>
          <p className="text-text-secondary mt-1">Gerencie as áreas de atuação clínica da sua unidade.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus size={18} />
              Nova Especialidade
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px] bg-surface-card border-border-subtle shadow-float">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Especialidade" : "Criar Especialidade"}</DialogTitle>
              <DialogDescription>
                Insira o nome da especialidade médica para associar aos profissionais da clínica.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-text-primary font-semibold">Nome da Especialidade</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Pediatria"
                  disabled={isSubmitting}
                />
                {errorMsg && <p className="text-xs text-status-error">{errorMsg}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Salvar Modificações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Tabela de Dados */}
      <div className="border border-border-subtle rounded-panel overflow-hidden shadow-card bg-surface-card">
        <Table>
          <TableHeader className="bg-surface-page">
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="font-bold text-text-primary pl-6">ID</TableHead>
              <TableHead className="font-bold text-text-primary">Nome</TableHead>
              <TableHead className="font-bold text-text-primary text-right w-32 pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-text-muted">
                  Carregando especialidades...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-text-muted flex flex-col items-center justify-center">
                  <span className="block mb-2">Nenhuma especialidade cadastrada.</span>
                  <Button variant="outline" size="sm" onClick={handleOpenCreate}>
                    Cadastre a primeira
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              data.map((esp) => (
                <TableRow key={esp.id} className="border-border-subtle hover:bg-surface-page transition-colors">
                  <TableCell className="text-text-muted pl-6">{esp.id}</TableCell>
                  <TableCell className="font-medium text-text-primary">{esp.nome}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleOpenEdit(esp)} className="text-text-secondary hover:text-accent-primary">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(esp.id)} className="text-text-secondary hover:text-status-error">
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
