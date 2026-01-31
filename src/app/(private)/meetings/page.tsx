"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useMeetings } from "@/hooks/useMeetings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MeetingsPage() {
  const { meetings, loading } = useMeetings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Meetings</h1>
          <p className="text-sm text-slate-500">Manage your scheduled meetings.</p>
        </div>
        <Link href="/meetings/new">
          <Button>New meeting</Button>
        </Link>
      </div>

      <Card>
        <div className="space-y-3">
          {loading && <p className="text-sm text-slate-500">Loading meetings...</p>}
          {!loading && meetings.length === 0 && (
            <p className="text-sm text-slate-500">No meetings yet. Create your first one.</p>
          )}
          {meetings.map((meeting) => (
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
