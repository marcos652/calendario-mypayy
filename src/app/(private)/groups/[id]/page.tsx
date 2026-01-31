// src/app/(private)/groups/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { buscarGrupo, adicionarMembro, removerMembro } from "@/services/groups.service";
import { Grupo } from "@/types/group";
import { Button } from "@/components/ui/button";

export default function DetalheGrupoPage() {
  const router = useRouter();
  const params = useParams();
  const grupoId = params?.id as string;
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [novoMembro, setNovoMembro] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [editandoNome, setEditandoNome] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (grupoId) {
      buscarGrupo(grupoId).then(setGrupo);
    }
  }, [grupoId]);

  const handleRemoverMembro = async (userId: string) => {
    await removerMembro(grupoId, userId);
    buscarGrupo(grupoId).then(setGrupo);
  };

  const handleAdicionarMembro = async () => {
    if (!novoMembro) return;
    await adicionarMembro(grupoId, novoMembro);
    setNovoMembro("");
    buscarGrupo(grupoId).then(setGrupo);
  };

  const handleSalvarNome = async () => {
    // TODO: implementar update do nome no backend
    setMensagem("Funcionalidade de editar nome ainda não implementada.");
    setEditandoNome(false);
  };

  const handleExcluirGrupo = async () => {
    // TODO: implementar exclusão do grupo no backend
    setMensagem("Funcionalidade de excluir grupo ainda não implementada.");
  };

  if (!grupo) return <div className="p-8 text-center">Carregando grupo...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="rounded-2xl border-2 border-green-200 bg-white/80 shadow-xl p-6 md:p-10 flex flex-col gap-6">
        <div className="flex items-center gap-3 mb-2">
          {editandoNome ? (
            <>
              <input
                className="border-2 border-green-200 rounded-lg p-1"
                value={novoNome}
                onChange={e => setNovoNome(e.target.value)}
              />
              <Button size="sm" onClick={handleSalvarNome}>Salvar</Button>
              <Button size="sm" variant="secondary" onClick={() => setEditandoNome(false)}>Cancelar</Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold">{grupo.nome}</h2>
              <Button size="sm" onClick={() => { setNovoNome(grupo.nome); setEditandoNome(true); }}>Editar nome</Button>
            </>
          )}
        </div>
        <div className="text-slate-700 mb-2">{grupo.descricao}</div>
        <div>
          <h3 className="font-semibold mb-1">Membros</h3>
          <ul className="mb-2">
            {grupo.membros.map(uid => (
              <li key={uid} className="flex items-center gap-2">
                <span className="text-sm text-slate-800">{uid}</span>
                <Button size="xs" variant="destructive" onClick={() => handleRemoverMembro(uid)}>Remover</Button>
                {/* TODO: Permissão do membro */}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              className="border-2 border-green-200 rounded-lg p-1"
              placeholder="ID do usuário para adicionar"
              value={novoMembro}
              onChange={e => setNovoMembro(e.target.value)}
            />
            <Button size="sm" onClick={handleAdicionarMembro}>Adicionar</Button>
          </div>
        </div>
        <Button variant="destructive" onClick={handleExcluirGrupo}>Excluir grupo</Button>
        {mensagem && <div className="text-red-600 font-medium mt-2">{mensagem}</div>}
      </div>
    </div>
  );
}
