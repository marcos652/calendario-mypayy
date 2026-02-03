export type AvailabilityWindow = {
  start: string; // "09:00"
  end: string; // "18:00"
};

export type AvailabilityRule = {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  windows: AvailabilityWindow[];
  enabled: boolean;
};

import type { GrupoPermissao } from "./group";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  role?: "usuario" | "admin" | "master";
  availability: AvailabilityRule[];
  gruposPermissoes?: {
    [grupoId: string]: GrupoPermissao[];
  };
  createdAt?: Date;
  updatedAt?: Date;
};
