export function generateWhatsAppReminderLink(params: {
  phone: string;
  patientName: string;
  date: string;
  time: string;
  professionalName: string;
  clinicName: string;
  address?: string;
  meetLink?: string;
}): string {
  const message = encodeURIComponent(
    `Olá ${params.patientName}! 👋\n\n` +
    `Lembrando que você tem uma sessão de fisioterapia agendada:\n\n` +
    `📅 *${params.date}* às *${params.time}*\n` +
    `👨‍⚕️ ${params.professionalName}\n` +
    `🏥 ${params.clinicName}` +
    (params.address ? `\n📍 ${params.address}` : '') +
    (params.meetLink ? `\n🎥 Acesse: ${params.meetLink}` : '') +
    `\n\nPor favor, confirme sua presença respondendo esta mensagem. Em caso de cancelamento, avise com antecedência. Obrigado! 🙏`
  );
  const phone = params.phone.replace(/\D/g, '');
  const phoneWithCode = phone.startsWith('55') ? phone : `55${phone}`;
  return `https://wa.me/${phoneWithCode}?text=${message}`;
}
