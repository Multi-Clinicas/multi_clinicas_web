"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Stethoscope,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/backoffice" },
  { icon: CalendarDays, label: "Agenda", href: "/backoffice/agenda", isDev: true },
  { icon: Activity, label: "Corpo Clínico", href: "/backoffice/medicos" },
  { icon: Stethoscope, label: "Especialidades", href: "/backoffice/especialidades" },
  { icon: Users, label: "Pacientes", href: "/backoffice/pacientes", isDev: true },
  { icon: Users, label: "Equipe", href: "/backoffice/usuarios-admin" },
  { icon: Settings, label: "Configurações", href: "/backoffice/configuracoes", isDev: true },
];

export function BackofficeSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { user, clearAuthData } = useAuthStore();

  const handleLogout = () => {
    clearAuthData();
    router.push("/login"); // Volta pro login do tenant
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.label === "Equipe") {
      return user?.role === "ADMIN";
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "relative h-screen bg-surface-card border-r border-border-subtle shadow-card flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Botão Retrátil */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-surface-card border border-border-default rounded-full p-1 text-text-muted hover:text-accent-primary hover:border-accent-primary transition-colors shadow-sm z-10"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Cabeçalho */}
      <div className="p-6 flex items-center h-20 border-b border-border-subtle">
        <div className={cn("w-8 h-8 rounded-lg bg-accent-gradient flex-shrink-0", isCollapsed && "mx-auto")} />
        {!isCollapsed && (
          <span className="ml-3 font-bold text-text-primary text-lg truncate">
            MultiClínicas
          </span>
        )}
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.isDev ? "#" : item.href}
            onClick={(e) => item.isDev && e.preventDefault()}
            className={cn(
              "flex items-center px-3 py-3 rounded-panel text-text-secondary hover:bg-surface-page hover:text-accent-primary transition-colors group relative",
              isCollapsed && "justify-center",
              item.isDev && "cursor-default opacity-80"
            )}
            title={isCollapsed ? (item.isDev ? `${item.label} (Em desenvolvimento)` : item.label) : undefined}
          >
            <item.icon size={20} className="flex-shrink-0 group-hover:text-accent-primary transition-colors" />
            {!isCollapsed && (
              <div className="ml-3 flex items-center justify-between w-full overflow-hidden">
                <span className="font-medium truncate">{item.label}</span>
                {item.isDev && (
                  <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20 flex-shrink-0">
                    Dev
                  </span>
                )}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer da Sidebar */}
      <div className="p-4 border-t border-border-subtle">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn("w-full text-text-secondary hover:text-status-error", isCollapsed ? "justify-center px-0" : "justify-start px-3")}
          title={isCollapsed ? "Sair" : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 font-medium">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
