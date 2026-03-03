import type { Metadata } from "next";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";

export const metadata: Metadata = {
    title: "Portal Master — MultiClínicas",
    description: "Painel de administração global do MultiClínicas SaaS",
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AdminAuthGuard>
            <div className="flex min-h-screen bg-surface-page">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </AdminAuthGuard>
    );
}
