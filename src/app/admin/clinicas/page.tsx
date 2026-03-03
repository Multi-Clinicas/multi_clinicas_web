"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { Plus, Pencil, Trash2, Building2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";

import type { ClinicaDTO } from "@/services/clinicaService";
import {
    fetchClinicas,
    createClinica,
    updateClinica,
    deleteClinica,
} from "@/services/clinicaService";

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const clinicaFormSchema = z.object({
    nomeFantasia: z
        .string()
        .min(1, "Nome fantasia é obrigatório")
        .max(120, "Máximo de 120 caracteres"),
    subdominio: z
        .string()
        .min(1, "Subdomínio é obrigatório")
        .max(63, "Máximo de 63 caracteres")
        .regex(
            /^[a-z0-9-]+$/,
            "Apenas letras minúsculas, números e hífens (sem espaços ou caracteres especiais)"
        ),
    ativo: z.boolean(),
    adminNome: z.string().min(1, "Nome do gestor é obrigatório").optional(),
    adminEmail: z.string().email("E-mail inválido").optional(),
    adminSenha: z.string().min(6, "No mínimo 6 caracteres").optional(),
});

type ClinicaFormData = z.infer<typeof clinicaFormSchema>;

// ─── Empty State SVG ─────────────────────────────────────────────────────────

function EmptyStateIllustration() {
    return (
        <svg
            width="160"
            height="120"
            viewBox="0 0 160 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-4"
        >
            {/* Isometric building base */}
            <path
                d="M80 30 L120 50 L120 90 L80 110 L40 90 L40 50 Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                className="text-text-muted"
                strokeLinejoin="round"
            />
            {/* Vertical center line */}
            <line
                x1="80"
                y1="30"
                x2="80"
                y2="110"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border-default"
                strokeDasharray="4 3"
            />
            {/* Left face lines (floors) */}
            <line
                x1="40"
                y1="60"
                x2="80"
                y2="80"
                stroke="currentColor"
                strokeWidth="0.75"
                className="text-border-default"
            />
            <line
                x1="40"
                y1="75"
                x2="80"
                y2="95"
                stroke="currentColor"
                strokeWidth="0.75"
                className="text-border-default"
            />
            {/* Right face lines (floors) */}
            <line
                x1="120"
                y1="60"
                x2="80"
                y2="80"
                stroke="currentColor"
                strokeWidth="0.75"
                className="text-border-default"
            />
            <line
                x1="120"
                y1="75"
                x2="80"
                y2="95"
                stroke="currentColor"
                strokeWidth="0.75"
                className="text-border-default"
            />
            {/* Left face windows */}
            <rect
                x="50"
                y="54"
                width="6"
                height="5"
                rx="1"
                transform="skewY(26.5)"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.75"
                className="text-text-muted"
            />
            {/* Accent dot — "glowing marker" on the rooftop */}
            <circle cx="80" cy="28" r="4" className="fill-accent-primary" />
            <circle
                cx="80"
                cy="28"
                r="8"
                className="fill-accent-primary"
                opacity="0.15"
            />
            {/* Small cross (medical) near the accent */}
            <line
                x1="80"
                y1="14"
                x2="80"
                y2="20"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-accent-primary"
                strokeLinecap="round"
            />
            <line
                x1="77"
                y1="17"
                x2="83"
                y2="17"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-accent-primary"
                strokeLinecap="round"
            />
        </svg>
    );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function TableSkeleton() {
    return (
        <div className="space-y-3 p-6">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="h-4 w-10 rounded-panel bg-border-subtle animate-pulse" />
                    <div className="h-4 flex-1 rounded-panel bg-border-subtle animate-pulse" />
                    <div className="h-4 w-28 rounded-panel bg-border-subtle animate-pulse" />
                    <div className="h-5 w-14 rounded-full bg-border-subtle animate-pulse" />
                    <div className="h-4 w-24 rounded-panel bg-border-subtle animate-pulse" />
                    <div className="h-4 w-16 rounded-panel bg-border-subtle animate-pulse" />
                </div>
            ))}
        </div>
    );
}

