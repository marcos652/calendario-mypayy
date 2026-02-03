// src/lib/microsoft-oauth.ts
// Utilitário para iniciar o fluxo OAuth2 do Microsoft Teams (Azure AD)

const CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI!;
const SCOPE = [
  "https://graph.microsoft.com/Calendars.ReadWrite",
  "https://graph.microsoft.com/User.Read"
].join(" ");

export function getMicrosoftOAuthUrl(state?: string) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    response_mode: "query",
    scope: SCOPE,
  });
  if (state) params.append("state", state);
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}
