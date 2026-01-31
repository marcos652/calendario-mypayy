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
  const [resetting, setResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);

  async function handleReset(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!resetEmail) {
      setResetMessage("Informe seu e-mail para redefinir a senha.");
      return;
    }
    setResetting(true);
    setResetMessage(null);
    try {
      await resetPassword(resetEmail);
      setResetMessage("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setResetMessage(error.message);
      } else {
        setResetMessage("Erro ao enviar e-mail. Tente novamente.");
      }
    } finally {
      setResetting(false);
    }
  }

  async function onSubmit(data: LoginValues) {
    try {
      await loginWithEmail(data.email, data.password);
      if (lembrarDispositivo) {
        localStorage.setItem("lembrarDispositivo", "true");
        localStorage.setItem("emailLembrado", data.email);
      } else {
        localStorage.removeItem("lembrarDispositivo");
        localStorage.removeItem("emailLembrado");
      }
      showToast("Login realizado com sucesso!", "success");
      router.replace("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("Erro ao entrar. Verifique suas credenciais.", "error");
      }
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
  const [lembrarDispositivo, setLembrarDispositivo] = useState(false);

  useEffect(() => {
    // Preenche o e-mail se o usuário marcou para lembrar
    const lembrar = localStorage.getItem("lembrarDispositivo") === "true";
    setLembrarDispositivo(lembrar);
    if (lembrar) {
      const emailSalvo = localStorage.getItem("emailLembrado");
      if (emailSalvo) {
        // Preenche o campo de e-mail
        setTimeout(() => {
          // Aguarda o form montar
          (document.getElementById("email") as HTMLInputElement).value = emailSalvo;
        }, 0);
      }
    }
  }, []);
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
          <div className="flex items-center gap-2">
            <input
              id="lembrarDispositivo"
              type="checkbox"
              checked={lembrarDispositivo}
              onChange={e => setLembrarDispositivo(e.target.checked)}
              className="accent-blue-500"
            />
            <label htmlFor="lembrarDispositivo" className="text-sm text-slate-700 select-none cursor-pointer">
              Lembrar este dispositivo
            </label>
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
          <button
            type="button"
            className="text-blue-700 hover:underline"
            onClick={() => setShowReset((v) => !v)}
          >
            Esqueceu a senha?
          </button>
          <Link className="text-blue-700 font-medium hover:underline" href="/register">
            Criar conta
          </Link>
        </div>
        {showReset && (
          <div className="animate-fade-in mt-6 flex justify-center">
            <form
              className="w-full max-w-sm bg-white/90 border border-blue-200 rounded-xl shadow-lg p-6 flex flex-col gap-4"
              onSubmit={handleReset}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-500 text-2xl">🔑</span>
                <span className="font-semibold text-blue-900 text-lg">Redefinir senha</span>
              </div>
              <Label htmlFor="resetEmail" className="text-slate-700">E-mail</Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                autoComplete="username"
                placeholder="Digite seu e-mail"
                required
                className="bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-300"
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-400 to-green-400 text-white font-bold py-2 rounded-lg shadow-md hover:from-blue-500 hover:to-green-500 transition"
                disabled={resetting}
              >
                {resetting ? "Enviando..." : "Enviar link de redefinição"}
              </Button>
              {resetMessage && (
                <div className={`text-sm mt-1 text-center ${resetMessage.includes("enviado") ? "text-green-600" : "text-red-600"}`}>
                  {resetMessage}
                </div>
              )}
            </form>
          </div>
        )}

      </Card>
    </div>
  );
}