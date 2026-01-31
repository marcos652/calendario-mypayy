"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format, parseISO, isAfter } from "date-fns";
import { useMeetings } from "@/hooks/useMeetings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { meetings, loading } = useMeetings();

  const upcoming = useMemo(() => {
    const now = new Date();
    return meetings
      .filter((meeting) => meeting.status === "scheduled" && isAfter(parseISO(meeting.date), now))
      .slice(0, 5);
  }, [meetings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Painel</h1>
          <p className="text-sm text-slate-500">Acompanhe suas reuniões e disponibilidade.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/meetings/new">
            <Button>Nova reunião</Button>
          </Link>
          <Link href="/calendar">
            <Button variant="secondary">Abrir agenda</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Total de reuniões</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{loading ? "..." : meetings.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Agendadas</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {loading ? "..." : meetings.filter((meeting) => meeting.status === "scheduled").length}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Canceladas</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {loading ? "..." : meetings.filter((meeting) => meeting.status === "cancelled").length}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Próximas reuniões</h2>
            <p className="text-sm text-slate-500">Próximas reuniões agendadas para você.</p>
          </div>
          <Link className="text-sm font-medium text-slate-900" href="/meetings">
            Ver todas
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {upcoming.length === 0 && !loading && (
            <p className="text-sm text-slate-500">Nenhuma reunião agendada.</p>
          )}
          {upcoming.map((meeting) => (
            <div key={meeting.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-900">{meeting.title}</p>
                <p className="text-xs text-slate-500">
                  {format(parseISO(meeting.date), "dd/MM/yyyy")} • {meeting.startTime} - {meeting.endTime}
                </p>
              </div>
              <Badge variant={meeting.status === "scheduled" ? "success" : "warning"}>{meeting.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
