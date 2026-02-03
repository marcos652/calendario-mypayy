"use client";

import { useRouter } from "next/navigation";
import { MeetingForm, MeetingFormValues } from "@/components/forms/meeting-form";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast";
import { useMeetings } from "@/hooks/useMeetings";
import { parseParticipantEmails, buildParticipants } from "@/utils/participants";
import { getErrorMessage } from "@/utils/errors";
import { useEffect, useState } from "react";

export default function NewMeetingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { create } = useMeetings();
  const { showToast } = useToast();
  const [canSchedule, setCanSchedule] = useState(true);

  useEffect(() => {
    // Se grupo selecionado, verifica permissão
    if (!profile) return;
    // Se não há grupo, permite agendar
    setCanSchedule(true);
    // Se grupoId for preenchido, verifica permissão
    // (MeetingForm envia grupoId no submit)
  }, [profile]);

  const handleSubmit = async (values: MeetingFormValues) => {
    if (!user) return;
    let grupoId = values.grupoId?.trim();
    if (grupoId && profile?.gruposPermissoes && !profile.gruposPermissoes[grupoId]?.includes("agendar-reuniao")) {
      showToast("Você não tem permissão para agendar reunião neste grupo.", "error");
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
        grupoId: grupoId || undefined,
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
