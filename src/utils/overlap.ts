export const hasOverlap = (startA: number, endA: number, startB: number, endB: number): boolean => {
  return startA < endB && endA > startB;
};
