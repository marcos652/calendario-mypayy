import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { parseISO, getDay } from "date-fns";
import { db } from "@/lib/firebase/client";
import { Meeting, Participant } from "@/types/meeting";
import { AvailabilityRule } from "@/types/user";
import { hasOverlap } from "@/utils/overlap";
import { timeToMinutes } from "@/utils/time";
import { normalizeMeetingLink } from "@/utils/meeting-link";

const mapMeeting = (id: string, data: DocumentData): Meeting => {
  return {
    id,
    title: data.title ?? "",
    description: data.description ?? "",
    meetingLink: data.meetingLink ?? "",
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    ownerId: data.ownerId,
    participants: data.participants ?? [],
    participantEmails: data.participantEmails ?? [],
    status: data.status ?? "scheduled",
    createdAt: data.createdAt?.toDate?.() ?? undefined,
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  };
};

const isWithinAvailability = (
  date: string,
  startTime: string,
  endTime: string,
  availability: AvailabilityRule[]
): boolean => {
  if (!availability.length) {
    return true;
  }

  const day = getDay(parseISO(date));
  const rule = availability.find((item) => item.dayOfWeek === day && item.enabled);
  if (!rule) {
    return false;
  }

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  return rule.windows.some((window) => {
    const windowStart = timeToMinutes(window.start);
    const windowEnd = timeToMinutes(window.end);
    return startMinutes >= windowStart && endMinutes <= windowEnd;
  });
};

export const listMeetingsForUser = async (uid: string, email?: string): Promise<Meeting[]> => {
  if (!db) throw new Error("Firestore não inicializado");
  const meetingsRef = collection(db, "meetings");
  const ownerQuery = query(meetingsRef, where("ownerId", "==", uid), orderBy("date"));
  const participantQuery = email
    ? query(meetingsRef, where("participantEmails", "array-contains", email), orderBy("date"))
    : null;

  const [ownerSnapshot, participantSnapshot] = await Promise.all([
    getDocs(ownerQuery),
    participantQuery ? getDocs(participantQuery) : null,
  ]);

  const mapDocs = (snap: QuerySnapshot<DocumentData>) =>
    snap.docs.map((docSnap) => mapMeeting(docSnap.id, docSnap.data()));

  const ownerMeetings = mapDocs(ownerSnapshot);
  const participantMeetings = participantSnapshot ? mapDocs(participantSnapshot) : [];

  const merged = new Map<string, Meeting>();
  ownerMeetings.concat(participantMeetings).forEach((meeting) => merged.set(meeting.id, meeting));

  return Array.from(merged.values());
};

export const getMeetingById = async (id: string): Promise<Meeting | null> => {
  if (!db) throw new Error("Firestore não inicializado");
  const ref = doc(db, "meetings", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return null;
  }
  return mapMeeting(snap.id, snap.data());
};

export type CreateMeetingInput = {
  title: string;
  description?: string;
  meetingLink?: string;
  date: string;
  startTime: string;
  endTime: string;
  ownerId: string;
  ownerEmail?: string;
  participants: Participant[];
  participantEmails: string[];
  availability: AvailabilityRule[];
};

