"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useMeetings } from "@/hooks/useMeetings";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MeetingsPage() {
  const { meetings, loading } = useMeetings();
  const { profile, user, loading: authLoading } = useAuth();
  const podeVer = (meeting: any) => {
    if (!meeting.grupoId) return true;
    if (!profile?.gruposPermissoes) return false;
    return profile.gruposPermissoes[meeting.grupoId]?.includes("visualizar-agenda");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-slate-500 text-lg">Carregando autenticação...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-slate-500 text-lg">Faça login para visualizar suas reuniões.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Meetings</h1>
          <p className="text-sm text-slate-500">Manage your scheduled meetings.</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Link href="/meetings/new">
            <Button>New meeting</Button>
          </Link>
          {meetings.length > 0 && (
            <Button
              variant="danger"
              onClick={async () => {
                for (const meeting of meetings) {
                  await cancelMeeting(meeting.id, meeting.ownerId);
                }
                if (typeof window !== "undefined") window.location.reload();
              }}
            >
              Excluir agenda
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="space-y-3">
          {loading && <p className="text-sm text-slate-500">Loading meetings...</p>}
          {!loading && meetings.length === 0 && (
            <p className="text-sm text-slate-500">No meetings yet. Create your first one.</p>
          )}
          {meetings.filter(podeVer).map((meeting) => (
            <div key={meeting.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-900">{meeting.title}</p>
                <p className="text-xs text-slate-500">
                  {format(parseISO(meeting.date), "MMM dd, yyyy")} ? {meeting.startTime} - {meeting.endTime}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={meeting.status === "scheduled" ? "success" : "warning"}>{meeting.status}</Badge>
                <Link className="text-sm font-medium text-slate-900" href={`/meetings/${meeting.id}`}>
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
