"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { useMeetings } from "@/hooks/useMeetings";
import { useToast } from "@/components/ui/toast";
import { Meeting } from "@/types/meeting";
import { getErrorMessage } from "@/utils/errors";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getById, cancel } = useMeetings();
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

  const handleCancel = async () => {
    if (!meeting || !user) {
      return;
    }
    try {
      await cancel(meeting.id, user.uid);
      showToast("Meeting cancelled.", "success");
      router.push("/meetings");
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to cancel meeting."), "error");
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

  const grupoId = meeting.grupoId;
  const { profile } = useAuth();
  const isOwner = user?.uid === meeting.ownerId;
  const podeEditar =
    isOwner ||
    (grupoId && profile?.gruposPermissoes && profile.gruposPermissoes[grupoId]?.includes("editar-reuniao"));
  const podeExcluir =
    isOwner ||
    (grupoId && profile?.gruposPermissoes && profile.gruposPermissoes[grupoId]?.includes("excluir-call"));

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{meeting.title}</h1>
            <p className="text-sm text-slate-500">{meeting.description || "No description"}</p>
          </div>
          <Badge variant={meeting.status === "scheduled" ? "success" : "warning"}>{meeting.status}</Badge>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Date</p>
            <p className="text-sm font-medium text-slate-900">
              {format(parseISO(meeting.date), "MMM dd, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Time</p>
            <p className="text-sm font-medium text-slate-900">
              {meeting.startTime} - {meeting.endTime}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Participants</p>
            <p className="text-sm font-medium text-slate-900">{meeting.participants.length}</p>
          </div>
        </div>

        {meeting.meetingLink && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-slate-500">Meeting link</p>
            <a
              className="text-sm font-medium text-slate-900 underline"
              href={meeting.meetingLink}
              target="_blank"
              rel="noreferrer"
            >
              {meeting.meetingLink}
            </a>
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-slate-500">Invitees</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {meeting.participants.length === 0 && (
              <p className="text-sm text-slate-500">No participants added.</p>
            )}
            {meeting.participants.map((participant) => (
              <Badge key={participant.email} variant="default">
                {participant.email}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {meeting.status === "scheduled" && (
        <div className="flex gap-2">
          {podeEditar && (
            <Link href={`/meetings/${meeting.id}/edit`}>
              <Button variant="secondary">Edit meeting</Button>
            </Link>
          )}
          {podeExcluir && (
            <Button variant="danger" onClick={handleCancel}>
              Cancel meeting
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
