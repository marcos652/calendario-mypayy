"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@/lib/zod-schemas";
import { loginWithEmail, resetPassword } from "@/services/auth.service";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
      function handleReset() {
        const email = getValues("email");
        if (!email) {
          showToast("Informe seu e-mail para redefinir a senha.", "info");
          return;
        }
        resetPassword(email)
          .then(() => showToast("E-mail de redefinição enviado!", "success"))
          .catch((error: any) => showToast(error?.message || "Erro ao enviar e-mail. Tente novamente.", "error"));
      }
    async function onSubmit(data: LoginValues) {
      try {
        await loginWithEmail(data.email, data.password);
        showToast("Login realizado com sucesso!", "success");
        router.replace("/dashboard");
      } catch (error: any) {
        showToast(error?.message || "Erro ao entrar. Verifique suas credenciais.", "error");
      }
    }
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-200 via-blue-100 to-blue-300 px-4">
      <Card className="w-full max-w-md space-y-6 relative overflow-visible shadow-2xl border-0">
        <div className="flex flex-col items-center mb-2">
          <span className="text-4xl">🔒</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Entrar</h1>
          <p className="text-base text-slate-500 mt-1">Acesse sua agenda de reuniões</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative flex items-center">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Mostrar senha"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold py-2 rounded-lg shadow-md hover:from-green-500 hover:to-blue-500 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <div className="flex items-center justify-between text-sm mt-2">
          <button type="button" className="text-blue-700 hover:underline" onClick={handleReset}>
            Esqueceu a senha?
          </button>
          <Link className="text-blue-700 font-medium hover:underline" href="/register">
            Criar conta
          </Link>
        </div>
      </Card>
    </div>
  );
}