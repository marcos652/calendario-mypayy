type ErrorWithCode = {
  code?: string;
  message?: string;
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as ErrorWithCode;
    if (maybeError.code && maybeError.message) {
      return `${maybeError.code}: ${maybeError.message}`;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};
