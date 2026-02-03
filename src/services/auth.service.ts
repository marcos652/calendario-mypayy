import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { ensureUserProfile } from "@/services/users.service";

export const registerWithEmail = async (
  name: string,
  email: string,
  password: string,
  role: "usuario" | "admin" | "master" = "usuario"
): Promise<User> => {
  if (!auth) throw new Error("Firebase Auth não inicializado");
  const credential = await createUserWithEmailAndPassword(auth as import("firebase/auth").Auth, email, password);
  if (credential.user) {
    await updateProfile(credential.user, { displayName: name });
    await ensureUserProfile(credential.user, { name, role });
  }
  return credential.user;
};

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  if (!auth) throw new Error("Firebase Auth não inicializado");
  const credential = await signInWithEmailAndPassword(auth as import("firebase/auth").Auth, email, password);
  if (credential.user) {
    await ensureUserProfile(credential.user);
  }
  return credential.user;
};

export const logout = async (): Promise<void> => {
  if (!auth) throw new Error("Firebase Auth não inicializado");
  await signOut(auth as import("firebase/auth").Auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  if (!auth) throw new Error("Firebase Auth não inicializado");
  await sendPasswordResetEmail(auth as import("firebase/auth").Auth, email);
};
