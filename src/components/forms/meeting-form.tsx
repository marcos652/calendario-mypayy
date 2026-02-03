"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { meetingFormSchema } from "@/lib/zod-schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMicrosoftOAuthUrl } from "@/lib/microsoft-oauth";

export type MeetingFormValues = z.infer<typeof meetingFormSchema>;

type MeetingFormProps = {
  initialValues?: Partial<MeetingFormValues>;
  onSubmit: (values: MeetingFormValues) => Promise<void> | void;
  submitLabel?: string;
  loading?: boolean;
};

export const MeetingForm = ({ initialValues, onSubmit, submitLabel = "Save meeting", loading }: MeetingFormProps) => {

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      meetingLink: "",
      date: "",
      startTime: "09:00",
      endTime: "10:00",
      participants: "",
      ...initialValues,
    },
  });


  // Integração Microsoft Teams (placeholder)
  const [teamsLoading, setTeamsLoading] = useState(false);
  const handleGerarTeams = async () => {
    setTeamsLoading(true);
    try {
      // Detecta code na URL após redirecionamento
      let teamsCode: string | null = null;
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          teamsCode = code;
          url.searchParams.delete("code");
          window.history.replaceState({}, document.title, url.pathname);
        }
      }
      if (!teamsCode) {
        window.location.href = getMicrosoftOAuthUrl();
        return;
      }
      // Monta dados do evento
      const values = getValues();
      const event = {
        subject: values.title || "Reunião",
        body: { contentType: "HTML", content: values.description || "" },
        start: { dateTime: `${values.date}T${values.startTime}:00`, timeZone: "America/Sao_Paulo" },
        end: { dateTime: `${values.date}T${values.endTime}:00`, timeZone: "America/Sao_Paulo" },
        attendees: (values.participants || "").split(/[,;\s]+/).filter(Boolean).map((email: string) => ({
          emailAddress: { address: email, name: email },
          type: "required"
        })),
        isOnlineMeeting: true,
        onlineMeetingProvider: "teamsForBusiness"
      };
      // Chama API route
      const res = await fetch("/api/teams-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: teamsCode, event }),
      });
      const data = await res.json();
      if (data.teamsLink) {
        setValue("meetingLink", data.teamsLink, { shouldValidate: true });
      } else {
        alert("Erro ao gerar link do Teams: " + (data.error || ""));
      }
    } finally {
      setTeamsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} />
      </div>
      <div>
        <Label htmlFor="meetingLink">Meeting link</Label>
        <div className="flex gap-2 flex-wrap">
          <Input
            id="meetingLink"
            placeholder="https://teams.microsoft.com/l/meetup-join/..."
            {...register("meetingLink")}
          />
          <Button type="button" variant="secondary" onClick={handleGerarTeams} disabled={teamsLoading}>
            {teamsLoading ? "Gerando..." : "Gerar Teams"}
          </Button>
        </div>
        {errors.meetingLink && (
          <p className="mt-1 text-xs text-red-600">{errors.meetingLink.message}</p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
        </div>
        <div>
          <Label htmlFor="startTime">Start time</Label>
          <Input id="startTime" type="time" {...register("startTime")} />
          {errors.startTime && <p className="mt-1 text-xs text-red-600">{errors.startTime.message}</p>}
        </div>
        <div>
          <Label htmlFor="endTime">End time</Label>
          <Input id="endTime" type="time" {...register("endTime")} />
          {errors.endTime && <p className="mt-1 text-xs text-red-600">{errors.endTime.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="participants">Participantes (e-mails separados por vírgula)</Label>
        <Input id="participants" {...register("participants")} placeholder="a@empresa.com, b@empresa.com" />
        {errors.participants && <p className="mt-1 text-xs text-red-600">{errors.participants.message}</p>}
      </div>
      <div>
        <Label htmlFor="grupoId">Grupo (opcional)</Label>
        <Input id="grupoId" {...register("grupoId")} placeholder="ID do grupo" />
        {errors.grupoId && <p className="mt-1 text-xs text-red-600">{errors.grupoId.message}</p>}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
};
