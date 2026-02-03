// src/types/group.ts
export type GrupoPermissao =
  | "visualizar-agenda"
  | "modificar-agenda"
  | "agendar-reuniao"
  | "excluir-call"
  | "editar-reuniao";

export type Grupo = {
  id: string;
  nome: string;
  descricao?: string;
  membros: string[]; // lista de userId (legado)
  permissoes?: {
    [userId: string]: GrupoPermissao[];
  };
  criadoEm: Date;
};
