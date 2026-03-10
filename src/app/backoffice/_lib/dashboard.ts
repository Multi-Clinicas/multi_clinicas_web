export interface Agendamento {
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

export interface AgendaMetrics {
  realizadoCount: number;
  faltouCount: number;
}

export const ROW_HEIGHT = 80;

export const statusConfig: Record<string, { color: string; label: string }> = {
  AGENDADO: { color: "bg-surface-card text-text-primary border-border-default", label: "Agendado" },
  CONFIRMADO: { color: "bg-accent-subtle text-accent-primary border-accent-primary/10", label: "Confirmado" },
  AGUARDANDO: { color: "bg-surface-page text-text-secondary border-border-default", label: "Aguardando" },
  EM_ATENDIMENTO: { color: "bg-accent-subtle text-accent-primary border-accent-primary/10", label: "Em Atendimento" },
  REALIZADO: { color: "bg-status-success/10 text-status-success border-status-success/20", label: "Realizado" },
  FALTOU: { color: "bg-status-error/10 text-status-error border-status-error/20", label: "Faltou" },
  CANCELADO_PACIENTE: { color: "bg-status-error/10 text-status-error border-status-error/20", label: "Cancelado" },
  CANCELADO_CLINICA: { color: "bg-status-error/10 text-status-error border-status-error/20", label: "Cancelado" },
};

export function createFallbackAgendamentos(todayStr: string): Agendamento[] {
  return [
    {
      id: 1,
      pacienteId: 1,
      nomePaciente: "Maria Silva",
      medicoId: 101,
      nomeMedico: "Dr. Carlos Eduardo",
      dataConsulta: todayStr,
      horaInicio: "09:00:00",
      horaFim: "09:45:00",
      status: "CONFIRMADO",
    },
    {
      id: 2,
      pacienteId: 2,
      nomePaciente: "João Santos",
      medicoId: 102,
      nomeMedico: "Dra. Ana Paula",
      dataConsulta: todayStr,
      horaInicio: "10:30:00",
      horaFim: "11:30:00",
      status: "AGUARDANDO",
    },
    {
      id: 3,
      pacienteId: 3,
      nomePaciente: "Pedro Alves",
      medicoId: 103,
      nomeMedico: "Dr. Roberto Silva",
      dataConsulta: todayStr,
      horaInicio: "14:00:00",
      horaFim: "15:00:00",
      status: "AGENDADO",
    },
    {
      id: 4,
      pacienteId: 4,
      nomePaciente: "Fernanda Costa",
      medicoId: 101,
      nomeMedico: "Dr. Carlos Eduardo",
      dataConsulta: todayStr,
      horaInicio: "16:15:00",
      horaFim: "17:00:00",
      status: "EM_ATENDIMENTO",
    },
  ];
}

export function filterAgendamentosByDate(agendamentos: Agendamento[], selectedDate: string) {
  return agendamentos.filter((agendamento) => agendamento.dataConsulta === selectedDate);
}

export function getAgendaMetrics(agendamentos: Agendamento[]): AgendaMetrics {
  return agendamentos.reduce(
    (accumulator, agendamento) => {
      if (agendamento.status === "REALIZADO") {
        accumulator.realizadoCount += 1;
      }

      if (agendamento.status === "FALTOU") {
        accumulator.faltouCount += 1;
      }

      return accumulator;
    },
    { realizadoCount: 0, faltouCount: 0 }
  );
}

export function getHourScale() {
  return Array.from({ length: 11 }, (_, index) => index + 8);
}

export function calculateAppointmentStyle(start: string, end: string) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const baseHour = 8;
  const top = ((startHour - baseHour) + startMinute / 60) * ROW_HEIGHT;
  const height = ((endHour - startHour) + (endMinute - startMinute) / 60) * ROW_HEIGHT;

  return {
    top: `${top}px`,
    height: `${height}px`,
  };
}