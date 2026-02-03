// src/app/api/teams-meeting/route.ts
import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI!;
const TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const GRAPH_API = "https://graph.microsoft.com/v1.0/me/events";

// 1. Troca o código de autorização por access_token
async function getAccessToken(code: string) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code,
    grant_type: "authorization_code",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error("Erro ao obter access_token do Microsoft");
  return res.json();
}

// 2. Cria evento no Teams via Microsoft Graph
interface TeamsEvent {
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees: Array<{ emailAddress: { address: string; name: string } }>;
  [key: string]: unknown;
}

async function createTeamsMeeting(accessToken: string, event: TeamsEvent) {
  const res = await fetch(GRAPH_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error("Erro ao criar evento no Teams");
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { code, event } = await req.json();
    const tokenData = await getAccessToken(code);
    const eventData = await createTeamsMeeting(tokenData.access_token, event);
    // Link do Teams
    const teamsLink = eventData.onlineMeeting?.joinUrl;
    return NextResponse.json({ teamsLink, eventData });
  } catch (e) {
    const error =
      e instanceof Error ? e : new Error(String(e));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
