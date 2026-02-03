"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MeetingForm, MeetingFormValues } from "@/components/forms/meeting-form";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { useMeetings } from "@/hooks/useMeetings";
import { useToast } from "@/components/ui/toast";
import { parseParticipantEmails, buildParticipants } from "@/utils/participants";
import { Meeting } from "@/types/meeting";
import { getErrorMessage } from "@/utils/errors";

export default function EditMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { getById, update } = useMeetings();
  const { showToast } = useToast();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!params?.id) {
        return;
      }
      const data = await getById(String(params.id));
      setMeeting(data);
      setLoading(false);
    };

    void fetchMeeting();
  }, [params, getById]);

  const handleSubmit = async (values: MeetingFormValues) => {
    if (!user || !meeting) {
      return;
    }
    const emails = parseParticipantEmails(values.participants ?? "");
    try {
      await update({
        id: meeting.id,
        title: values.title,
        description: values.description,
        meetingLink: values.meetingLink,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        ownerId: user.uid,
        participants: buildParticipants(emails),
        participantEmails: emails,
        availability: profile?.availability ?? [],
      });
      showToast("Meeting updated.", "success");
      router.push(`/meetings/${meeting.id}`);
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to update meeting."), "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Meeting not found.</p>
      </Card>
    );
  }


  // Permissão: só pode editar se for owner OU tiver permissão no grupo
  const grupoId = meeting.grupoId;
  const podeEditar =
    user?.uid === meeting.ownerId ||
    (grupoId && profile?.gruposPermissoes && profile.gruposPermissoes[grupoId]?.includes("editar-reuniao"));

  if (!podeEditar) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Você não tem permissão para editar esta reunião.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Edit meeting</h1>
        <p className="text-sm text-slate-500">Update the meeting details.</p>
      </div>
      <MeetingForm
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        initialValues={{
          title: meeting.title,
          description: meeting.description,
          meetingLink: meeting.meetingLink ?? "",
          date: meeting.date,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          participants: meeting.participants.map((participant) => participant.email).join(", "),
        }}
      />
    </Card>
  );
}
