// src/services/email.service.ts

export async function enviarConviteEmail(destinatario: string, assunto: string, corpo: string) {
  // Aqui você pode integrar com um serviço de email real (SendGrid, Resend, SMTP, etc)
  // Exemplo fictício:
  try {
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: destinatario, subject: assunto, text: corpo }),
    });
  } catch (e) {
    console.error("Erro ao enviar convite por email:", e);
  }
}
