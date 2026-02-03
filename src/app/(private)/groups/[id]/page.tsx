// src/app/(private)/groups/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { buscarGrupo, adicionarMembro, removerMembro, atualizarPermissoesGrupo } from "@/services/groups.service";
import { Grupo, GrupoPermissao } from "@/types/group";
import { updateUserGroupPermissions } from "@/services/users.service";
import { Button } from "@/components/ui/button";

const permissoesPossiveis: GrupoPermissao[] = [
  "visualizar-agenda",
  "modificar-agenda",
  "agendar-reuniao",
  "excluir-call",
  "editar-reuniao",
];

export default function DetalheGrupoPage() {
  // const router = useRouter();
  const params = useParams();
  const grupoId = params?.id as string;
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [novoMembro, setNovoMembro] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [editandoNome, setEditandoNome] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [modoEdicao, setModoEdicao] = useState(false);
  const [permissoes, setPermissoes] = useState<{ [uid: string]: GrupoPermissao[] }>({});
  const [salvandoPerms, setSalvandoPerms] = useState(false);
  const [msgPerms, setMsgPerms] = useState<string | null>(null);

  useEffect(() => {
    if (grupoId) {
      buscarGrupo(grupoId).then(g => {
        setGrupo(g);
        if (g?.permissoes) setPermissoes(g.permissoes);
        else setPermissoes({});
      });
    }
  }, [grupoId]);
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

  // Salva permissões no backend e sincroniza com perfil do usuário
  const handleSalvarPermissoes = async () => {
    if (!grupo) return;
    setSalvandoPerms(true);
    setMsgPerms(null);
    try {
      await atualizarPermissoesGrupo(grupo.id, permissoes);
      await Promise.all(
        Object.entries(permissoes).map(([uid, perms]) =>
          updateUserGroupPermissions(uid, grupo.id, perms)
        )
      );
      setMsgPerms("Permissões salvas!");
    } catch {
      setMsgPerms("Erro ao salvar permissões.");
    } finally {
      setSalvandoPerms(false);
    }
  };

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
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-8">
      <div className="relative bg-white border-4 border-green-200 shadow-2xl rounded-3xl p-12 flex flex-col gap-8 items-center">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white rounded-full shadow-lg w-20 h-20 flex items-center justify-center text-5xl border-4 border-white">
          <span role="img" aria-label="Grupo">👥</span>
        </div>
        <h1 className="text-3xl font-extrabold text-green-900 mb-2 mt-8 text-center drop-shadow">Detalhes do Grupo</h1>
        <div className="mt-8 w-full max-w-2xl mx-auto">
          {/* Cabeçalho do grupo */}
          <div className="flex items-center gap-3 mb-4">
            {modoEdicao ? (
              editandoNome ? (
                <>
                  <input
                    className="border-2 border-green-200 rounded-lg p-2 text-lg"
                    value={novoNome}
                    onChange={e => setNovoNome(e.target.value)}
                  />
                  <Button size="sm" onClick={handleSalvarNome}>Salvar</Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditandoNome(false)}>Cancelar</Button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-green-800">{grupo.nome}</h2>
                  <Button size="sm" onClick={() => { setNovoNome(grupo.nome); setEditandoNome(true); }}>Editar nome</Button>
                </>
              )
            ) : (
              <>
                <h2 className="text-2xl font-bold text-green-800">{grupo.nome}</h2>
                <Button size="sm" variant="secondary" onClick={() => setModoEdicao(true)}>Editar</Button>
              </>
            )}
          </div>
          <p className="text-slate-700 mb-4 text-lg">{grupo.descricao}</p>
          <div className="mb-6">
            <h3 className="font-bold text-green-700 mb-2">Membros</h3>
            <ul className="mb-2">
              {grupo.membros.map(uid => (
                <li key={uid} className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <span className="text-lg text-slate-800 font-mono">{uid}</span>
                  <div className="flex flex-wrap gap-2">
                    {permissoesPossiveis.map(perm => modoEdicao ? (
                      <label key={perm} className="flex items-center gap-1 text-xs bg-green-100 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={permissoes[uid]?.includes(perm) || false}
                          onChange={e => handlePermissaoChange(uid, perm, e.target.checked)}
                        />
                        {perm.replace(/-/g, ' ')}
                      </label>
                    ) : (
                      permissoes[uid]?.includes(perm) && (
                        <span key={perm} className="text-xs bg-green-100 px-2 py-1 rounded">
                          {perm.replace(/-/g, ' ')}
                        </span>
                      )
                    ))}
                  </div>
                  {modoEdicao && (
                    <Button size="sm" variant="danger" onClick={() => handleRemoverMembro(uid)}>Remover</Button>
                  )}
                </li>
              ))}
            </ul>
            {modoEdicao && (
              <div className="flex gap-2">
                <input
                  className="border-2 border-green-200 rounded-lg p-2 text-lg"
                  placeholder="ID do usuário para adicionar"
                  value={novoMembro}
                  onChange={e => setNovoMembro(e.target.value)}
                />
                <Button size="sm" onClick={handleAdicionarMembro}>Adicionar</Button>
              </div>
            )}
            {modoEdicao && (
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSalvarPermissoes} disabled={salvandoPerms} className="w-full py-3 text-lg font-semibold rounded-xl bg-green-600 hover:bg-green-700 transition">
                  {salvandoPerms ? "Salvando..." : "Salvar permissões"}
                </Button>
                {msgPerms && <span className={`text-sm ${msgPerms.includes("salvas") ? "text-green-600" : "text-red-600"}`}>{msgPerms}</span>}
              </div>
            )}
          </div>
          {modoEdicao && (
            <Button variant="danger" onClick={handleExcluirGrupo} className="w-full py-3 text-lg font-semibold rounded-xl bg-red-500 hover:bg-red-600 transition">Excluir grupo</Button>
          )}
          {mensagem && <div className="text-red-600 font-medium mt-2 text-center text-lg">{mensagem}</div>}
          {modoEdicao && (
            <Button variant="secondary" className="mt-2 w-full py-3 text-lg font-semibold rounded-xl" onClick={() => { setModoEdicao(false); setEditandoNome(false); }}>Concluir edição</Button>
          )}
        </div>
      </div>
    </div>
  );
}
