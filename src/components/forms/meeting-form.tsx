"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { meetingFormSchema } from "@/lib/zod-schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <Input
          id="meetingLink"
          placeholder="meet.google.com/xxx or https://teams.microsoft.com/..."
          {...register("meetingLink")}
        />
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
