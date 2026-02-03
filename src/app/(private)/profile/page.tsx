"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { profileSchema } from "@/lib/zod-schemas";
import { updateUserProfile } from "@/services/users.service";
import { updateUserGroupPermissions } from "@/services/users.service";
import { useAuth } from "@/hooks/useAuth";
import { useAvailability } from "@/hooks/useAvailability";
import { AvailabilityEditor } from "@/components/forms/availability-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { AvailabilityRule } from "@/types/user";
import { getErrorMessage } from "@/utils/errors";
import { Switch } from "@/components/ui/switch";

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { availability, saveAvailability, saving } = useAvailability();
  const { showToast } = useToast();
  const [localAvailability, setLocalAvailability] = useState<AvailabilityRule[]>(availability);
  const [savingPerms, setSavingPerms] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (profile) {
      reset({ name: profile.name, photoUrl: profile.photoUrl ?? "" });
      // ...existing code...
      setLocalAvailability(profile.availability ?? []);
    }
  }, [profile, reset]);

  const onSubmit = async (values: ProfileValues) => {
    if (!user) {
      return;
    }
    try {
      await updateUserProfile(user.uid, {
        name: values.name,
        photoUrl: values.photoUrl || undefined,
      });
      await refreshProfile();
      showToast("Perfil atualizado.", "success");
    } catch (error) {
      showToast(getErrorMessage(error, "Falha ao atualizar o perfil."), "error");
    }
  };

  const handleAvailabilitySave = async () => {
    try {
      await saveAvailability(localAvailability);
      showToast("Disponibilidade salva.", "success");
    } catch (error) {
      showToast(getErrorMessage(error, "Falha ao salvar disponibilidade."), "error");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold text-slate-900">Perfil</h1>
        <p className="text-sm text-slate-500">Atualize suas informações básicas.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="photoUrl">URL da foto</Label>
            <Input id="photoUrl" {...register("photoUrl")} />
            {errors.photoUrl && <p className="mt-1 text-xs text-red-600">{errors.photoUrl.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar perfil"}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Disponibilidade</h2>
            <p className="text-sm text-slate-500">Configure sua disponibilidade recorrente.</p>
          </div>
          <Button variant="secondary" onClick={handleAvailabilitySave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar disponibilidade"}
          </Button>
        </div>
        <div className="mt-6">
          <AvailabilityEditor value={localAvailability} onChange={setLocalAvailability} />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <span>Permissões em Grupos</span>
          <span className="inline-block text-green-500">🔒</span>
        </h2>
        {profile?.gruposPermissoes && Object.keys(profile.gruposPermissoes).length > 0 ? (
          <ul className="grid md:grid-cols-2 gap-4">
            {Object.entries(profile.gruposPermissoes).map(([grupoId, permissoes]) => (
              <li key={grupoId} className="border rounded-xl p-4 bg-gradient-to-br from-green-50 to-white shadow-sm hover:shadow-md transition-all">
                <div className="font-semibold text-green-700 flex items-center gap-2">
                  <span className="inline-block bg-green-100 text-green-700 rounded px-2 py-0.5 text-xs font-mono">Grupo</span>
                  <span className="font-mono text-base">{grupoId}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([
                    "visualizar-agenda",
                    "modificar-agenda",
                    "agendar-reuniao",
                    "excluir-call",
                    "editar-reuniao"
                  ] as import("@/types/group").GrupoPermissao[]).map((perm) => {
                    const checked = permissoes.includes(perm);
                    return (
                      <Switch
                        key={perm}
                        checked={checked}
                        onChange={async (checked) => {
                          if (!user) return;
                          setSavingPerms(grupoId + perm);
                          const novasPerms: import("@/types/group").GrupoPermissao[] = checked
                            ? ([...permissoes, perm] as import("@/types/group").GrupoPermissao[])
                            : (permissoes.filter(p => p !== perm) as import("@/types/group").GrupoPermissao[]);
                          try {
                            await updateUserGroupPermissions(user.uid, grupoId, novasPerms);
                            await refreshProfile();
                            showToast("Permissão atualizada!", "success");
                          } catch (err) {
                            showToast(getErrorMessage(err, "Erro ao atualizar permissão."), "error");
                          } finally {
                            setSavingPerms(null);
                          }
                        }}
                        label={perm.replace(/-/g, " ").replace("agenda", "agenda 📅").replace("reuniao", "reunião 🗓️").replace("excluir", "excluir ❌").replace("modificar", "modificar ✏️").replace("visualizar", "visualizar 👁️")}
                        disabled={savingPerms === grupoId + perm}
                      />
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-slate-500 text-sm flex items-center gap-2">
            <span>Você não possui permissões em nenhum grupo.</span>
            <span className="text-xl">🔓</span>
          </div>
        )}
      </Card>
    </div>
  );
}
