import { CalendarX, Clock, Stethoscope, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Agendamento,
  calculateAppointmentStyle,
  getHourScale,
  ROW_HEIGHT,
  statusConfig,
} from "../_lib/dashboard";

interface DailyAgendaTimelineProps {
  agendamentos: Agendamento[];
  loading: boolean;
}

function AgendaLoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="h-8 w-8 rounded-full border-4 border-accent-primary border-t-transparent animate-spin" />
    </div>
  );
}

function AgendaEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border border-border-subtle bg-surface-card shadow-card">
        <CalendarX size={48} className="text-text-muted" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-text-primary">Mesa Limpa</h2>
      <p className="max-w-md text-text-secondary">
        Nenhum agendamento encontrado para esta data. Aproveite para organizar a clínica ou verificar outras datas.
      </p>
    </div>
  );
}

export default function DailyAgendaTimeline({ agendamentos, loading }: DailyAgendaTimelineProps) {
  const hours = getHourScale();

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded-panel border border-border-subtle bg-surface-page">
      {loading ? (
        <AgendaLoadingState />
      ) : agendamentos.length === 0 ? (
        <AgendaEmptyState />
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="relative min-w-[600px]">
            {hours.map((hour) => (
              <div key={hour} className="flex border-b border-border-subtle" style={{ height: `${ROW_HEIGHT}px` }}>
                <div className="-mt-2 w-20 flex-shrink-0 pr-4 text-right text-xs font-medium text-text-secondary">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                <div className="flex-1 border-l border-border-subtle" />
              </div>
            ))}

            <div className="pointer-events-none absolute inset-y-0 left-20 right-0 top-0">
              {agendamentos.map((agendamento) => {
                const style = calculateAppointmentStyle(agendamento.horaInicio, agendamento.horaFim);
                const status = statusConfig[agendamento.status] || statusConfig.AGENDADO;

                return (
                  <div
                    key={agendamento.id}
                    className={cn(
                      "pointer-events-auto absolute left-4 right-4 flex min-h-[40px] cursor-pointer flex-col gap-1 overflow-hidden rounded-panel border p-3 shadow-card transition-shadow hover:shadow-float",
                      status.color
                    )}
                    style={style}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 truncate text-sm font-bold">
                        <UserRound size={14} />
                        {agendamento.nomePaciente}
                      </span>
                      <span className="rounded-full border border-white/20 bg-white/50 px-2 py-0.5 text-[10px] font-bold">
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 truncate text-xs opacity-90">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {agendamento.horaInicio.substring(0, 5)} - {agendamento.horaFim.substring(0, 5)}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <Stethoscope size={12} />
                        {agendamento.nomeMedico}
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
  );
}