// src/app/(private)/groups/manage/page.tsx
"use client";

import { useState } from "react";
import { criarGrupo, adicionarMembro, removerMembro, buscarGrupo } from "@/services/groups.service";
import { useAuth } from "@/hooks/useAuth";
import { Grupo } from "@/types/group";
import { Button } from "@/components/ui/button";

export default function GerenciarGruposPage() {
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [grupoId, setGrupoId] = useState("");
  const [novoMembro, setNovoMembro] = useState("");
  const [permissoes, setPermissoes] = useState<{[uid: string]: string}>({});
  const [novaPermissao, setNovaPermissao] = useState("");
  const [uidPermissao, setUidPermissao] = useState("");

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
    // Aqui você pode buscar permissões reais do backend se desejar
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

  const handleDefinirPermissao = () => {
    if (!uidPermissao || !novaPermissao) return;
    setPermissoes((prev) => ({ ...prev, [uidPermissao]: novaPermissao }));
    setUidPermissao("");
    setNovaPermissao("");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border-2 border-green-200 bg-white/80 shadow-xl p-6 md:p-10 flex flex-col gap-6">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Grupos e Permissões</h1>
        <div className="mb-4 flex flex-col md:flex-row gap-2 items-end">
          <div className="flex flex-col flex-1">
            <label htmlFor="nome-grupo" className="mb-1 text-sm font-medium text-slate-700">Nome do grupo</label>
            <input
              id="nome-grupo"
              className="border-2 border-green-200 rounded-lg p-2 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 transition outline-none"
              placeholder="Digite o nome do grupo"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-1">
            <label htmlFor="descricao-grupo" className="mb-1 text-sm font-medium text-slate-700">Descrição</label>
            <input
              id="descricao-grupo"
              className="border-2 border-green-200 rounded-lg p-2 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 transition outline-none"
              placeholder="Descreva o grupo (opcional)"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>
          <Button className="h-10 mt-4 md:mt-0" onClick={handleCriarGrupo}>Criar grupo</Button>
        </div>
        <div className="mb-4 flex flex-col md:flex-row gap-2 items-end">
          <div className="flex flex-col flex-1">
            <label htmlFor="id-grupo" className="mb-1 text-sm font-medium text-slate-700">ID do grupo</label>
            <input
              id="id-grupo"
              className="border-2 border-green-200 rounded-lg p-2 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 transition outline-none"
              placeholder="Digite o ID do grupo"
              value={grupoId}
              onChange={e => setGrupoId(e.target.value)}
            />
          </div>
          <Button className="h-10 mt-4 md:mt-0" onClick={handleBuscarGrupo}>Buscar grupo</Button>
        </div>
        {grupo && (
          <div className="border-2 border-green-200 p-4 rounded-xl bg-green-50/40">
            <h2 className="font-semibold text-lg">{grupo.nome}</h2>
            <p className="text-sm text-slate-600">{grupo.descricao}</p>
            <h3 className="mt-4 font-semibold">Membros:</h3>
            <ul className="mb-2">
              {grupo.membros.map((m) => (
                <li key={m} className="flex items-center justify-between">
                  <span>{m} <span className="ml-2 text-xs text-slate-500">Permissão: {permissoes[m] || "usuário"}</span></span>
                  <Button variant="danger" size="sm" onClick={() => handleRemoverMembro(m)}>
                    Remover
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mb-2">
              <input
                className="border p-2"
                placeholder="ID do novo membro"
                value={novoMembro}
                onChange={e => setNovoMembro(e.target.value)}
              />
              <Button onClick={handleAdicionarMembro}>Adicionar membro</Button>
            </div>
            <div className="flex gap-2 items-center">
              <input
                className="border p-2"
                placeholder="ID do membro"
                value={uidPermissao}
                onChange={e => setUidPermissao(e.target.value)}
              />
              <input
                className="border p-2"
                placeholder="Permissão (ex: admin, usuário)"
                value={novaPermissao}
                onChange={e => setNovaPermissao(e.target.value)}
              />
              <Button onClick={handleDefinirPermissao}>Definir permissão</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
