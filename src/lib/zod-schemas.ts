import { z } from "zod";

export const availabilityWindowSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

export const availabilityRuleSchema = z.object({
  dayOfWeek: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  windows: z.array(availabilityWindowSchema),
  enabled: z.boolean(),
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^https?:\/\//i;

export const meetingFormSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    meetingLink: z
      .string()
      .transform((value) => (value ? value.trim() : ""))
      .refine((value) => {
            if (!value) {
          return true;
        }
        const normalized = urlRegex.test(value) ? value : `https://${value}`;
        return z.string().url().safeParse(normalized).success;
      }, {
        message: "Meeting link must be a valid URL",
      }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    participants: z
      .string()
      .transform((value) => (value ? value.trim() : ""))
      .refine((value) => {
        if (!value) {
          return true;
        }
        return value
          .split(/[,\n;]+/)
          .map((email) => email.trim())
          .filter(Boolean)
          .every((email) => emailRegex.test(email));
      }, {
        message: "Participants must be valid emails",
      }),
    grupoId: z.string().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    path: ["endTime"],
    message: "End time must be after start time",
  });

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    role: z.enum(["usuario", "admin", "master"]).default("usuario"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });
