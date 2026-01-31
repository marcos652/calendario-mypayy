// src/app/(private)/users/manage/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Exemplo de dados de usuários (substitua por fetch real do backend)
const usuariosExemplo = [
  { id: "1", nome: "João Silva", email: "joao@email.com", permissao: "usuário" },
  { id: "2", nome: "Maria Souza", email: "maria@email.com", permissao: "admin" },
  { id: "3", nome: "Carlos Lima", email: "carlos@email.com", permissao: "usuário" },
];

const opcoesPermissao = [
  { value: "usuario", label: "Usuário" },
  { value: "admin", label: "Administrador" },
  { value: "master", label: "Master" },
];

export default function GerenciarUsuariosPage() {
  const [usuarios, setUsuarios] = useState(usuariosExemplo);

  const handlePermissaoChange = (id: string, novaPermissao: string) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, permissao: novaPermissao } : u))
    );
    // Aqui você pode chamar o backend para atualizar a permissão
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border-2 border-green-200 bg-white/80 shadow-xl p-6 md:p-10 flex flex-col gap-6">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Usuários e Hierarquias</h1>
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-left text-sm text-slate-700">ID</th>
              <th className="text-left text-sm text-slate-700">Nome</th>
              <th className="text-left text-sm text-slate-700">E-mail</th>
              <th className="text-left text-sm text-slate-700">Permissão</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id} className="bg-green-50/40 rounded-lg">
                <td className="py-2 px-3 text-xs text-slate-400 font-mono">{user.id}</td>
                <td className="py-2 px-3 font-medium text-slate-900">{user.nome}</td>
                <td className="py-2 px-3 text-slate-700">{user.email}</td>
                <td className="py-2 px-3">
                  <select
                    className="border-2 border-green-200 rounded-lg p-1 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none"
                    value={user.permissao}
                    onChange={e => handlePermissaoChange(user.id, e.target.value)}
                  >
                    {opcoesPermissao.map((op) => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
