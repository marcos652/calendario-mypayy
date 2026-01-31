import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { to, subject, text } = await req.json();
    if (!to || !subject || !text) {
      return NextResponse.json({ ok: false, error: "Dados incompletos." }, { status: 400 });
    }
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      text,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Erro ao enviar e-mail:", e);
    return NextResponse.json({ ok: false, error: e.message || "Erro ao enviar e-mail." }, { status: 500 });
  }
}
