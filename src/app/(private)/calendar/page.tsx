"use client";

import { useMemo, useState } from "react";
import { addMonths, format, startOfWeek, addDays } from "date-fns";
import { useMeetings } from "@/hooks/useMeetings";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const { meetings } = useMeetings();
  const [view, setView] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedMeetings = useMemo(() => {
    const key = format(selectedDate, "yyyy-MM-dd");
    return meetings.filter((meeting) => meeting.date === key);
  }, [meetings, selectedDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }).map((_, index) => addDays(start, index));
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Calendário</h1>
          <p className="text-sm text-slate-500">Veja e gerencie seus compromissos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setView("month")}>Mês</Button>
          <Button variant="secondary" onClick={() => setView("week")}>Semana</Button>
          <Button variant="ghost" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
        </div>
      </div>

      {view === "month" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCurrentDate(addMonths(currentDate, -1))}>
                Anterior
              </Button>
              <Button variant="secondary" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                Próximo
              </Button>
            </div>
          </div>
          <CalendarGrid
            currentDate={currentDate}
            meetings={meetings}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      ) : (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Visualização semanal</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {weekDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayMeetings = meetings.filter((meeting) => meeting.date === key);
              return (
                <div key={key} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{format(day, "EEE, dd 'de' MMM")}</p>
                  {dayMeetings.length === 0 && <p className="mt-2 text-xs text-slate-500">Nenhuma reunião.</p>}
                  <div className="mt-2 space-y-2">
                    {dayMeetings.map((meeting) => (
                      <div key={meeting.id} className="rounded-md border border-slate-100 bg-slate-50 p-2">
                        <p className="text-sm font-medium text-slate-900">{meeting.title}</p>
                        <p className="text-xs text-slate-500">{meeting.startTime} - {meeting.endTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Reuniões em {format(selectedDate, "dd 'de' MMMM, yyyy")}</h2>
        <div className="mt-4 space-y-3">
          {selectedMeetings.length === 0 && <p className="text-sm text-slate-500">Nenhuma reunião para este dia.</p>}
          {selectedMeetings.map((meeting) => (
            <div key={meeting.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-medium text-slate-900">{meeting.title}</p>
              <p className="text-xs text-slate-500">
                {meeting.startTime} - {meeting.endTime} {meeting.status === "cancelled" ? "(cancelada)" : ""}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
