"use client";

import { useRouter } from "next/navigation";
import { MeetingForm, MeetingFormValues } from "@/components/forms/meeting-form";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast";
import { useMeetings } from "@/hooks/useMeetings";
import { parseParticipantEmails, buildParticipants } from "@/utils/participants";
import { getErrorMessage } from "@/utils/errors";

export default function NewMeetingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { create } = useMeetings();
  const { showToast } = useToast();

  const handleSubmit = async (values: MeetingFormValues) => {
    if (!user) {
      return;
    }
    const emails = parseParticipantEmails(values.participants ?? "");
    try {
      const meetingId = await create({
        title: values.title,
        description: values.description,
        meetingLink: values.meetingLink,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        ownerId: user.uid,
        ownerEmail: user.email ?? undefined,
        participants: buildParticipants(emails),
        participantEmails: emails,
        availability: profile?.availability ?? [],
      });
      showToast("Meeting created.", "success");
      router.push(`/meetings/${meetingId}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
      showToast(getErrorMessage(error, "Failed to create meeting."), "error");
    }
  };

  return (
    <Card>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">New meeting</h1>
        <p className="text-sm text-slate-500">Choose a time within your availability.</p>
      </div>
      <MeetingForm submitLabel="Create meeting" onSubmit={handleSubmit} />
    </Card>
  );
}
