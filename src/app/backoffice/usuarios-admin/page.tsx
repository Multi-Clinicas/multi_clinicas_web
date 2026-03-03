"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";

interface Endereco {
  id?: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais?: string;
}

interface UsuarioAdmin {
  id: number;
  nome: string;
  email: string;
  role: "ADMIN" | "RECEPCIONISTA";
  telefone: string;
  cpf: string;
  telefoneSecundario?: string;
  endereco: Endereco;
}

const formSchema = z.object({
  nome: z.string().min(2, "O nome é obrigatório."),
  cpf: z.string().min(11, "O CPF é obrigatório (mínimo 11 dígitos)."),
  telefone: z.string().min(8, "O telefone é obrigatório."),
  telefoneSecundario: z.string().optional(),
  email: z.string().email("E-mail inválido."),
  senha: z.string().optional().or(z.literal("")),
  role: z.enum(["ADMIN", "RECEPCIONISTA"], {
    required_error: "Selecione uma permissão.",
  }),
  // Campos de Endereço (flat no form, nested no payload)
  cep: z.string().min(8, "CEP é obrigatório (mínimo 8 dígitos).").max(9),
  logradouro: z.string().min(1, "Logradouro é obrigatório."),
  numero: z.string().min(1, "Número é obrigatório."),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório."),
  cidade: z.string().min(1, "Cidade é obrigatória."),
  estado: z.string().length(2, "UF (2 letras)."),
  pais: z.string().optional().default("Brasil"),
});

type FormValues = z.infer<typeof formSchema>;

