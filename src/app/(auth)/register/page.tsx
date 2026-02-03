"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerSchema } from "@/lib/zod-schemas";
import { registerWithEmail } from "@/services/auth.service";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { getErrorMessage } from "@/utils/errors";


type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isFormFocused, setIsFormFocused] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Omit<RegisterValues, 'role'> & { role?: "usuario" | "admin" | "master" }>({ resolver: zodResolver(registerSchema), defaultValues: { role: "usuario" } });

  // Mostra campo de confirmação só após digitar senha
  const passwordValue = watch("password");

  // Animação para mostrar o campo de confirmação
  React.useEffect(() => {
    setShowConfirm(!!passwordValue);
  }, [passwordValue]);

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerWithEmail(values.name, values.email, values.password, values.role);
      showToast("Conta criada com sucesso!", "success");
      router.push("/dashboard");
    } catch (error) {
      showToast(getErrorMessage(error, "Erro ao registrar."), "error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-green-50 px-4">
      <Card
        className={`w-full max-w-md space-y-8 bg-white/80 shadow-2xl backdrop-blur-md border-0 transition-all duration-300 ${
          isFormFocused ? 'ring-2 ring-green-300/80 scale-[1.015]' : ''
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Criar conta</h1>
          <p className="text-base text-slate-500">Agende reuniões em poucos cliques.</p>
        </div>
        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit as unknown as SubmitHandler<Omit<RegisterValues, 'role'> & { role?: "usuario" | "admin" | "master" }>)}
          autoComplete="off"
          onFocus={() => setIsFormFocused(true)}
          onBlur={e => {
            // só tira o foco se não for para outro campo do form
            if (!e.currentTarget.contains(e.relatedTarget)) setIsFormFocused(false);
          }}
        >
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" autoFocus placeholder="Seu nome" {...register("name")}
              className="mt-1 bg-white/80 focus:bg-green-50/80 transition-colors" />
            {typeof errors.name?.message === "string" && <p className="mt-1 text-xs text-red-500 animate-fade-in">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="seu@email.com" {...register("email")}
              className="mt-1 bg-white/80 focus:bg-green-50/80 transition-colors" />
            {typeof errors.email?.message === "string" && <p className="mt-1 text-xs text-red-500 animate-fade-in">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="Crie uma senha" {...register("password")}
              className="mt-1 bg-white/80 focus:bg-green-50/80 transition-colors" />
            {typeof errors.password?.message === "string" && <p className="mt-1 text-xs text-red-500 animate-fade-in">{errors.password.message}</p>}
          </div>
          <div>
            <Label htmlFor="role">Tipo de conta</Label>
            <select
              id="role"
              {...register("role")}
              className="mt-1 bg-white/80 focus:bg-green-50/80 transition-colors border rounded px-2 py-1 w-full"
            >
              <option value="usuario">Usuário</option>
              <option value="admin">Administrador</option>
              <option value="master">Master</option>
            </select>
            {typeof errors.role?.message === "string" && <p className="mt-1 text-xs text-red-500 animate-fade-in">{errors.role.message}</p>}
          </div>
          {showConfirm && (
            <div className="animate-fade-in">
              <Label htmlFor="confirmPassword">Confirme a senha</Label>
              <Input id="confirmPassword" type="password" placeholder="Repita a senha" {...register("confirmPassword")}
                className="mt-1 bg-white/80 focus:bg-green-50/80 transition-colors" />
              {typeof errors.confirmPassword?.message === "string" && (
                <p className="mt-1 text-xs text-red-500 animate-fade-in">{errors.confirmPassword.message}</p>
              )}
            </div>
          )}
          <Button
            type="submit"
            className={`w-full mt-2 shadow-md hover:scale-[1.02] transition-transform bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 text-white font-semibold ${isSubmitting ? 'animate-gradient-x' : ''}`}
            size="lg"
            disabled={isSubmitting}
            style={isSubmitting ? { backgroundSize: '200% 100%' } : {}}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                Criando...
              </span>
            ) : "Criar conta"}
          </Button>
        </form>
        <div className="text-sm text-center">
          <Link className="text-slate-900 font-medium hover:underline transition" href="/login">
            Voltar para login
          </Link>
        </div>
      </Card>
    </div>
  );
}
