// src/app/(private)/groups/create/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { criarGrupo } from "@/services/groups.service";
import { Button } from "@/components/ui/button";

export default function CriarGrupoPage() {
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleCriarGrupo = async () => {
    if (!user) return;
    const grupo = await criarGrupo(nome, descricao, user.uid);
    setMensagem(`Grupo criado com sucesso! ID: ${grupo.id}`);
    setNome("");
    setDescricao("");
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="rounded-2xl border-2 border-green-200 bg-white/80 shadow-xl p-6 md:p-10 flex flex-col gap-6">
        <h1 className="text-2xl font-bold mb-4">Criar Grupo</h1>
        <input
          className="border-2 border-green-200 rounded-lg p-2 mb-2"
          placeholder="Nome do grupo"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <textarea
          className="border-2 border-green-200 rounded-lg p-2 mb-2"
          placeholder="Descrição"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
        />
        <Button onClick={handleCriarGrupo} disabled={!nome}>Criar</Button>
        {mensagem && <div className="text-green-600 font-medium mt-2">{mensagem}</div>}
      </div>
    </div>
  );
}
