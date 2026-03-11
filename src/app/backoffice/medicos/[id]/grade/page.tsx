"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";

const DIAS_SEMANA = [
  { id: 1, label: "Segunda-feira" },
  { id: 2, label: "Terça-feira" },
  { id: 3, label: "Quarta-feira" },
  { id: 4, label: "Quinta-feira" },
  { id: 5, label: "Sexta-feira" },
  { id: 6, label: "Sábado" },
  { id: 0, label: "Domingo" },
];

const gradeSchema = z.object({
  schedules: z.array(z.object({
    dayOfWeek: z.number(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (HH:MM)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (HH:MM)"),
  })).refine(items => {
    // Validação de intervalo (start < end)
    for (const item of items) {
      if (item.startTime >= item.endTime) return false;
    }
    return true;
  }, { message: "A hora inicial deve ser menor que a final" })
});

type GradeForm = z.infer<typeof gradeSchema>;

export default function GradeHorarioPage() {
  const params = useParams();
  const router = useRouter();
  const medicoId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<GradeForm>({
    resolver: zodResolver(gradeSchema),
    defaultValues: { schedules: [] }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules"
  });

  useEffect(() => {
    async function loadGrade() {
      try {
        const response = await api.get(`/grade-horario/medico/${medicoId}`);
        const schedules = response.data.map((item: any) => ({
          dayOfWeek: item.diaSemana,
          startTime: item.horaInicio.slice(0, 5),
          endTime: item.horaFim.slice(0, 5),
        }));
        reset({ schedules });
      } catch (error) {
        console.error("Erro ao carregar grade:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadGrade();
  }, [medicoId, reset]);

  // Utilitário para verificar interseções de tempo no mesmo dia
  const checkIntersections = (schedules: GradeForm['schedules']) => {
    for (let day = 0; day <= 6; day++) {
      const daySchedules = schedules.filter(s => s.dayOfWeek === day);
      for (let i = 0; i < daySchedules.length; i++) {
        for (let j = i + 1; j < daySchedules.length; j++) {
          const s1 = daySchedules[i];
          const s2 = daySchedules[j];
          // Lógica de colisão de tempo: A começa antes de B terminar E B começa antes de A terminar
          if (s1.startTime < s2.endTime && s2.startTime < s1.endTime) {
            return `Conflito de horários identificado na ${DIAS_SEMANA.find(d => d.id === day)?.label}.`;
          }
        }
      }
    }
    return null;
  };

  const onSubmit = async (data: GradeForm) => {
    setGlobalError(null);
    
    // Validação avançada de colisão
    const conflictError = checkIntersections(data.schedules);
    if (conflictError) {
      setGlobalError(conflictError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = data.schedules.map(s => ({
        medicoId: Number(medicoId),
        diaSemana: s.dayOfWeek,
        horaInicio: s.startTime,
        horaFim: s.endTime
      }));

      await api.put(`/grade-horario/medico/${medicoId}`, payload);
      
      alert("Grade de horários atualizada com sucesso!");
      router.push('/backoffice/medicos');
    } catch (error: any) {
      console.error(error);
      setGlobalError(error.response?.data?.message || "Ocorreu um erro ao salvar a grade.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTurno = (dayOfWeek: number) => {
    append({ dayOfWeek, startTime: "08:00", endTime: "12:00" });
  };

  if (isLoading) return <div className="p-10 text-center">Carregando horários...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Configurar Grade de Horários</h1>
          <p className="text-text-secondary mt-1">Defina os dias e os intervalos de atendimento deste profissional.</p>
        </div>
      </header>

      {globalError && (
        <div className="p-4 bg-status-error/10 border border-status-error text-status-error rounded-panel font-medium">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-surface-card border border-border-subtle rounded-card shadow-card overflow-hidden divide-y divide-border-subtle">
          
          {DIAS_SEMANA.map((dia) => {
            // Filtra os campos que pertencem a este dia específico
            const turnosDoDia = fields.map((field, index) => ({ field, index })).filter(item => item.field.dayOfWeek === dia.id);
            
            return (
              <div key={dia.id} className="p-6 md:flex md:items-start md:gap-8 hover:bg-surface-page/50 transition-colors">
                {/* Coluna do Dia */}
                <div className="md:w-48 shrink-0 mb-4 md:mb-0">
                  <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <CalendarDays size={16} className="text-accent-primary" />
                    {dia.label}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    {turnosDoDia.length === 0 ? "Nenhum turno" : `${turnosDoDia.length} turno(s)`}
                  </p>
                </div>

                {/* Coluna dos Turnos */}
                <div className="flex-1 space-y-3">
                  {turnosDoDia.length === 0 ? (
                    <div className="text-sm text-text-muted italic py-2">O médico não atende neste dia.</div>
                  ) : (
                    turnosDoDia.map(({ field, index }) => (
                      <div key={field.id} className="flex items-end gap-3 bg-surface-page p-3 rounded-panel border border-border-default">
                        <div className="space-y-1">
                          <Label className="text-xs text-text-secondary flex items-center gap-1">
                            <Clock size={12}/> Início
                          </Label>
                          <Input 
                            type="time" 
                            className="w-28 h-9" 
                            {...register(`schedules.${index}.startTime`)} 
                          />
                        </div>
                        <span className="text-text-muted font-bold mb-2">-</span>
                        <div className="space-y-1">
                          <Label className="text-xs text-text-secondary flex items-center gap-1">
                            <Clock size={12}/> Fim
                          </Label>
                          <Input 
                            type="time" 
                            className="w-28 h-9" 
                            {...register(`schedules.${index}.endTime`)} 
                          />
                        </div>
                        
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon-sm" 
                          className="mb-0.5 text-text-secondary hover:text-status-error hover:bg-status-error/10 ml-auto"
                          onClick={() => remove(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))
                  )}

                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-accent-primary border-accent-subtle hover:bg-accent-subtle"
                    onClick={() => addTurno(dia.id)}
                  >
                    <Plus size={14} className="mr-1" /> Adicionar Turno
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando Grade..." : "Salvar Grade de Horários"}
          </Button>
        </div>
      </form>
    </div>
  );
}
