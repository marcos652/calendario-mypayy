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
  password: string
): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (credential.user) {
    await updateProfile(credential.user, { displayName: name });
    await ensureUserProfile(credential.user, { name });
  }
  return credential.user;
};

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (credential.user) {
    await ensureUserProfile(credential.user);
  }
  return credential.user;
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};
