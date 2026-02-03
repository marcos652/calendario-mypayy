// src/app/(private)/users/manage/page.tsx
"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  permissao: string;
  [key: string]: string | boolean;
};

// Exemplo de dados de usuários (substitua por fetch real do backend)
const usuariosExemplo: Usuario[] = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao@email.com",
    permissao: "usuário",
    "visualizar-agenda": true,
    "modificar-agenda": false,
    "agendar-reuniao": true,
    "excluir-call": false,
    "editar-reuniao": false,
  },
  {
    id: "2",
    nome: "Maria Souza",
    email: "maria@email.com",
    permissao: "admin",
    "visualizar-agenda": true,
    "modificar-agenda": true,
    "agendar-reuniao": true,
    "excluir-call": true,
    "editar-reuniao": true,
  },
  {
    id: "3",
    nome: "Carlos Lima",
    email: "carlos@email.com",
    permissao: "usuário",
    "visualizar-agenda": false,
    "modificar-agenda": false,
    "agendar-reuniao": false,
    "excluir-call": false,
    "editar-reuniao": false,
  },
];

export default function GerenciarUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosExemplo);
  const [userPermsOpen, setUserPermsOpen] = useState<string | null>(null);
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
              <>
                <tr key={user.id} className="bg-green-50/40 rounded-lg">
                  <td className="py-2 px-3 text-xs text-slate-400 font-mono">{user.id}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">{user.nome}</td>
                  <td className="py-2 px-3 text-slate-700">{user.email}</td>
                  <td className="py-2 px-3 text-slate-700">
                    <button
                      className="text-xs bg-green-200 hover:bg-green-300 text-green-900 rounded px-2 py-1 mr-2"
                      onClick={() => setUserPermsOpen(userPermsOpen === user.id ? null : user.id)}
                    >
                      {userPermsOpen === user.id ? "Fechar opções" : "Permissões"}
                    </button>
                    <span className="font-semibold capitalize">{user.permissao}</span>
                  </td>
                </tr>
                {userPermsOpen === user.id && (
                  <tr>
                    <td colSpan={4} className="bg-green-50/80 border-t border-green-200 p-4">
                      <div className="flex flex-wrap gap-4 items-center">
                        {[
                          { key: "visualizar-agenda", label: "Visualizar agenda 📅" },
                          { key: "modificar-agenda", label: "Modificar agenda ✏️" },
                          { key: "agendar-reuniao", label: "Agendar reunião 🗓️" },
                          { key: "excluir-call", label: "Excluir chamada ❌" },
                          { key: "editar-reuniao", label: "Editar reunião 🗓️" },
                        ].map((perm) => (
                          <Switch
                            key={perm.key}
                            checked={user[perm.key] === true}
                            onChange={checked => {
                              setUsuarios(prev => prev.map(u =>
                                u.id === user.id ? { ...u, [perm.key]: checked } : u
                              ));
                              // Aqui você pode chamar o backend para atualizar as permissões do usuário
                            }}
                            label={perm.label}
                          />
                        ))}
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
