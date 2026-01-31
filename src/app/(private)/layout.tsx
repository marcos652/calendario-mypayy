"use client";

import { AuthGuard } from "@/components/ui/auth-guard";
import { AppShell } from "@/components/ui/app-shell";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
