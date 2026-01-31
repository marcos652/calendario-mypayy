// src/app/(private)/groups/page.tsx
"use client";

import { useEffect, useState } from "react";
import { criarGrupo, adicionarMembro, removerMembro, buscarGrupo } from "@/services/groups.service";
import { useAuth } from "@/hooks/useAuth";
import { Grupo } from "@/types/group";
import { Button } from "@/components/ui/button";

export default function GruposPage() {
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [grupoId, setGrupoId] = useState("");
  const [novoMembro, setNovoMembro] = useState("");

  const handleCriarGrupo = async () => {
    if (!user) return;
    const g = await criarGrupo(nome, descricao, user.uid);
    setGrupo(g);
    setGrupoId(g.id);
  };

  const handleBuscarGrupo = async () => {
    if (!grupoId) return;
    const g = await buscarGrupo(grupoId);
    setGrupo(g);
  };

  const handleAdicionarMembro = async () => {
    if (!grupoId || !novoMembro) return;
    await adicionarMembro(grupoId, novoMembro);
    handleBuscarGrupo();
    setNovoMembro("");
  };

  const handleRemoverMembro = async (userId: string) => {
    if (!grupoId) return;
    await removerMembro(grupoId, userId);
    handleBuscarGrupo();
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Grupos</h1>
      <div className="mb-4">
        <input
          className="border p-2 mr-2"
          placeholder="Nome do grupo"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <input
          className="border p-2 mr-2"
          placeholder="Descrição"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
        />
        <Button onClick={handleCriarGrupo}>Criar grupo</Button>
      </div>
      <div className="mb-4">
        <input
          className="border p-2 mr-2"
          placeholder="ID do grupo"
          value={grupoId}
          onChange={e => setGrupoId(e.target.value)}
        />
        <Button onClick={handleBuscarGrupo}>Buscar grupo</Button>
      </div>
      {grupo && (
        <div className="border p-4 rounded">
          <h2 className="font-semibold text-lg">{grupo.nome}</h2>
          <p className="text-sm text-slate-600">{grupo.descricao}</p>
          <h3 className="mt-4 font-semibold">Membros:</h3>
          <ul className="mb-2">
            {grupo.membros.map((m) => (
              <li key={m} className="flex items-center justify-between">
                <span>{m}</span>
                <Button variant="danger" size="sm" onClick={() => handleRemoverMembro(m)}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              className="border p-2"
              placeholder="ID do novo membro"
              value={novoMembro}
              onChange={e => setNovoMembro(e.target.value)}
            />
            <Button onClick={handleAdicionarMembro}>Adicionar membro</Button>
          </div>
        </div>
      )}
    </div>
  );
}
