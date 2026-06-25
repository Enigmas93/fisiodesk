export const generateEmailReminderBody = (params: {
  patientName: string;
  date: string;
  time: string;
  professionalName: string;
  clinicName: string;
  address?: string;
  meetLink?: string;
}) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0ea5e9;">Olá ${params.patientName}!</h2>
      <p style="font-size: 16px; color: #333;">
        Lembre-se da sua consulta de fisioterapia:
      </p>
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 8px 0;"><strong>Data:</strong> ${params.date}</p>
        <p style="margin: 8px 0;"><strong>Horário:</strong> ${params.time}</p>
        <p style="margin: 8px 0;"><strong>Profissional:</strong> ${params.professionalName}</p>
        <p style="margin: 8px 0;"><strong>Clínica:</strong> ${params.clinicName}</p>
        ${params.address ? `<p style="margin: 8px 0;"><strong>Endereço:</strong> ${params.address}</p>` : ''}
        ${params.meetLink ? `<p style="margin: 8px 0;"><strong>Link Meet:</strong> <a href="${params.meetLink}">${params.meetLink}</a></p>` : ''}
      </div>
      <p style="font-size: 14px; color: #666;">
        Por favor, confirme sua presença. Em caso de cancelamento, avise com antecedência.
      </p>
      <p style="font-size: 14px; color: #666;">
        Atenciosamente,<br>
        Equipe ${params.clinicName}
      </p>
    </div>
  `;
};
