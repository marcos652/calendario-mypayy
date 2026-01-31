export type ParticipantStatus = "invited" | "accepted" | "declined";

export type Participant = {
  uid?: string;
  email: string;
  status: ParticipantStatus;
};

export type MeetingStatus = "scheduled" | "cancelled";

export type Meeting = {
  id: string;
  title: string;
  description?: string;
  meetingLink?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  ownerId: string;
  participants: Participant[];
  participantEmails: string[];
  status: MeetingStatus;
  createdAt?: Date;
  updatedAt?: Date;
  grupoId?: string; // grupo ao qual pertence
};
