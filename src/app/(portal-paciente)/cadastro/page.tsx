"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signupSchema = z.object({
  name: z.string().min(3, "Nome completo obrigatório"),
  email: z.string().email("E-mail inválido"),
  document: z.string().min(11, "CPF inválido"), // Validação simples para mock
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const params = useParams();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    // Simulação do back-end para criação de usuário
    console.log("Mock enviando dados de cadastro:", data);
    
    // Simulando delay de rede
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Após o cadastro bem-sucedido, redireciona o paciente para realizar o login
    router.push(`/login?registered=true`);
  };

  return (
    <div className="flex flex-col min-h-[85vh] p-6 bg-surface-page pb-24">
      <div className="mt-8 mb-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Novo Cadastro</h1>
        <p className="text-sm text-text-secondary mt-2">Preencha os campos abaixo para criar seu perfil e agendar consultas.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-surface-card p-6 rounded-card border border-border-subtle shadow-card max-w-md w-full mx-auto">
        
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input id="name" placeholder="Ex: Maria Silva" {...register("name")} />
          {errors.name && <p className="text-xs text-status-error">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">CPF</Label>
          <Input id="document" placeholder="000.000.000-00" {...register("document")} />
          {errors.document && <p className="text-xs text-status-error">{errors.document.message}</p>}
        </div>

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

        <Button type="submit" className="w-full h-12 mt-4" disabled={isSubmitting}>
          {isSubmitting ? "Criando Conta..." : "Criar Conta"}
        </Button>

        <div className="text-center mt-6">
          <p className="text-sm text-text-secondary">
            Já possui uma conta?{' '}
            <Link href={`/login`} className="text-accent-primary font-bold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
