"use client";

import { addDays, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek } from "date-fns";
import { Meeting } from "@/types/meeting";
import { cn } from "@/utils/ui";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarGridProps = {
  currentDate: Date;
  meetings: Meeting[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export const CalendarGrid = ({ currentDate, meetings, selectedDate, onSelectDate }: CalendarGridProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = gridStart;
  while (day <= gridEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const meetingsByDate = meetings.reduce<Record<string, number>>((acc, meeting) => {
    acc[meeting.date] = (acc[meeting.date] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-slate-500">
        {weekDays.map((dayLabel) => (
          <div key={dayLabel} className="text-center">
            {dayLabel}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((date) => {
          const key = format(date, "yyyy-MM-dd");
          const isSelected = isSameDay(date, selectedDate);
          const count = meetingsByDate[key] ?? 0;

          return (
            <button
              key={key}
              onClick={() => onSelectDate(date)}
              className={cn(
                "h-20 rounded-lg border border-slate-200 p-2 text-left text-xs transition hover:bg-slate-50",
                isSelected && "border-slate-900 bg-slate-100"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">{format(date, "d")}</span>
                {count > 0 && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-white">
                    {count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
