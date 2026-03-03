"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = [
    { label: "Início", icon: Home, href: "" }, // Usamos href "" dinamicamente preenchido caso necessário, mas para esse caso vamos gerenciar a URL raiz
    { label: "Consultas", icon: Calendar, href: "/consultas" },
    ...(user?.role === "ADMIN" ? [{ label: "Gestão", icon: LayoutDashboard, href: "/backoffice" }] : []),
    { label: "Perfil", icon: User, href: "/perfil" },
  ];

  return (
    <nav className="absolute bottom-0 w-full bg-surface-card border-t border-border-subtle flex items-center justify-around h-[72px] px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] z-50">
      {navItems.map((item) => {
        // Lógica simplificada para determinar rota ativa:
        const isActive = pathname.endsWith(item.href) && (item.href !== "" || pathname.split('/').length <= 2);

        return (
          <Link
            key={item.label}
            href={item.href === "" ? "/" : item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full min-h-[48px] min-w-[48px] touch-manipulation",
              isActive ? "text-accent-primary" : "text-text-muted hover:text-text-secondary"
            )}
          >
            <item.icon size={24} className={cn("mb-1", isActive && "fill-accent-primary/20")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
