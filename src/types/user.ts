export type AvailabilityWindow = {
  start: string; // "09:00"
  end: string; // "18:00"
};

export type AvailabilityRule = {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  windows: AvailabilityWindow[];
  enabled: boolean;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  availability: AvailabilityRule[];
  createdAt?: Date;
  updatedAt?: Date;
};
