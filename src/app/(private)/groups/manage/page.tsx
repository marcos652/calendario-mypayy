// src/app/(private)/groups/manage/page.tsx
"use client";

import { useState } from "react";
import { criarGrupo, adicionarMembro, removerMembro, buscarGrupo, atualizarPermissoesGrupo } from "@/services/groups.service";
import { updateUserGroupPermissions } from "@/services/users.service";
import { useAuth } from "@/hooks/useAuth";
import { Grupo } from "@/types/group";
import type { GrupoPermissao } from "@/types/group";
import { Button } from "@/components/ui/button";

export default function GerenciarGruposPage() {
  const [salvandoPerms, setSalvandoPerms] = useState(false);
  const [msgPerms, setMsgPerms] = useState<string | null>(null);
  // Salva permissões no backend
  const handleSalvarPermissoes = async () => {
    if (!grupo) return;
    setSalvandoPerms(true);
    setMsgPerms(null);
    try {
      await atualizarPermissoesGrupo(grupo.id, permissoes);
      // Sincroniza permissões no perfil de cada usuário
      await Promise.all(
        Object.entries(permissoes).map(([uid, perms]) =>
          updateUserGroupPermissions(uid, grupo.id, perms)
        )
      );
      setMsgPerms("Permissões salvas e sincronizadas!");
    } catch {
      // erro tratado
    } finally {
      setSalvandoPerms(false);
    }
  };


  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [grupoId, setGrupoId] = useState("");
  const [novoMembro, setNovoMembro] = useState("");
  // permissões: { [uid]: GrupoPermissao[] }
  const [permissoes, setPermissoes] = useState<{ [uid: string]: GrupoPermissao[] }>({});
  const permissoesPossiveis: GrupoPermissao[] = [
    "visualizar-agenda",
    "modificar-agenda",
    "agendar-reuniao",
    "excluir-call",
    "editar-reuniao",
  ];

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
    // Carrega permissões do grupo, se existirem
    if (g?.permissoes) setPermissoes(g.permissoes);
    else setPermissoes({});
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


  // Atualiza permissões de um usuário
  const handlePermissaoChange = (uid: string, perm: GrupoPermissao, checked: boolean) => {
    setPermissoes(prev => {
      const atual = prev[uid] || [];
      return {
        ...prev,
        [uid]: checked ? [...new Set([...atual, perm])] : atual.filter(p => p !== perm),
      };
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-8">
      <div className="relative bg-white border-4 border-green-200 shadow-2xl rounded-3xl p-12 flex flex-col gap-8 items-center">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white rounded-full shadow-lg w-20 h-20 flex items-center justify-center text-5xl border-4 border-white">
          <span role="img" aria-label="Grupo">👥</span>
        </div>
        <h1 className="text-3xl font-extrabold text-green-900 mb-2 mt-8 text-center drop-shadow">Gerenciar Grupos e Permissões</h1>
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
          <div className="relative bg-white border-4 border-green-200 shadow-2xl rounded-3xl p-8 flex flex-col gap-6 items-center mt-8">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-4xl border-4 border-white">
              <span role="img" aria-label="Grupo">👥</span>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mt-8">{grupo.nome}</h2>
            <p className="text-slate-700 mb-2 text-lg">{grupo.descricao}</p>
            <h3 className="font-bold text-green-700 mb-2">Membros</h3>
            <ul className="mb-2 w-full">
              {grupo.membros.map((m: string) => (
                <li key={m} className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <span className="text-lg text-slate-800 font-mono">{m}</span>
                  <div className="flex flex-wrap gap-2">
                    {permissoesPossiveis.map(perm => (
                      <label key={perm} className="flex items-center gap-1 text-xs bg-green-100 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={permissoes[m]?.includes(perm) || false}
                          onChange={e => handlePermissaoChange(m, perm, e.target.checked)}
                        />
                        {perm.replace(/-/g, ' ')}
                      </label>
                    ))}
                  </div>
                  <Button variant="danger" size="sm" onClick={() => handleRemoverMembro(m)}>
                    Remover
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mb-2 w-full">
              <input
                className="border-2 border-green-200 rounded-lg p-2 text-lg flex-1"
                placeholder="ID do novo membro"
                value={novoMembro}
                onChange={e => setNovoMembro(e.target.value)}
              />
              <Button onClick={handleAdicionarMembro}>Adicionar membro</Button>
            </div>
            <div className="flex gap-2 mt-4 w-full">
              <Button onClick={handleSalvarPermissoes} disabled={salvandoPerms} className="w-full py-3 text-lg font-semibold rounded-xl bg-green-600 hover:bg-green-700 transition">
                {salvandoPerms ? "Salvando..." : "Salvar permissões"}
              </Button>
              {msgPerms && <span className={`text-sm ${msgPerms.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>{msgPerms}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
