export const timeToMinutes = (time: string): number => {
  const [hh, mm] = time.split(":").map(Number);
  return hh * 60 + mm;
};

export const minutesToTime = (minutes: number): string => {
  const hh = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mm = (minutes % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
};
