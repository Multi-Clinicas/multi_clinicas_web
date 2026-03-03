"use client";

import { useEffect } from "react";
import FadeInWrapper from "@/components/FadeInWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function Styleguide() {
  const { user, isAuthenticated, setAuthData, clearAuthData } = useAuthStore();

  useEffect(() => {
    // Adicionando um token dummy para testar o interceptor
    if (!isAuthenticated) {
      localStorage.setItem('@multiclinicas:token', 'dummy_jwt_token_123');
    }

    // Requisição mock apenas para visualização no Network tab
    api.get('/health-check').catch(() => {
      console.log('Requisição mock disparada para teste de Interceptor.');
    });
  }, [isAuthenticated]);

  const handleMockLogin = () => {
    setAuthData(
      { id: '1', name: 'Dr. Carlos Eduardo', email: 'carlos@clinica.com', role: 'ADMIN' },
      'mock_jwt_token_456',
      { id: 'tenant-1', name: 'Clínica Vida', subdomain: 'clinica-vida' }
    );
  };

  return (
    <main className="p-12 space-y-12 max-w-4xl mx-auto pb-32">
      <h1 className="text-4xl font-bold text-text-primary">Styleguide MultiClínicas</h1>

      <FadeInWrapper>
        <section className="space-y-4 mb-12 p-6 bg-surface-card border-l-4 border-l-accent-primary shadow-card rounded-r-panel">
          <h2 className="text-xl font-bold text-text-primary mb-2">Painel de Teste de Autenticação Global (Zustand/Context)</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium">Status da Sessão:</span>
            {isAuthenticated ? (
              <span className="px-2 py-1 bg-status-success/20 text-status-success rounded text-xs font-bold">LOGADO</span>
            ) : (
              <span className="px-2 py-1 bg-status-error/20 text-status-error rounded text-xs font-bold">DESLOGADO</span>
            )}
          </div>
          {user && (
            <pre className="text-xs bg-surface-page p-4 rounded text-text-secondary overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          )}
          <div className="flex gap-4 mt-4">
            <Button onClick={handleMockLogin}>Fazer Mock Login</Button>
            <Button onClick={clearAuthData} variant="outline" className="text-status-error border-status-error hover:bg-status-error/10 hover:text-status-error">Logout (Limpar Sessão)</Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-text-secondary">Cores e Fundos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-card bg-surface-page border border-border-default shadow-card">surface-page</div>
            <div className="p-4 rounded-card bg-surface-card border border-border-subtle shadow-card text-text-primary">surface-card</div>
            <div className="p-4 rounded-panel bg-surface-elevated shadow-float text-text-primary">surface-elevated</div>
            <div className="p-4 rounded-card bg-accent-subtle text-accent-primary font-bold">accent-subtle</div>
          </div>
        </section>

        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-text-secondary">Componentes: Botões (shadcn customizados)</h2>
          <div className="flex gap-4 flex-wrap">
            <Button>Padrão (Gradient)</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Erro/Destrutivo</Button>
          </div>
        </section>

        <section className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-text-secondary">Componentes: Inputs e Cards</h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Agendar Consulta</CardTitle>
              <CardDescription>Preencha seus dados para confirmar seu horário.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Ex: Maria Silva" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="maria@exemplo.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Confirmar Agendamento</Button>
            </CardFooter>
          </Card>
        </section>
      </FadeInWrapper>
    </main>
  );
}
