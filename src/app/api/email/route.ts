// Certifique-se de definir as variáveis de ambiente SENDGRID_API_KEY e SENDGRID_FROM_EMAIL
// no painel da Vercel ou em .env.local para funcionamento correto do envio de e-mails.
import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const handler = async (req: NextRequest) => {
  if (req.method !== "POST") {
    return NextResponse.json({ ok: false, error: "Método não permitido" }, { status: 405 });
  }
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
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("Erro ao enviar e-mail:", error);
    return NextResponse.json({ ok: false, error: error.message || "Erro ao enviar e-mail." }, { status: 500 });
  }
};

export { handler as POST };
export default handler;
