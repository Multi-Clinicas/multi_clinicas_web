import { ReactNode } from "react";
import { BackofficeSidebar } from "@/components/BackofficeSidebar";
import { BackofficeAuthGuard } from "@/components/BackofficeAuthGuard";

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  return (
    <BackofficeAuthGuard>
      <div className="flex h-screen bg-surface-page overflow-hidden">
        {/* Sidebar Retrátil */}
        <BackofficeSidebar />

        {/* Área Principal (Open Canvas) */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="h-full w-full bg-surface-card rounded-card shadow-card border border-border-subtle p-6 lg:p-10 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </BackofficeAuthGuard>
  );
}
