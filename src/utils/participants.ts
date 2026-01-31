import { Participant } from "@/types/meeting";

export const parseParticipantEmails = (input: string): string[] => {
  if (!input) {
    return [];
  }
  return input
    .split(/[,\n;]+/)
    .map((email) => email.trim())
    .filter(Boolean);
};

export const buildParticipants = (emails: string[]): Participant[] => {
  return emails.map((email) => ({ email, status: "invited" }));
};
