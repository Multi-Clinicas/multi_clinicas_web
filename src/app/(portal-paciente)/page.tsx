"use client";

import { useState, useEffect } from "react";
import TenantHomePage from "./tenant-home";
import LandingPage from "@/components/LandingPage";

export default function RootPage() {
    const [view, setView] = useState<"loading" | "landing" | "tenant">("loading");

    useEffect(() => {
        const hostname = window.location.hostname;

        // Domínios raízes que mostram a landing page do SaaS
        const rootDomains = [
            "localhost",
            "127.0.0.1",
            "multiclinicas.com.br",
            "www.multiclinicas.com.br",
        ];

        if (rootDomains.includes(hostname)) {
            setView("landing");
        } else {
            setView("tenant");
        }
    }, []);

    if (view === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-page">
                <div className="animate-pulse w-12 h-12 rounded-xl bg-accent-primary/20" />
            </div>
        );
    }

    if (view === "landing") {
        return <LandingPage />;
    }

    return <TenantHomePage />;
}