export const createMeeting = async (input: CreateMeetingInput): Promise<string> => {
  if (!db) throw new Error("Firestore não inicializado");
  const meetingsRef = collection(db, "meetings");
  const meetingRef = doc(meetingsRef);

  if (!input.ownerId) {
    throw new Error("Missing owner id");
  }

  if (!isWithinAvailability(input.date, input.startTime, input.endTime, input.availability)) {
    throw new Error("Selected time is outside availability");
  }

  const dayQuery = query(
    meetingsRef,
    where("ownerId", "==", input.ownerId),
    where("date", "==", input.date),
    where("status", "==", "scheduled")
  );

  const daySnapshot = await getDocs(dayQuery);
  const requestedStart = timeToMinutes(input.startTime);
  const requestedEnd = timeToMinutes(input.endTime);

  for (const docSnap of daySnapshot.docs) {
    const data = docSnap.data();
    const startMinutes = timeToMinutes(data.startTime);
    const endMinutes = timeToMinutes(data.endTime);
    if (hasOverlap(requestedStart, requestedEnd, startMinutes, endMinutes)) {
      throw new Error("Conflicting meeting found");
    }
  }

  if (!db) throw new Error("Firestore não inicializado");
  await runTransaction(db, async (transaction) => {
    transaction.set(meetingRef, {
      title: input.title,
      description: input.description ?? "",
      meetingLink: normalizeMeetingLink(input.meetingLink),
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      ownerId: input.ownerId,
      participants: input.participants,
      participantEmails: input.participantEmails,
      status: "scheduled",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  // Dispara o webhook do Slack
  try {
    const { sendSlackMessage } = await import("@/lib/slack");
    const meetingLink = normalizeMeetingLink(input.meetingLink);
    const text = `Nova reunião criada: ${input.title}\nData: ${input.date} ${input.startTime}-${input.endTime}\nLink: ${meetingLink}`;
    await sendSlackMessage(text);
  } catch (e) {
    // Apenas loga, não impede a criação
    console.error('Erro ao enviar webhook Slack:', e);
  }

  // Envia convite por email para cada participante
  try {
    const { enviarConviteEmail } = await import("@/services/email.service");
    for (const email of input.participantEmails) {
      await enviarConviteEmail(
        email,
        `Convite para reunião: ${input.title}`,
        `Olá!\n\nVocê está sendo convidado para a reunião "${input.title}".\n\nData: ${input.date}\nHorário: das ${input.startTime} às ${input.endTime}\n\nLink para participar: ${normalizeMeetingLink(input.meetingLink)}\n\nPor favor, adicione este compromisso à sua agenda.\n\nEste é um convite automático, não responda este e-mail.`
      );
    }
  } catch (e) {
    console.error("Erro ao enviar convites por email:", e);
  }

  return meetingRef.id;
};

export type UpdateMeetingInput = {
  id: string;
  title: string;
  description?: string;
  meetingLink?: string;
  date: string;
  startTime: string;
  endTime: string;
  ownerId: string;
  participants: Participant[];
  participantEmails: string[];
  availability: AvailabilityRule[];
};

export const updateMeeting = async (input: UpdateMeetingInput): Promise<void> => {
  if (!db) throw new Error("Firestore não inicializado");
  const meetingsRef = collection(db, "meetings");
  const meetingRef = doc(meetingsRef, input.id);

  if (!isWithinAvailability(input.date, input.startTime, input.endTime, input.availability)) {
    throw new Error("Selected time is outside availability");
  }

  const dayQuery = query(
    meetingsRef,
    where("ownerId", "==", input.ownerId),
    where("date", "==", input.date),
    where("status", "==", "scheduled")
  );

  const daySnapshot = await getDocs(dayQuery);
  const requestedStart = timeToMinutes(input.startTime);
  const requestedEnd = timeToMinutes(input.endTime);

  for (const docSnap of daySnapshot.docs) {
    if (docSnap.id === input.id) {
      continue;
    }
    const data = docSnap.data();
    const startMinutes = timeToMinutes(data.startTime);
    const endMinutes = timeToMinutes(data.endTime);
    if (hasOverlap(requestedStart, requestedEnd, startMinutes, endMinutes)) {
      throw new Error("Conflicting meeting found");
    }
  }

  if (!db) throw new Error("Firestore não inicializado");
  await runTransaction(db, async (transaction) => {
    const meetingSnap = await transaction.get(meetingRef);
    if (!meetingSnap.exists()) {
      throw new Error("Meeting not found");
    }

    if (meetingSnap.data().ownerId !== input.ownerId) {
      throw new Error("Only the owner can edit this meeting");
    }

    transaction.update(meetingRef, {
      title: input.title,
      description: input.description ?? "",
      meetingLink: normalizeMeetingLink(input.meetingLink),
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      participants: input.participants,
      participantEmails: input.participantEmails,
      updatedAt: serverTimestamp(),
    });
  });
};

export const cancelMeeting = async (id: string, ownerId: string): Promise<void> => {
  if (!db) throw new Error("Firestore não inicializado");
  const ref = doc(db, "meetings", id);
  if (!db) throw new Error("Firestore não inicializado");
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) {
      throw new Error("Meeting not found");
    }
    if (snap.data().ownerId !== ownerId) {
      throw new Error("Only the owner can cancel this meeting");
    }
    transaction.update(ref, {
      status: "cancelled",
      updatedAt: serverTimestamp(),
    });
  });
};
