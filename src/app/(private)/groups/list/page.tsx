// src/app/(private)/groups/list/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Grupo } from "@/types/group";

export default function ListarGruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [detalheAberto, setDetalheAberto] = useState<string | null>(null);
  const [grupoDetalhe, setGrupoDetalhe] = useState<Grupo | null>(null);
  const [editNome, setEditNome] = useState("");

  useEffect(() => {
    const fetchGrupos = async () => {
      if (db) {
        const ref = collection(db, "grupos");
        const snap = await getDocs(ref);
        setGrupos(snap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Grupo));
      }
    };
    fetchGrupos();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-8">
      <div className="relative bg-white border-4 border-green-200 shadow-2xl rounded-3xl p-12 flex flex-col gap-8 items-center">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white rounded-full shadow-lg w-20 h-20 flex items-center justify-center text-5xl border-4 border-white">
          <span role="img" aria-label="Grupo">👥</span>
        </div>
        <h1 className="text-3xl font-extrabold text-green-900 mb-2 mt-8 text-center drop-shadow">Grupos Cadastrados</h1>
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
                  <tr key={g.id + "-detalhe"}>
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
                        {/* ...restante dos detalhes... */}
                        <div className="flex justify-end">
                          <button
                            className="text-xs bg-red-500 text-white rounded px-3 py-1"
                            onClick={async () => {
                              const mod = await import("@/services/groups.service");
                              await mod.excluirGrupo(grupoDetalhe.id);
                              setDetalheAberto(null);
                              setGrupoDetalhe(null);
                              // Atualiza lista
                              if (db) {
                                const ref = collection(db, "grupos");
                                const snap = await getDocs(ref);
                                setGrupos(snap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Grupo));
                              }
                            }}
                          >Excluir grupo</button>
                        </div>
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
