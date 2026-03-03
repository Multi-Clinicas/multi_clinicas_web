"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CalendarDays, Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";

// 1. Tipagens Base
interface Especialidade {
  id: number;
  nome: string;
}

interface Medico {
  id: number;
  nome: string;
  cpf: string;
  crm: string;
  telefone: string;
  telefoneSecundario?: string;
  especialidades: string[]; // O Backend retorna array de nomes no DTO
  duracaoConsulta: number;
}

// ============================
// 2. Helpers de Máscara
// ============================
const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const maskPhone = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
};

const unmask = (value: string): string => value.replace(/\D/g, "");

// ============================
// 3. Validador de CPF (algoritmo oficial dos dígitos verificadores)
// ============================
const isValidCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;

  // Rejeitar CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Validação do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits.charAt(9))) return false;

  // Validação do 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits.charAt(10))) return false;

  return true;
};

// ============================
// 4. Schema de Validação (Zod) — alinhado ao MedicoCreateDTO do Spring Boot
// ============================
const UFs = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

const medicoSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .refine(
      (val) => val.trim().split(/\s+/).length >= 2,
      { message: "Informe o nome completo (nome e sobrenome)" }
    ),
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .refine(
      (val) => unmask(val).length === 11,
      { message: "CPF deve conter 11 dígitos" }
    )
    .refine(
      (val) => isValidCPF(val),
      { message: "CPF inválido — verifique os dígitos" }
    ),
  crm: z
    .string()
    .min(1, "CRM é obrigatório")
    .regex(
      new RegExp(`^\\d{4,6}\\s?-\\s?(${UFs.join("|")})$`, "i"),
      { message: "Formato inválido. Use: 123456-SP" }
    ),
  telefone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .refine(
      (val) => { const d = unmask(val); return d.length === 10 || d.length === 11; },
      { message: "Telefone deve ter 10 ou 11 dígitos" }
    ),
  specialtyId: z.string().min(1, "Selecione uma especialidade"),
  duracaoConsulta: z
    .number({ error: "Informe um número válido" })
    .int("Deve ser um número inteiro")
    .min(10, "Duração mínima de 10 minutos")
    .max(120, "Duração máxima de 120 minutos"),
});

type MedicoForm = z.infer<typeof medicoSchema>;

