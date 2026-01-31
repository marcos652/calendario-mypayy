// src/app/(private)/groups/list/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Grupo } from "@/types/group";

import { getUserNamesByIds } from "@/utils/user-names";

export default function ListarGruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [detalheAberto, setDetalheAberto] = useState<string | null>(null);
  const [grupoDetalhe, setGrupoDetalhe] = useState<Grupo | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [novoMembro, setNovoMembro] = useState("");
  const [msg, setMsg] = useState("");
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchGrupos = async () => {
      const ref = collection(db, "grupos");
      const snap = await getDocs(ref);
      setGrupos(snap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Grupo));
    };
    fetchGrupos();
  }, []);

  // Atualiza nomes dos membros ao abrir detalhes
  useEffect(() => {
    if (grupoDetalhe && detalheAberto === grupoDetalhe.id) {
      getUserNamesByIds(grupoDetalhe.membros).then(setUserNames);
    }
  }, [grupoDetalhe, detalheAberto]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border-2 border-green-200 bg-white/80 shadow-xl p-6 md:p-10 flex flex-col gap-6">
        <h1 className="text-2xl font-bold mb-4">Grupos Cadastrados</h1>
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-left text-sm text-slate-700">ID</th>
              <th className="text-left text-sm text-slate-700">Nome</th>
              <th className="text-left text-sm text-slate-700">Descrição</th>
              <th className="text-left text-sm text-slate-700">Membros</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => (
              <>
                <tr key={g.id} className="bg-green-50/40 rounded-lg">
                  <td className="py-2 px-3 text-xs text-slate-400 font-mono">{g.id}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">{g.nome}</td>
                  <td className="py-2 px-3 text-slate-700">{g.descricao}</td>
                  <td className="py-2 px-3 text-slate-700">{g.membros.length}</td>
                  <td className="py-2 px-3">
                    <button
                      title="Ver detalhes"
                      className="text-green-700 hover:text-green-900 text-xl"
                      onClick={async () => {
                        if (detalheAberto === g.id) {
                          setDetalheAberto(null);
                          setGrupoDetalhe(null);
                        } else {
                          setDetalheAberto(g.id);
                          const mod = await import("@/services/groups.service");
                          const grupo = await mod.buscarGrupo(g.id);
                          setGrupoDetalhe(grupo);
                        }
                      }}
                    >
                      {detalheAberto === g.id ? "👁️" : "👁"}
                    </button>
                  </td>
                </tr>
                {detalheAberto === g.id && grupoDetalhe && (
                  <tr>
                    <td colSpan={5} className="bg-green-100/60 rounded-lg p-4">
                      <div>
                        <div className="font-bold mb-2">Detalhes do grupo</div>
                        {/* Nome - modo leitura/edição */}
                        {editNome === null ? (
                          <div className="mb-2 flex gap-2 items-center">
                            <b>Nome:</b>
                            <span>{grupoDetalhe.nome}</span>
                            <button
                              className="text-xs bg-blue-500 text-white rounded px-2 py-1 ml-1"
                              onClick={() => {
                                setEditNome(grupoDetalhe.nome);
                              }}
                            >Editar</button>
                          </div>
                        ) : (
                          <div className="mb-2 flex gap-2 items-center">
                            <b>Nome:</b>
                            <input
                              className="border border-green-300 rounded px-1 text-sm"
                              value={editNome}
                              onChange={e => setEditNome(e.target.value)}
                            />
                            <button
                              className="text-xs bg-green-500 text-white rounded px-2 py-1 ml-1"
                              onClick={async () => {
                                const mod = await import("@/services/groups.service");
                                await mod.updateGrupoNome(grupoDetalhe.id, editNome);
                                setMsg("Nome atualizado!");
                                const grupo = await mod.buscarGrupo(grupoDetalhe.id);
                                setGrupoDetalhe(grupo);
                                setEditNome("");
                              }}
                            >Salvar</button>
                            <button
                              className="text-xs bg-gray-300 text-slate-700 rounded px-2 py-1 ml-1"
                              onClick={() => setEditNome("")}
                            >Cancelar</button>
                          </div>
                        )}
                        {/* Descrição - modo leitura/edição */}
                        {editDescricao === null ? (
                          <div className="mb-2 flex gap-2 items-center">
                            <b>Descrição:</b>
                            <span>{grupoDetalhe.descricao}</span>
                            <button
                              className="text-xs bg-blue-500 text-white rounded px-2 py-1 ml-1"
                              onClick={() => {
                                setEditDescricao(grupoDetalhe.descricao || "");
                              }}
                            >Editar</button>
                          </div>
                        ) : (
                          <div className="mb-2 flex gap-2 items-center">
                            <b>Descrição:</b>
                            <input
                              className="border border-green-300 rounded px-1 text-sm"
                              value={editDescricao}
                              onChange={e => setEditDescricao(e.target.value)}
                            />
                            <button
                              className="text-xs bg-green-500 text-white rounded px-2 py-1 ml-1"
                              onClick={async () => {
                                const mod = await import("@/services/groups.service");
                                await mod.updateGrupoDescricao(grupoDetalhe.id, editDescricao);
                                setMsg("Descrição atualizada!");
                                const grupo = await mod.buscarGrupo(grupoDetalhe.id);
                                setGrupoDetalhe(grupo);
                                setEditDescricao("");
                              }}
                            >Salvar</button>
                            <button
                              className="text-xs bg-gray-300 text-slate-700 rounded px-2 py-1 ml-1"
                              onClick={() => setEditDescricao("")}
                            >Cancelar</button>
                          </div>
                        )}
                        <div className="mb-1"><b>Membros:</b></div>
                        <ul className="mb-2">
                          {grupoDetalhe.membros.map(uid => (
                            <li key={uid} className="inline-block mr-2 text-xs bg-green-200 rounded px-2 py-1 text-green-900 font-mono">
                              {userNames[uid] || uid}
                              <button
                                className="ml-1 text-red-600 hover:text-red-800"
                                title="Remover"
                                onClick={async () => {
                                  const mod = await import("@/services/groups.service");
                                  await mod.removerMembro(grupoDetalhe.id, uid);
                                  setMsg("Membro removido!");
                                  const grupo = await mod.buscarGrupo(grupoDetalhe.id);
                                  setGrupoDetalhe(grupo);
                                }}
                              >✖</button>
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-2 mb-2">
                          <input
                            className="border border-green-300 rounded px-1 text-sm"
                            placeholder="ID do usuário"
                            value={novoMembro}
                            onChange={e => setNovoMembro(e.target.value)}
                          />
                          <button
                            className="text-xs bg-green-500 text-white rounded px-2 py-1"
                            onClick={async () => {
                              const mod = await import("@/services/groups.service");
                              await mod.adicionarMembro(grupoDetalhe.id, novoMembro);
                              setMsg("Membro adicionado!");
                              setNovoMembro("");
                              const grupo = await mod.buscarGrupo(grupoDetalhe.id);
                              setGrupoDetalhe(grupo);
                            }}
                          >Adicionar membro</button>
                        </div>
                        <div className="flex justify-end">
                          <button
                            className="text-xs bg-red-500 text-white rounded px-3 py-1"
                            onClick={async () => {
                              const mod = await import("@/services/groups.service");
                              await mod.excluirGrupo(grupoDetalhe.id);
                              setMsg("Grupo excluído!");
                              setDetalheAberto(null);
                              setGrupoDetalhe(null);
                              // Atualiza lista
                              const ref = collection(db, "grupos");
                              const snap = await getDocs(ref);
                              setGrupos(snap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Grupo));
                            }}
                          >Excluir grupo</button>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">ID: {grupoDetalhe.id}</div>
                        {msg && <div className="text-green-700 font-medium mt-2">{msg}</div>}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
