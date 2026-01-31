"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/ui";

const navItems = [
  { href: "/dashboard", label: "Painel", icon: "🏠" },
  { href: "/calendar", label: "Agenda", icon: "🗓️" },
  { href: "/groups/create", label: "Criar Grupo", icon: "➕" },
  { href: "/groups/list", label: "Visualizar Grupos", icon: "👥" },
  { href: "/groups/manage", label: "Grupos e Permissões", icon: "🔒" },
  { href: "/users/manage", label: "Usuários e Hierarquias", icon: "🧑‍💼" },
  { href: "/meetings", label: "Reuniões", icon: "📞" },
  { href: "/profile", label: "Perfil", icon: "👤" },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-azul-100">
      <header className="borda-inferior borda-verde-300 bg-azul-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex flex-col items-start">
            <img src="/movingpay-logo.svg" alt="MovingPay Logo" className="mb-2 h-10 w-auto" />
            <p className="text-lg font-semibold text-slate-900">Agendador de Reuniões</p>
            <p className="text-xs text-slate-500">Agende reuniões sem conflitos</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-slate-600">{profile?.name || profile?.email}</span>
            {profile?.id && (
              <span className="text-xs text-slate-400">ID: {profile.id}</span>
            )}
            <Button variant="secondary" onClick={() => void logout()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
        <nav className="flex flex-col gap-2 rounded-2xl border-2 border-green-200 bg-white/90 p-4 shadow-xl">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-base font-semibold transition-all duration-150",
                pathname === item.href
                  ? "bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-md scale-[1.04]"
                  : "text-green-900 hover:bg-green-100 hover:scale-[1.02] hover:shadow-sm"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
};