// ─── Toggle Switch (Ativo) ───────────────────────────────────────────────────

function ToggleSwitch({
    checked,
    onCheckedChange,
}: {
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                checked ? "bg-status-success" : "bg-border-default"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block size-5 rounded-full bg-white shadow-card transition-transform duration-200",
                    checked ? "translate-x-5" : "translate-x-0"
                )}
            />
        </button>
    );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ ativo }: { ativo: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                ativo
                    ? "bg-status-success/10 text-status-success"
                    : "bg-status-error/10 text-status-error"
            )}
        >
            <span
                className={cn(
                    "inline-block size-1.5 rounded-full",
                    ativo ? "bg-status-success" : "bg-status-error"
                )}
            />
            {ativo ? "Ativo" : "Inativo"}
        </span>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
    try {
        return new Date(isoString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return isoString;
    }
}

function extractApiErrorMessage(error: unknown): string {
    if (error instanceof AxiosError && error.response?.data) {
        const data = error.response.data;
        // Suporta formatos comuns do Spring Boot: { message: "..." } ou { error: "..." }
        if (typeof data === "string") return data;
        if (typeof data.message === "string") return data.message;
        if (typeof data.error === "string") return data.error;
    }
    return "Ocorreu um erro inesperado. Tente novamente.";
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function ClinicasPage() {
    // ── State ──────────────────────────────────────────────────────────────────
    const [clinicas, setClinicas] = useState<ClinicaDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingClinica, setEditingClinica] = useState<ClinicaDTO | null>(null);
    const [deletingClinica, setDeletingClinica] = useState<ClinicaDTO | null>(
        null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // ── Form ───────────────────────────────────────────────────────────────────
    const form = useForm<ClinicaFormData>({
        resolver: zodResolver(clinicaFormSchema),
        defaultValues: {
            nomeFantasia: "",
            subdominio: "",
            ativo: true,
            adminNome: "",
            adminEmail: "",
            adminSenha: "",
        },
    });

    // ── Data Fetching ──────────────────────────────────────────────────────────
    const loadClinicas = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchClinicas();
            setClinicas(data);
        } catch (err) {
            console.error("Erro ao carregar clínicas:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadClinicas();
    }, [loadClinicas]);

    // ── Modal Handlers ─────────────────────────────────────────────────────────
    function openCreateModal() {
        setEditingClinica(null);
        setApiError(null);
        form.reset({ nomeFantasia: "", subdominio: "", ativo: true, adminNome: "", adminEmail: "", adminSenha: "" });
        setIsFormOpen(true);
    }

    function openEditModal(clinica: ClinicaDTO) {
        setEditingClinica(clinica);
        setApiError(null);
        form.reset({
            nomeFantasia: clinica.nomeFantasia,
            subdominio: clinica.subdominio,
            ativo: clinica.ativo,
        });
        setIsFormOpen(true);
    }

    function openDeleteModal(clinica: ClinicaDTO) {
        setDeletingClinica(clinica);
        setIsDeleteOpen(true);
    }

    // ── Form Submit ────────────────────────────────────────────────────────────
    async function onSubmit(data: ClinicaFormData) {
        setIsSubmitting(true);
        setApiError(null);

        try {
            if (editingClinica) {
                await updateClinica(editingClinica.id, {
                    nomeFantasia: data.nomeFantasia,
                    subdominio: data.subdominio,
                    ativo: data.ativo
                });
            } else {
                await createClinica(data);
            }

            setIsFormOpen(false);
            form.reset();
            await loadClinicas();
        } catch (err) {
            const message = extractApiErrorMessage(err);

            // Se o erro for de conflito (subdomínio duplicado), exibe embaixo do campo
            if (
                err instanceof AxiosError &&
                (err.response?.status === 409 || err.response?.status === 400)
            ) {
                form.setError("subdominio", { type: "server", message });
            } else {
                setApiError(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    // ── Delete Confirm ─────────────────────────────────────────────────────────
    async function handleDeleteConfirm() {
        if (!deletingClinica) return;

        setIsSubmitting(true);
        try {
            await deleteClinica(deletingClinica.id);
            setIsDeleteOpen(false);
            setDeletingClinica(null);
            await loadClinicas();
        } catch (err) {
            console.error("Erro ao excluir clínica:", err);
            setApiError(extractApiErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════

    return (
        <div className="p-6 lg:p-10 max-w-6xl">
            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">
                        Gestão de Clínicas
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Gerencie os tenants cadastrados na plataforma
                    </p>
                </div>
                <Button onClick={openCreateModal} className="gap-2 self-start">
                    <Plus className="size-4" />
                    Nova Clínica
                </Button>
            </div>

            {/* ── Table Card ──────────────────────────────────────────────────── */}
            <div className="bg-surface-card border border-border-subtle rounded-panel shadow-card overflow-hidden">
                {isLoading ? (
                    <TableSkeleton />
                ) : clinicas.length === 0 ? (
                    /* ── Empty State ────────────────────────────────────────────── */
                    <div className="flex flex-col items-center justify-center py-20 px-6">
                        <EmptyStateIllustration />
                        <h2 className="text-lg font-semibold text-text-primary mb-1">
                            Nenhuma clínica cadastrada
                        </h2>
                        <p className="text-sm text-text-secondary mb-6 max-w-xs text-center">
                            Comece cadastrando o primeiro tenant para ativar o sistema
                            multi-clínica.
                        </p>
                        <Button onClick={openCreateModal} className="gap-2">
                            <Building2 className="size-4" />
                            Cadastrar primeira clínica
                        </Button>
                    </div>
                ) : (
                    /* ── Data Table ─────────────────────────────────────────────── */
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border-subtle hover:bg-transparent">
                                <TableHead className="text-text-secondary text-xs uppercase tracking-wide font-semibold pl-6">
                                    ID
                                </TableHead>
                                <TableHead className="text-text-secondary text-xs uppercase tracking-wide font-semibold">
                                    Nome Fantasia
                                </TableHead>
                                <TableHead className="text-text-secondary text-xs uppercase tracking-wide font-semibold">
                                    Subdomínio
                                </TableHead>
                                <TableHead className="text-text-secondary text-xs uppercase tracking-wide font-semibold">
                                    Status
                                </TableHead>
                                <TableHead className="text-text-secondary text-xs uppercase tracking-wide font-semibold">
                                    Criado em
                                </TableHead>
                                <TableHead className="text-text-secondary text-xs uppercase tracking-wide font-semibold pr-6 text-right">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clinicas.map((clinica) => (
                                <TableRow
                                    key={clinica.id}
                                    className="border-border-subtle hover:bg-surface-page/60 transition-colors"
                                >
                                    <TableCell className="text-text-muted text-sm pl-6 tabular-nums">
                                        {clinica.id}
                                    </TableCell>
                                    <TableCell className="text-text-primary font-semibold text-sm">
                                        {clinica.nomeFantasia}
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs bg-surface-page text-text-secondary px-2 py-0.5 rounded-panel font-mono">
                                            {clinica.subdominio}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge ativo={clinica.ativo} />
                                    </TableCell>
                                    <TableCell className="text-text-secondary text-sm tabular-nums">
                                        {formatDate(clinica.createdAt)}
                                    </TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => openEditModal(clinica)}
                                                aria-label={`Editar ${clinica.nomeFantasia}`}
                                            >
                                                <Pencil className="size-3.5 text-text-secondary" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => openDeleteModal(clinica)}
                                                aria-label={`Excluir ${clinica.nomeFantasia}`}
                                            >
                                                <Trash2 className="size-3.5 text-status-error" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
          MODAL — Criar / Editar Clínica
         ═════════════════════════════════════════════════════════════════ */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="bg-surface-card border-border-subtle shadow-float rounded-panel sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-text-primary">
                            {editingClinica ? "Editar Clínica" : "Nova Clínica"}
                        </DialogTitle>
                        <DialogDescription className="text-text-secondary">
                            {editingClinica
                                ? "Atualize os dados do tenant selecionado."
                                : "Preencha as informações para cadastrar um novo tenant."}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-5 py-2"
                        >
                            {/* Nome Fantasia */}
                            <FormField
                                control={form.control}
                                name="nomeFantasia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-text-primary text-sm font-medium">
                                            Nome Fantasia
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Clínica Vida Plena"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-status-error" />
                                    </FormItem>
                                )}
                            />

                            {/* Subdomínio */}
                            <FormField
                                control={form.control}
                                name="subdominio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-text-primary text-sm font-medium">
                                            Subdomínio
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="clinica-vida-plena"
                                                {...field}
                                                onChange={(e) => {
                                                    // Auto-lowercase enquanto digita
                                                    field.onChange(
                                                        e.target.value.toLowerCase().replace(/\s/g, "-")
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-text-muted text-xs">
                                            Será acessível em{" "}
                                            <span className="font-mono text-accent-primary">
                                                {field.value || "subdominio"}
                                                .multiclinicas.com.br
                                            </span>
                                        </FormDescription>
                                        <FormMessage className="text-status-error" />
                                    </FormItem>
                                )}
                            />

                            {/* Toggle Ativo */}
                            <FormField
                                control={form.control}
                                name="ativo"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <FormLabel className="text-text-primary text-sm font-medium">
                                                    Status
                                                </FormLabel>
                                                <p className="text-text-muted text-xs mt-0.5">
                                                    {field.value
                                                        ? "O tenant está ativo e acessível"
                                                        : "O tenant está desativado"}
                                                </p>
                                            </div>
                                            <FormControl>
                                                <ToggleSwitch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Campos adicionais apenas na criação */}
                            {!editingClinica && (
                                <div className="space-y-4 pt-4 mt-4 border-t border-border-default">
                                    <h4 className="text-sm font-semibold text-text-primary">Dados do Gestor (Administrador)</h4>

                                    <FormField
                                        control={form.control}
                                        name="adminNome"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-text-primary text-sm font-medium">Nome do Gestor</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: João da Silva" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage className="text-status-error" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="adminEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-text-primary text-sm font-medium">E-mail de Acesso</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="gestor@clinica.com" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage className="text-status-error" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="adminSenha"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-text-primary text-sm font-medium">Senha</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="******" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage className="text-status-error" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* API Error (non-field-level) */}
                            {apiError && (
                                <p className="text-sm text-status-error bg-status-error/10 px-3 py-2 rounded-panel">
                                    {apiError}
                                </p>
                            )}

                            {/* Footer Actions */}
                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsFormOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && (
                                        <Loader2 className="size-4 animate-spin" />
                                    )}
                                    {editingClinica ? "Salvar Alterações" : "Cadastrar"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════════════════════════════
          MODAL — Confirmar Exclusão
         ═════════════════════════════════════════════════════════════════ */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="bg-surface-card border-border-subtle shadow-float rounded-panel sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-text-primary">
                            Confirmar Exclusão
                        </DialogTitle>
                        <DialogDescription className="text-text-secondary">
                            Tem certeza que deseja excluir a clínica{" "}
                            <strong className="text-text-primary">
                                {deletingClinica?.nomeFantasia}
                            </strong>
                            ? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Warning */}
                    <div className="flex items-start gap-3 bg-status-warning/10 text-status-warning px-4 py-3 rounded-panel text-sm">
                        <span className="text-base leading-none mt-0.5">⚠</span>
                        <p>
                            Todos os dados vinculados ao subdomínio{" "}
                            <code className="font-mono font-semibold">
                                {deletingClinica?.subdominio}
                            </code>{" "}
                            serão removidos permanentemente.
                        </p>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                            Excluir Clínica
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
