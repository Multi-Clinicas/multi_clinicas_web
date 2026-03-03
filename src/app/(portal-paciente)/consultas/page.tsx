"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, Clock4 } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock de consultas para o Dashboard B2C
const mockConsultas = [
  {
    id: "1",
    medico: "Dr. Carlos Eduardo",
    especialidade: "Cardiologista",
    data: "12/03/2026",
    hora: "14:30",
    status: "AGENDADA", // AGENDADA, REALIZADA, CANCELADA
  },
  {
    id: "2",
    medico: "Dra. Ana Paula",
    especialidade: "Dermatologista",
    data: "20/01/2026",
    hora: "09:00",
    status: "REALIZADA",
  },
  {
    id: "3",
    medico: "Dr. Roberto Silva",
    especialidade: "Ortopedista",
    data: "05/11/2025",
    hora: "16:00",
    status: "CANCELADA",
  }
];

export default function MinhasConsultasPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    // Proteção de rota no lado do cliente
    if (!isLoading && !isAuthenticated) {
      router.push(`/login`);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) return null; // Previne flashes de tela

  return (
    <div className="flex flex-col min-h-screen p-6 bg-surface-page pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Minhas Consultas</h1>
        <p className="text-sm text-text-secondary mt-1">Histórico e agendamentos futuros.</p>
      </header>

      <main className="space-y-4">
        {mockConsultas.map((consulta) => {
          const isAgendada = consulta.status === "AGENDADA";
          const isCancelada = consulta.status === "CANCELADA";
          const isRealizada = consulta.status === "REALIZADA";

          return (
            <div 
              key={consulta.id}
              className="bg-surface-card p-5 rounded-card border border-border-subtle shadow-card flex flex-col space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-text-primary text-lg">{consulta.medico}</h3>
                  <p className="text-sm text-text-secondary">{consulta.especialidade}</p>
                </div>
                {/* Badge de Status */}
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                  isAgendada && "bg-accent-subtle text-accent-primary",
                  isRealizada && "bg-status-success/10 text-status-success",
                  isCancelada && "bg-status-error/10 text-status-error"
                )}>
                  {isAgendada && <Clock4 size={12} />}
                  {isRealizada && <CheckCircle2 size={12} />}
                  {isCancelada && <XCircle size={12} />}
                  {consulta.status}
                </span>
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-text-muted" />
                  <span>{consulta.data}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-text-muted" />
                  <span className={cn(isAgendada && "text-accent-primary font-bold")}>{consulta.hora}</span>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
