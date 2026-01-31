// src/lib/google-meet.ts

export function gerarLinkGoogleMeet() {
  // Gera um link aleatório de Google Meet (simulação)
  // Para integração real, seria necessário usar a API do Google Calendar
  const random = Math.random().toString(36).substring(2, 12);
  return `https://meet.google.com/${random}`;
}
