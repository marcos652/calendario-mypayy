// src/types/group.ts
export type Grupo = {
  id: string;
  nome: string;
  descricao?: string;
  membros: string[]; // lista de userId
  criadoEm: Date;
};
