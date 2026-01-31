const urlRegex = /^https?:\/\//i;

export const normalizeMeetingLink = (value?: string): string => {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return urlRegex.test(trimmed) ? trimmed : `https://${trimmed}`;
};
