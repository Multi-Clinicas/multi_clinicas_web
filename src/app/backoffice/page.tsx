"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NoShowMetricCard from "@/components/NoShowMetricCard";
import { useAuthStore } from "@/store/useAuthStore";
import DailyAgendaTimeline from "./_components/DailyAgendaTimeline";
import {
  Agendamento,
  createFallbackAgendamentos,
  filterAgendamentosByDate,
  getAgendaMetrics,
} from "./_lib/dashboard";

export default function BackofficeDashboard() {
  const { activeTenant } = useAuthStore();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const selectedDate = useMemo(() => format(currentDate, "yyyy-MM-dd"), [currentDate]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<Agendamento[]>("/agendamentos");
        setAgendamentos(filterAgendamentosByDate(data, selectedDate));
      } catch (error) {
        console.error("Erro ao buscar agendamentos. Usando dados mockados...", error);
        setAgendamentos(createFallbackAgendamentos(selectedDate));
      } finally {
        setLoading(false);
      }
    };

    void fetchAgendamentos();
  }, [selectedDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const agendaMetrics = useMemo(() => getAgendaMetrics(agendamentos), [agendamentos]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{activeTenant?.name || "Agenda da Clínica"}</h1>
          <p className="text-text-secondary mt-1">Gerencie os horários e pacientes do dia.</p>
        </div>

        <div className="flex items-center gap-4 bg-surface-page p-2 rounded-panel border border-border-default">
          <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
            <ChevronLeft size={20} />
          </Button>
          <div className="text-center min-w-[150px]">
            <p className="text-sm font-bold text-text-primary capitalize">
              {format(currentDate, "EEEE", { locale: ptBR })}
            </p>
            <p className="text-xs text-text-secondary">
              {format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => changeDate(1)}>
            <ChevronRight size={20} />
          </Button>
        </div>
      </header>

      <NoShowMetricCard
        realizadoCount={agendaMetrics.realizadoCount}
        faltouCount={agendaMetrics.faltouCount}
      />

      <DailyAgendaTimeline agendamentos={agendamentos} loading={loading} />
    </div>
  );
}
