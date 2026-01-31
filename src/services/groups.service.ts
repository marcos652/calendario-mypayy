export async function updateGrupoNome(grupoId: string, novoNome: string) {
  const grupoRef = doc(gruposRef, grupoId);
  await updateDoc(grupoRef, { nome: novoNome });
}

export async function updateGrupoDescricao(grupoId: string, novaDescricao: string) {
  const grupoRef = doc(gruposRef, grupoId);
  await updateDoc(grupoRef, { descricao: novaDescricao });
}

export async function excluirGrupo(grupoId: string) {
  const grupoRef = doc(gruposRef, grupoId);
  await grupoRef.delete();
}
// src/services/groups.service.ts
import { db } from "@/lib/firebase/client";
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Grupo } from "@/types/group";

const gruposRef = collection(db, "grupos");

export async function criarGrupo(nome: string, descricao: string, criadorId: string) {
  const grupoRef = doc(gruposRef);
  const grupo: Grupo = {
    id: grupoRef.id,
    nome,
    descricao,
    membros: [criadorId],
    criadoEm: new Date(),
  };
  await setDoc(grupoRef, grupo);
  return grupo;
}

export async function adicionarMembro(grupoId: string, userId: string) {
  const grupoRef = doc(gruposRef, grupoId);
  await updateDoc(grupoRef, { membros: arrayUnion(userId) });
}

export async function removerMembro(grupoId: string, userId: string) {
  const grupoRef = doc(gruposRef, grupoId);
  await updateDoc(grupoRef, { membros: arrayRemove(userId) });
}

export async function buscarGrupo(grupoId: string): Promise<Grupo | null> {
  const grupoRef = doc(gruposRef, grupoId);
  const snap = await getDoc(grupoRef);
  return snap.exists() ? (snap.data() as Grupo) : null;
}
