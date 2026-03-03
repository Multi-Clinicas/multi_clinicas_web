"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Tipagem e Mocks para a landing page (B2C)
interface MedicoCatalogo {
  id: string;
  name: string;
  specialty: string;
  avatarUrl?: string;
}

const mockMedicos: MedicoCatalogo[] = [
  { id: "101", name: "Dr. Carlos Eduardo", specialty: "Cardiologia" },
  { id: "102", name: "Dra. Ana Paula", specialty: "Dermatologia" },
  { id: "103", name: "Dr. Roberto Silva", specialty: "Ortopedia" },
  { id: "104", name: "Dra. Juliana Mendes", specialty: "Pediatria" },
  { id: "105", name: "Dr. Fernando Souza", specialty: "Cardiologia" },
];

export default function TenantHomePage() {
  const [tenant, setTenant] = useState("Clinica");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('@multiclinicas:tenantName');
      const hostname = window.location.host;
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

      let sub = hostname.replace(`.${rootDomain}`, '');

      if (storedName) {
        setTenant(storedName);
      } else if (sub && sub !== hostname) {
        setTenant(sub.replace("-", " "));
      }
    }
  }, []);

  // Filtro puramente no lado do cliente
  const medicosFiltrados = useMemo(() => {
    if (!busca) return mockMedicos;
    const term = busca.toLowerCase();
    return mockMedicos.filter(
      (m) => m.name.toLowerCase().includes(term) || m.specialty.toLowerCase().includes(term)
    );
  }, [busca]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Visual da Clínica */}
      <header className="px-6 py-10 bg-surface-card rounded-b-3xl shadow-sm border-b border-border-subtle relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent-gradient flex items-center justify-center text-white font-bold text-2xl shadow-float">
            {tenant.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">Bem-vindo(a) à</p>
            <h1 className="text-2xl font-bold text-text-primary capitalize leading-tight">
              {tenant}
            </h1>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal: Catálogo de Médicos */}
      <main className="flex-1 px-6 py-8 space-y-6 max-w-4xl mx-auto w-full">

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Agendar Consulta</h2>
            <p className="text-sm text-text-secondary">Encontre o especialista ideal para você.</p>
          </div>

          {/* Campo de Busca Animado */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <Input
              placeholder="Buscar por médico ou especialidade..."
              className="pl-10 h-12 rounded-full bg-surface-card border-border-subtle shadow-sm"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de Profissionais com Animação */}
        <div className="pt-4">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {medicosFiltrados.length > 0 ? (
                medicosFiltrados.map((medico) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={medico.id}
                    className="bg-surface-card p-4 rounded-card border border-border-subtle shadow-card flex items-center gap-4 hover:border-accent-primary transition-colors group cursor-pointer"
                  >
                    {/* Avatar do Médico */}
                    <div className="w-14 h-14 rounded-full bg-surface-page border border-border-default flex items-center justify-center shrink-0 group-hover:bg-accent-subtle transition-colors">
                      <UserRound className="text-text-muted group-hover:text-accent-primary transition-colors" size={24} />
                    </div>

                    {/* Dados */}
                    <div className="flex-1">
                      <h3 className="font-bold text-text-primary">{medico.name}</h3>
                      <p className="text-sm text-text-secondary">{medico.specialty}</p>
                    </div>

                    <Link href="/agendamento">
                      <Button variant="outline" size="sm" className="rounded-full px-4 text-xs font-bold shrink-0">
                        Ver Agenda
                      </Button>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-12 text-center text-text-muted"
                >
                  Nenhum profissional encontrado para "{busca}".
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
