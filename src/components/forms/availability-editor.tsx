"use client";

import { useMemo } from "react";
import { AvailabilityRule } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const dayLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const ensureRules = (rules: AvailabilityRule[]): AvailabilityRule[] => {
  if (rules.length === 7) {
    return rules;
  }
  return dayLabels.map((_, index) => ({
    dayOfWeek: index as AvailabilityRule["dayOfWeek"],
    windows: [{ start: "09:00", end: "17:00" }],
    enabled: index >= 1 && index <= 5,
  }));
};

type AvailabilityEditorProps = {
  value: AvailabilityRule[];
  onChange: (value: AvailabilityRule[]) => void;
};

export const AvailabilityEditor = ({ value, onChange }: AvailabilityEditorProps) => {
  const rules = useMemo(() => ensureRules(value), [value]);

  const updateRule = (index: number, rule: AvailabilityRule) => {
    const next = [...rules];
    next[index] = rule;
    onChange(next);
  };

  return (
    <div className="space-y-6">
      {rules.map((rule, index) => (
        <div key={rule.dayOfWeek} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{dayLabels[rule.dayOfWeek]}</p>
              <p className="text-xs text-slate-500">Defina os horários disponíveis</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={(event) =>
                  updateRule(index, {
                    ...rule,
                    enabled: event.target.checked,
                  })
                }
              />
              Ativo
            </label>
          </div>

          <div className="mt-4 space-y-3">
            {rule.windows.map((window, windowIndex) => (
              <div key={`${rule.dayOfWeek}-${windowIndex}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <Label htmlFor={`start-${rule.dayOfWeek}-${windowIndex}`}>Início</Label>
                  <Input
                    id={`start-${rule.dayOfWeek}-${windowIndex}`}
                    type="time"
                    value={window.start}
                    onChange={(event) => {
                      const windows = [...rule.windows];
                      windows[windowIndex] = { ...window, start: event.target.value };
                      updateRule(index, { ...rule, windows });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor={`end-${rule.dayOfWeek}-${windowIndex}`}>Fim</Label>
                  <Input
                    id={`end-${rule.dayOfWeek}-${windowIndex}`}
                    type="time"
                    value={window.end}
                    onChange={(event) => {
                      const windows = [...rule.windows];
                      windows[windowIndex] = { ...window, end: event.target.value };
                      updateRule(index, { ...rule, windows });
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const windows = rule.windows.filter((_, idx) => idx !== windowIndex);
                      updateRule(index, { ...rule, windows: windows.length ? windows : rule.windows });
                    }}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="secondary"
              onClick={() => updateRule(index, { ...rule, windows: [...rule.windows, { start: "09:00", end: "17:00" }] })}
            >
              Adicionar horário
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
