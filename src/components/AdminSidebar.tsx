"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Clínicas", href: "/admin/clinicas", icon: Building2 },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { clearAuthData } = useAuthStore();

    const handleLogout = () => {
        clearAuthData();
        router.push("/admin-login");
    };

    return (
        <aside className="flex flex-col w-64 min-h-screen bg-surface-page border-r border-border-subtle">
            {/* ── Brand ─────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-border-subtle">
                <div className="flex size-8 items-center justify-center rounded-panel bg-[image:var(--background-image-accent-gradient)]">
                    <span className="text-white text-sm font-bold leading-none">M</span>
                </div>
                <div>
                    <h1 className="text-text-primary text-sm font-bold leading-tight">
                        MultiClínicas
                    </h1>
                    <p className="text-text-muted text-xs">Portal Master</p>
                </div>
            </div>

            {/* ── Navigation ────────────────────────────────────────────────── */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-panel text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-accent-subtle text-accent-primary"
                                    : "text-text-secondary hover:bg-surface-card hover:text-text-primary"
                            )}
                        >
                            <item.icon className="size-4 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* ── Logout ────────────────────────────────────────────────────── */}
            <div className="px-3 py-4 border-t border-border-subtle">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-panel text-sm font-medium text-text-secondary hover:bg-surface-card hover:text-status-error transition-colors w-full cursor-pointer"
                >
                    <LogOut className="size-4 shrink-0" />
                    Sair
                </button>
            </div>
        </aside>
    );
}
