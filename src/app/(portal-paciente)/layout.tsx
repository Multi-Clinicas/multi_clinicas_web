"use client";

import { useState, useEffect, ReactNode } from "react";
import MobileBottomBar from "@/components/MobileBottomBar";
import DesktopTopBar from "@/components/DesktopTopBar";

export default function TenantResponsiveLayout({ children }: { children: ReactNode }) {
  const [isTenant, setIsTenant] = useState<boolean | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const rootDomains = [
      "localhost",
      "127.0.0.1",
      "multiclinicas.com.br",
      "www.multiclinicas.com.br",
    ];

    setIsTenant(!rootDomains.includes(hostname));
  }, []);

  // Enquanto detecta, evita flash de layout
  if (isTenant === null) {
    return (
      <div className="min-h-screen bg-surface-page flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-xl bg-accent-primary/20" />
      </div>
    );
  }

  // No domínio raiz (landing page), renderiza sem o shell do tenant
  if (!isTenant) {
    return <>{children}</>;
  }

  // Em subdomínios, renderiza com a TopBar/BottomBar completa
  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      {/* Navegação Topo - Apenas Desktop */}
      <div className="hidden md:block">
        <DesktopTopBar />
      </div>

      {/* Container Principal Responsivo */}
      <main className="flex-1 w-full max-w-6xl mx-auto md:py-8 md:px-6 relative flex flex-col">
        {/* Área de conteúdo do paciente */}
        <div className="flex-1 pb-24 md:pb-0 bg-surface-page md:bg-transparent">
          <div className="md:bg-surface-card md:border md:border-border-subtle md:shadow-card md:rounded-card md:min-h-[70vh] overflow-hidden">
            {children}
          </div>
        </div>

        {/* Barra de Navegação Inferior Fixa - Apenas Mobile */}
        <div className="md:hidden">
          <MobileBottomBar />
        </div>
      </main>
    </div>
  );
}
