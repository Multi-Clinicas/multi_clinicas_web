"use client";

import { useEffect, useState, ReactNode } from "react";
import axios from "axios"; // Usamos axios puro aqui para não passar pelo nosso interceptor que exige o X-Clinic-ID

export default function TenantProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveTenant = async () => {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;

      // Define os domínios raízes que não possuem tenant
      const rootDomains = [
        'localhost',
        '127.0.0.1',
        'multiclinicas.com.br',
        'www.multiclinicas.com.br',
        process.env.NEXT_PUBLIC_ROOT_DOMAIN
      ].filter(Boolean);

      // Ignora verificação de tenant na rota admin ou nos domínios principais (ex: landing page)
      if (pathname.startsWith('/admin') || rootDomains.includes(hostname)) {
        setIsReady(true);
        return;
      }

      // Extrai o subdomínio (ex: 'clinica-vida')
      const subdomain = hostname.split('.')[0];

      try {
        // SEMPRE consulta a API para validar se a clínica ainda existe e está ativa
        const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
        const response = await axios.get(`${baseURL}/clinicas/subdominio/${subdomain}`);

        // Bloqueia acesso total ao site se a clínica estiver inativa
        if (response.data.ativo === false) {
          // Limpa o cache local para forçar re-validação na próxima visita
          localStorage.removeItem('@multiclinicas:tenantId');
          localStorage.removeItem('@multiclinicas:subdomain');
          localStorage.removeItem('@multiclinicas:tenantName');
          setError("Esta clínica está temporariamente inativa. Entre em contato com a administração.");
          return;
        }

        // Salva o ID numérico retornado pelo Java (ex: 1)
        localStorage.setItem('@multiclinicas:tenantId', response.data.id.toString());
        localStorage.setItem('@multiclinicas:subdomain', subdomain);

        // Também podemos salvar o nome fantasia para usar no TopBar
        localStorage.setItem('@multiclinicas:tenantName', response.data.nomeFantasia);

        setIsReady(true);
      } catch (err) {
        console.error("Clínica não encontrada:", err);
        setError("Clínica não encontrada. Verifique o endereço digitado.");
      }
    };

    resolveTenant();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page p-6 text-center">
        <div>
          <h1 className="text-3xl font-bold text-status-error mb-2">404</h1>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  // Enquanto não descobrir o ID, mostra uma tela de loading para não quebrar as chamadas da API das páginas filhas
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page">
        <div className="animate-pulse w-12 h-12 rounded-xl bg-accent-primary/20"></div>
      </div>
    );
  }

  return <>{children}</>;
}
