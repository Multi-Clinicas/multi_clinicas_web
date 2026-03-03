"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export function BackofficeAuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "RECEPCIONISTA")) {
                router.push("/login"); // Volta para o login do tenant
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-page">
                <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
            </div>
        );
    }

    if (!isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "RECEPCIONISTA")) {
        return null;
    }

    return <>{children}</>;
}