export default function UsuariosAdminPage() {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<UsuarioAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      telefoneSecundario: "",
      email: "",
      senha: "",
      role: "RECEPCIONISTA",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      pais: "Brasil",
    },
  });

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || user.role !== "ADMIN") {
        router.push("/backoffice");
        return;
      }
      fetchUsuarios();
    }
  }, [isAuthLoading, user, router]);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const response = await api.get<UsuarioAdmin[]>('/usuario-admin');
      setData(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setGlobalError(null);
    form.reset({
      nome: "",
      cpf: "",
      telefone: "",
      telefoneSecundario: "",
      email: "",
      senha: "",
      role: "RECEPCIONISTA",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      pais: "Brasil",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UsuarioAdmin) => {
    setEditingId(user.id);
    setGlobalError(null);
    form.reset({
      nome: user.nome,
      cpf: user.cpf,
      telefone: user.telefone,
      telefoneSecundario: user.telefoneSecundario || "",
      email: user.email,
      senha: "",
      role: user.role,
      cep: user.endereco.cep,
      logradouro: user.endereco.logradouro,
      numero: user.endereco.numero,
      complemento: user.endereco.complemento || "",
      bairro: user.endereco.bairro,
      cidade: user.endereco.cidade,
      estado: user.endereco.estado,
      pais: user.endereco.pais || "Brasil",
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    setGlobalError(null);
    try {
      // Constrói o payload aninhado como o backend espera
      const payload = {
        nome: values.nome,
        cpf: values.cpf,
        telefone: values.telefone,
        telefoneSecundario: values.telefoneSecundario,
        email: values.email,
        role: values.role,
        senhaHash: values.senha, // Sempre envia para criar, e se preenchido para editar
        endereco: {
          cep: values.cep,
          logradouro: values.logradouro,
          numero: values.numero,
          complemento: values.complemento,
          bairro: values.bairro,
          cidade: values.cidade,
          estado: values.estado,
          pais: values.pais,
        }
      };

      if (editingId) {
        await api.put(`/usuario-admin/${editingId}`, payload);
      } else {
        if (!values.senha || values.senha.length < 6) {
          form.setError("senha", { message: "A senha é obrigatória na criação (mín. 6 caracteres)." });
          return;
        }
        await api.post('/usuario-admin', payload);
      }

      setIsModalOpen(false);
      await fetchUsuarios();
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      const backendDetails = error.response?.data?.details;
      if (backendDetails) {
        setGlobalError(`Erro de validação: ${Object.entries(backendDetails).map(([k, v]) => `${k}: ${v}`).join(", ")}`);
      } else {
        setGlobalError(error.response?.data?.message || "Ocorreu um erro ao salvar o usuário.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await api.delete(`/usuario-admin/${id}`);
      setData((prev) => prev.filter((u) => u.id !== id));
    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error);
      alert(error.response?.data?.message || "Não foi possível excluir o usuário.");
    }
  };

  if (isAuthLoading || (user && user.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Equipe Administrativa</h1>
          <p className="text-text-secondary mt-1">Gerencie os usuários e recepcionistas da clínica.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus size={18} />
              Novo Usuário
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto bg-surface-card border-border-subtle shadow-float">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
              <DialogDescription>
                Todos os campos são obrigatórios para a integração com o backend.
              </DialogDescription>
            </DialogHeader>

            {globalError && (
              <div className="p-3 bg-status-error/10 text-status-error text-sm rounded-md border border-status-error/20">
                {globalError}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
                
                {/* Seção Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="nome" render={({ field }) => (
                      <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Ex: João Silva" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input placeholder="joao@clinica.com" type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="cpf" render={({ field }) => (
                      <FormItem><FormLabel>CPF</FormLabel><FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-2">
                      <FormField control={form.control} name="telefone" render={({ field }) => (
                        <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(00) 0000-0000" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem><FormLabel>Perfil</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent><SelectItem value="ADMIN">Admin</SelectItem><SelectItem value="RECEPCIONISTA">Recepcionista</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="senha" render={({ field }) => (
                      <FormItem><FormLabel>{editingId ? "Nova Senha (vazio p/ manter)" : "Senha"}</FormLabel><FormControl><Input type="password" placeholder="******" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>

                {/* Seção Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="cep" render={({ field }) => (
                      <FormItem><FormLabel>CEP</FormLabel><FormControl><Input placeholder="00000-000" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="md:col-span-2">
                      <FormField control={form.control} name="logradouro" render={({ field }) => (
                        <FormItem><FormLabel>Logradouro (Rua/Av)</FormLabel><FormControl><Input placeholder="Rua das Flores" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="numero" render={({ field }) => (
                      <FormItem><FormLabel>Número</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="md:col-span-2">
                      <FormField control={form.control} name="bairro" render={({ field }) => (
                        <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input placeholder="Centro" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="md:col-span-2">
                      <FormField control={form.control} name="cidade" render={({ field }) => (
                        <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input placeholder="São Paulo" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="estado" render={({ field }) => (
                      <FormItem><FormLabel>UF</FormLabel><FormControl><Input placeholder="SP" maxLength={2} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={form.formState.isSubmitting}>Cancelar</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Salvar Usuário
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Tabela de Dados */}
      <div className="border border-border-subtle rounded-panel overflow-hidden shadow-card bg-surface-card">
        <Table>
          <TableHeader className="bg-surface-page">
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="font-bold text-text-primary pl-6">Nome</TableHead>
              <TableHead className="font-bold text-text-primary">E-mail</TableHead>
              <TableHead className="font-bold text-text-primary">Role</TableHead>
              <TableHead className="font-bold text-text-primary text-right w-32 pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-text-muted">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-5 animate-spin" />
                    Carregando usuários...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-text-muted flex flex-col items-center justify-center">
                  <span className="block mb-2">Nenhum usuário cadastrado.</span>
                  <Button variant="outline" size="sm" onClick={handleOpenCreate}>Cadastre o primeiro</Button>
                </TableCell>
              </TableRow>
            ) : (
              data.map((user) => (
                <TableRow key={user.id} className="border-border-subtle hover:bg-surface-page transition-colors">
                  <TableCell className="font-medium text-text-primary pl-6">{user.nome}</TableCell>
                  <TableCell className="text-text-secondary">{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "ADMIN" ? "bg-accent-primary/10 text-accent-primary" : "bg-status-success/10 text-status-success"
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleOpenEdit(user)} className="text-text-secondary hover:text-accent-primary"><Edit2 size={16} /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(user.id)} className="text-text-secondary hover:text-status-error"><Trash2 size={16} /></Button>
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