export default function MedicosPage() {
  const [data, setData] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<MedicoForm>({
    resolver: zodResolver(medicoSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      crm: "",
      telefone: "",
      specialtyId: "",
      duracaoConsulta: 30,
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [medicosRes, espRes] = await Promise.all([
        api.get<Medico[]>('/medicos'),
        api.get<Especialidade[]>('/especialidades')
      ]);
      setData(medicosRes.data);
      setEspecialidades(espRes.data);
    } catch (error) {
      console.error("Erro ao buscar dados", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setApiError(null);
    reset({ nome: "", cpf: "", crm: "", telefone: "", specialtyId: "", duracaoConsulta: 30 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (medico: Medico) => {
    setEditingId(medico.id);
    setApiError(null);

    // Reverse lookup para achar o ID da especialidade baseando-se no nome (limitação do DTO de leitura)
    const espName = medico.especialidades?.[0] || "";
    const espObj = especialidades.find(e => e.nome === espName);

    reset({
      nome: medico.nome,
      cpf: medico.cpf ? maskCPF(medico.cpf) : "",
      crm: medico.crm,
      telefone: medico.telefone,
      specialtyId: espObj ? String(espObj.id) : "",
      duracaoConsulta: medico.duracaoConsulta,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: MedicoForm) => {
    setApiError(null);
    try {
      // Monta payload esperado pelo Backend (remove máscaras antes de enviar)
      const payload = {
        nome: formData.nome.trim(),
        cpf: unmask(formData.cpf),
        crm: formData.crm.trim().toUpperCase(),
        telefone: unmask(formData.telefone),
        duracaoConsulta: formData.duracaoConsulta,
        especialidadeIds: [Number(formData.specialtyId)], // Array numérico exigido
        ativo: true
      };

      if (editingId) {
        await api.put(`/medicos/${editingId}`, payload);
      } else {
        await api.post('/medicos', payload);
      }

      setIsModalOpen(false);
      await fetchData(); // Recarrega a tabela real do banco
    } catch (error: any) {
      console.error("Erro ao salvar médico", error);
      setApiError(error.response?.data?.message || "Erro ao salvar os dados.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este profissional? A agenda futura poderá ser impactada.")) return;

    try {
      await api.delete(`/medicos/${id}`);
      setData(prev => prev.filter(m => m.id !== id));
    } catch (error: any) {
      console.error("Erro ao excluir médico", error);
      alert(error.response?.data?.message || "Não foi possível excluir.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Corpo Clínico</h1>
          <p className="text-text-secondary mt-1">Gerencie os médicos e as parametrizações de tempo de consulta.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus size={18} />
              Novo Médico
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px] bg-surface-card border-border-subtle shadow-float">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Médico" : "Cadastrar Médico"}</DialogTitle>
              <DialogDescription>
                Insira as credenciais do profissional e configure sua agenda padrão.
              </DialogDescription>
            </DialogHeader>

            <form id="medico-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo <span className="text-status-error">*</span></Label>
                <Input id="nome" placeholder="Ex: Dr. João Silva" {...register("nome")} />
                {errors.nome && <p className="text-xs text-status-error mt-1">{errors.nome.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF <span className="text-status-error">*</span></Label>
                  <Controller
                    name="cpf"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        maxLength={14}
                        readOnly={!!editingId}
                        className={editingId ? "opacity-70 cursor-not-allowed bg-surface-page" : ""}
                        value={field.value}
                        onChange={(e) => field.onChange(maskCPF(e.target.value))}
                      />
                    )}
                  />
                  {errors.cpf && <p className="text-xs text-status-error mt-1">{errors.cpf.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM <span className="text-status-error">*</span></Label>
                  <Input
                    id="crm"
                    placeholder="123456-SP"
                    {...register("crm")}
                    readOnly={!!editingId}
                    className={editingId ? "opacity-70 cursor-not-allowed bg-surface-page" : ""}
                  />
                  <p className="text-[10px] text-text-muted">Formato: número + UF (ex: 123456-SP)</p>
                  {errors.crm && <p className="text-xs text-status-error mt-1">{errors.crm.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone <span className="text-status-error">*</span></Label>
                  <Controller
                    name="telefone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="telefone"
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        value={field.value}
                        onChange={(e) => field.onChange(maskPhone(e.target.value))}
                      />
                    )}
                  />
                  {errors.telefone && <p className="text-xs text-status-error mt-1">{errors.telefone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracaoConsulta">Tempo/Consulta (min) <span className="text-status-error">*</span></Label>
                  <Input id="duracaoConsulta" type="number" min={10} max={120} step={5} {...register("duracaoConsulta", { valueAsNumber: true })} />
                  <p className="text-[10px] text-text-muted">Mín: 10 — Máx: 120 minutos</p>
                  {errors.duracaoConsulta && <p className="text-xs text-status-error mt-1">{errors.duracaoConsulta.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Especialidade Principal <span className="text-status-error">*</span></Label>
                <Controller
                  name="specialtyId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.specialtyId ? "border-status-error" : ""}>
                        <SelectValue placeholder="Selecione uma especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {especialidades.map(esp => (
                          <SelectItem key={esp.id} value={String(esp.id)}>{esp.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.specialtyId && <p className="text-xs text-status-error mt-1">{errors.specialtyId.message}</p>}
              </div>

              <p className="text-[11px] text-text-muted pt-1">Campos marcados com <span className="text-status-error">*</span> são obrigatórios.</p>

              {apiError && (
                <div className="p-3 bg-status-error/10 text-status-error text-sm rounded-panel">
                  {apiError}
                </div>
              )}
            </form>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button" disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" form="medico-form" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Salvar Profissional
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
              <TableHead className="font-bold text-text-primary pl-6">Profissional</TableHead>
              <TableHead className="font-bold text-text-primary">CRM</TableHead>
              <TableHead className="font-bold text-text-primary">Especialidade</TableHead>
              <TableHead className="font-bold text-text-primary text-center">Tempo/Consulta</TableHead>
              <TableHead className="font-bold text-text-primary text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-text-muted">
                  <div className="flex justify-center"><Loader2 className="size-6 animate-spin text-accent-primary" /></div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center">
                    <span className="block mb-2">Nenhum médico cadastrado.</span>
                    <Button variant="outline" size="sm" onClick={handleOpenCreate}>
                      Adicionar o primeiro
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((medico) => {
                const espNome = medico.especialidades?.[0] || "Desconhecida";

                return (
                  <TableRow key={medico.id} className="border-border-subtle hover:bg-surface-page transition-colors">
                    <TableCell className="font-medium text-text-primary pl-6">{medico.nome}</TableCell>
                    <TableCell className="text-text-secondary">{medico.crm}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-subtle text-accent-primary">
                        {espNome}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium text-text-secondary">
                      {medico.duracaoConsulta} min
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Link href={`/backoffice/medicos/${medico.id}/grade`}>
                          <Button variant="ghost" size="icon-sm" className="text-text-secondary hover:text-accent-primary" title="Configurar Grade">
                            <CalendarDays size={16} />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleOpenEdit(medico)} className="text-text-secondary hover:text-accent-primary" title="Editar Médico">
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(medico.id)} className="text-text-secondary hover:text-status-error" title="Excluir Médico">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
