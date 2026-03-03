"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarX, Clock, UserRound, ChevronLeft, ChevronRight, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

interface Agendamento {
  id: number;
  pacienteId: number;
  nomePaciente: string;
  medicoId: number;
  nomeMedico: string;
  dataConsulta: string;
  horaInicio: string;
  horaFim: string;
  status: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  AGENDADO: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Agendado" },
  CONFIRMADO: { color: "bg-indigo-100 text-indigo-800 border-indigo-200", label: "Confirmado" },
  AGUARDANDO: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Aguardando" },
  EM_ATENDIMENTO: { color: "bg-green-100 text-green-800 border-green-200", label: "Em Atendimento" },
  REALIZADO: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Realizado" },
  FALTOU: { color: "bg-red-100 text-red-800 border-red-200", label: "Faltou" },
  CANCELADO_PACIENTE: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelado" },
  CANCELADO_CLINICA: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelado" },
};

export default function BackofficeDashboard() {
  const { activeTenant } = useAuthStore();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/agendamentos');
        // Filtra os agendamentos da data selecionada
        const todayStr = format(currentDate, "yyyy-MM-dd");
        setAgendamentos(data.filter((a: Agendamento) => a.dataConsulta === todayStr));
      } catch (error) {
        console.error("Erro ao buscar agendamentos. Usando dados mockados...", error);
        // Fallback mock
        const todayStr = format(currentDate, "yyyy-MM-dd");
        setAgendamentos([
          {
            id: 1, pacienteId: 1, nomePaciente: "Maria Silva", medicoId: 101, nomeMedico: "Dr. Carlos Eduardo",
            dataConsulta: todayStr, horaInicio: "09:00:00", horaFim: "09:45:00", status: "CONFIRMADO"
          },
          {
            id: 2, pacienteId: 2, nomePaciente: "João Santos", medicoId: 102, nomeMedico: "Dra. Ana Paula",
            dataConsulta: todayStr, horaInicio: "10:30:00", horaFim: "11:30:00", status: "AGUARDANDO"
          },
          {
            id: 3, pacienteId: 3, nomePaciente: "Pedro Alves", medicoId: 103, nomeMedico: "Dr. Roberto Silva",
            dataConsulta: todayStr, horaInicio: "14:00:00", horaFim: "15:00:00", status: "AGENDADO"
          },
          {
            id: 4, pacienteId: 4, nomePaciente: "Fernanda Costa", medicoId: 101, nomeMedico: "Dr. Carlos Eduardo",
            dataConsulta: todayStr, horaInicio: "16:15:00", horaFim: "17:00:00", status: "EM_ATENDIMENTO"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgendamentos();
  }, [currentDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // Escala de horários (08:00 às 18:00)
  const hours = useMemo(() => Array.from({ length: 11 }, (_, i) => i + 8), []);
  const ROW_HEIGHT = 80; // 80px por hora

  const calculateStyle = (start: string, end: string) => {
    // start/end no formato "HH:mm:ss" ou "HH:mm"
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const baseHour = 8;
    const top = ((startH - baseHour) + (startM / 60)) * ROW_HEIGHT;
    const height = ((endH - startH) + ((endM - startM) / 60)) * ROW_HEIGHT;

    return { top: `${top}px`, height: `${height}px` };
  };

  // Organizar agendamentos em colunas se houver sobreposição seria o ideal,
  // mas como o dashboard é geral, podemos agrupar por médico se houver muitos,
  // ou apenas listá-los em uma timeline única. Para uma visualização diária simples,
  // desenharemos blocos no eixo Y. Se eles se sobrepõem, vamos apenas empilhá-los usando margin/flex.
  // Uma abordagem melhor para recepção: exibir uma timeline onde os agendamentos fluem,
  // se houver colisão de horário (médicos diferentes), eles dividem a largura.

  // Agrupando eventos por hora para evitar colapso visual complexo em um CSS grid básico
  // Ou usamos absolut positioning no grid diário.

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

      <div className="flex-1 bg-surface-page border border-border-subtle rounded-panel overflow-hidden flex flex-col relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-32 h-32 bg-surface-card rounded-full flex items-center justify-center shadow-sm border border-border-subtle mb-6">
              <CalendarX size={48} className="text-text-muted" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Mesa Limpa</h2>
            <p className="text-text-secondary max-w-md">
              Nenhum agendamento encontrado para esta data. Aproveite para organizar a clínica ou verificar outras datas.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="relative min-w-[600px]">
              {/* Linhas de Horário do Grid */}
              {hours.map((hour) => (
                <div key={hour} className="flex border-b border-border-subtle" style={{ height: `${ROW_HEIGHT}px` }}>
                  <div className="w-20 pr-4 text-right text-xs font-medium text-text-secondary flex-shrink-0 -mt-2">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 border-l border-border-subtle"></div>
                </div>
              ))}

              {/* Eventos Posicionados Absolutamente */}
              <div className="absolute top-0 left-20 right-0 bottom-0 pointer-events-none">
                {agendamentos.map((ag) => {
                  const style = calculateStyle(ag.horaInicio, ag.horaFim);
                  const status = statusConfig[ag.status] || statusConfig.AGENDADO;

                  return (
                    <div
                      key={ag.id}
                      className={cn(
                        "absolute left-4 right-4 rounded-md border p-3 flex flex-col gap-1 overflow-hidden pointer-events-auto shadow-sm hover:shadow-md transition-shadow cursor-pointer",
                        status.color
                      )}
                      style={{ ...style, minHeight: '40px' }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm truncate flex items-center gap-1">
                          <UserRound size={14} /> {ag.nomePaciente}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 border border-white/20">
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs opacity-90 truncate">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {ag.horaInicio.substring(0, 5)} - {ag.horaFim.substring(0, 5)}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <Stethoscope size={12} /> {ag.nomeMedico}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
