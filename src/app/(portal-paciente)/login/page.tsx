"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import api from "@/services/api";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuthData } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setErrorMsg(null);
    try {
      // O interceptor do axios em api.ts já injeta o X-Clinic-ID automaticamente
      const response = await api.post("/auth/login", {
        email: data.email,
        senha: data.password,
      });

      const { token, id, nome, role } = response.data;

      if (role === "SUPER_ADMIN") {
        setErrorMsg("E-mail ou senha incorretos.");
        return;
      }

      // Resgatamos os dados do tenant configurado pelo TenantProvider
      const currentTenantId = localStorage.getItem('@multiclinicas:tenantId');
      const currentSubdomain = localStorage.getItem('@multiclinicas:subdomain');
      const currentTenantName = localStorage.getItem('@multiclinicas:tenantName');

      setAuthData(
        { id: String(id), name: nome, email: data.email, role: role as UserRole },
        token,
        currentTenantId ? {
          id: String(currentTenantId),
          name: currentTenantName || "Clínica",
          subdomain: currentSubdomain || ""
        } : undefined
      );

      // Redireciona de acordo com o nível de acesso
      if (role === "ADMIN" || role === "RECEPCIONISTA") {
        router.push(`/backoffice`);
      } else {
        router.push(`/`); // pacientes vão para a home ou dashboard do paciente
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiMessage = (error.response.data as { message?: string }).message;

        // Se a API retornou uma mensagem específica (ex: clínica inativa), usa ela
        if (apiMessage && error.response.status !== 401) {
          setErrorMsg(apiMessage);
        } else {
          setErrorMsg("E-mail ou senha incorretos.");
        }
      } else {
        setErrorMsg("Ocorreu um erro ao conectar com o servidor.");
      }
      console.error("Erro no login:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-[85vh] p-6 bg-surface-page">
      <div className="mt-12 mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Acesso ao Sistema</h1>
        <p className="text-sm text-text-secondary mt-2">Informe seus dados de acesso.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 bg-surface-card p-6 rounded-card border border-border-subtle shadow-card max-w-md w-full mx-auto">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} />
          {errors.email && <p className="text-xs text-status-error">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" placeholder="******" {...register("password")} />
          {errors.password && <p className="text-xs text-status-error">{errors.password.message}</p>}
        </div>

        {errorMsg && (
          <div className="p-3 text-sm bg-status-error/10 text-status-error border border-status-error/20 rounded-lg">
            {errorMsg}
          </div>
        )}

        <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>

        <div className="text-center mt-6">
          <p className="text-sm text-text-secondary">
            Ainda não tem conta?{' '}
            <Link href={`/cadastro`} className="text-accent-primary font-bold hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
