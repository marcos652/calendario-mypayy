import { doc, getDoc, serverTimestamp, setDoc, updateDoc, DocumentData } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase/client";
import { AvailabilityRule, UserProfile } from "@/types/user";

const mapUserProfile = (uid: string, data: DocumentData): UserProfile => {
  return {
    id: uid,
    name: data.name ?? "",
    email: data.email ?? "",
    photoUrl: data.photoUrl ?? undefined,
    availability: data.availability ?? [],
    createdAt: data.createdAt?.toDate?.() ?? undefined,
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  };
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return null;
  }
  return mapUserProfile(uid, snap.data());
};

export const ensureUserProfile = async (user: User, extra?: { name?: string }): Promise<void> => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return;
  }
  await setDoc(ref, {
    name: extra?.name ?? user.displayName ?? "",
    email: user.email ?? "",
    photoUrl: user.photoURL ?? "",
    availability: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<Pick<UserProfile, "name" | "photoUrl">>
): Promise<void> => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const updateAvailability = async (uid: string, availability: AvailabilityRule[]): Promise<void> => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    availability,
    updatedAt: serverTimestamp(),
  });
};
