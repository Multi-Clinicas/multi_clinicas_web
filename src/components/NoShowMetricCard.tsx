"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import NoShowEmptySvg from "@/components/no-show-metric/NoShowEmptySvg";
import NoShowFlowSvg from "@/components/no-show-metric/NoShowFlowSvg";

interface NoShowMetricCardProps {
  realizadoCount: number;
  faltouCount: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function NoShowMetricCard({ realizadoCount, faltouCount }: NoShowMetricCardProps) {
  const concluidoCount = realizadoCount + faltouCount;
  const hasCompletedData = concluidoCount > 0;
  const noShowRate = concluidoCount > 0 ? faltouCount / concluidoCount : 0;
  const comparecimentoRate = concluidoCount > 0 ? realizadoCount / concluidoCount : 0;

  const mainStrokeWidth = 2 + comparecimentoRate * 2;
  const branchStrokeWidth = 1.5 + noShowRate;
  const solidNodes = clamp(realizadoCount, 0, 5);
  const missedNodes = clamp(faltouCount, 0, 4);
  const travelDuration = `${clamp(6 - noShowRate * 2.5, 3.2, 6)}s`;
  const branchDuration = `${clamp(7 + noShowRate * 5, 7, 11)}s`;
  const noShowPercent = Math.round(noShowRate * 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-card border border-border-subtle bg-surface-card p-5 shadow-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent-primary">Absenteísmo do dia</p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">Fluxo de pacientes até a clínica</h2>
          <p className="mt-2 max-w-xl text-sm text-text-secondary">
            A linha principal mostra quem concluiu atendimento. A bifurcação fantasma representa as perdas por falta.
          </p>
        </div>

        <div className="rounded-card border border-border-subtle bg-surface-page px-4 py-3 text-right shadow-card">
          <p className="text-xs font-medium text-text-secondary">Taxa de falta</p>
          <p className="text-2xl font-bold text-text-primary">{noShowPercent}%</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-center">
        <div className="overflow-hidden rounded-card border border-border-subtle bg-surface-page px-4 py-4">
          {hasCompletedData ? (
            <NoShowFlowSvg
              mainStrokeWidth={mainStrokeWidth}
              branchStrokeWidth={branchStrokeWidth}
              solidNodes={solidNodes}
              missedNodes={missedNodes}
              travelDuration={travelDuration}
              branchDuration={branchDuration}
            />
          ) : (
            <div className="flex min-h-[148px] items-center gap-4 rounded-card border border-dashed border-border-default bg-surface-card px-5 py-4">
              <NoShowEmptySvg />

              <div>
                <h3 className="text-base font-bold text-text-primary">Sem sinal concluído nesta data</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  A visualização da rota aparece quando houver consultas marcadas como realizadas ou faltosas.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 xl:grid-cols-1">
          <div className="rounded-card border border-border-subtle bg-surface-page p-4 shadow-card">
            <p className="text-xs font-medium text-text-secondary">Realizados</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{realizadoCount}</p>
          </div>
          <div className="rounded-card border border-border-subtle bg-surface-page p-4 shadow-card">
            <p className="text-xs font-medium text-text-secondary">Faltas</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{faltouCount}</p>
          </div>
          <div className="rounded-card border border-border-subtle bg-surface-page p-4 shadow-card">
            <p className="text-xs font-medium text-text-secondary">Concluídos</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{concluidoCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
        <Building2 className="size-4 text-accent-primary" />
        {hasCompletedData
          ? `${realizadoCount} pacientes chegaram ao destino de atendimento, enquanto ${faltouCount} se dissiparam antes da clínica.`
          : "Assim que houver consultas realizadas ou faltosas nesta data, a rota de comparecimento aparecerá aqui."}
      </div>
    </motion.section>
  );
}