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
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-8">
      <div className="relative bg-white border-4 border-green-200 shadow-2xl rounded-3xl p-12 flex flex-col gap-8 items-center">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white rounded-full shadow-lg w-20 h-20 flex items-center justify-center text-5xl border-4 border-white">
          <span role="img" aria-label="Grupo">👥</span>
        </div>
        <h1 className="text-3xl font-extrabold text-green-900 mb-2 mt-8 text-center drop-shadow">Criar novo grupo</h1>
        <p className="text-slate-600 text-center mb-4 text-lg">Preencha as informações abaixo para criar um novo grupo de colaboração.</p>
        <input
          className="border-2 border-green-300 rounded-xl p-4 mb-4 w-full text-lg focus:ring-2 focus:ring-green-400 outline-none transition"
          placeholder="Nome do grupo"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <textarea
          className="border-2 border-green-300 rounded-xl p-4 mb-4 w-full text-lg min-h-[100px] focus:ring-2 focus:ring-green-400 outline-none transition"
          placeholder="Descrição do grupo (opcional)"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
        />
        <Button onClick={handleCriarGrupo} disabled={!nome} className="w-full py-3 text-lg font-semibold rounded-xl bg-green-500 hover:bg-green-600 transition">Criar grupo</Button>
        {mensagem && <div className="text-green-700 font-bold mt-4 text-center text-lg">{mensagem}</div>}
      </div>
    </div>
  );
}
