import type { FinancialEntry, Patient } from '../types';

export const generateReceiptPDF = (entry: FinancialEntry & { patient?: Patient }, clinicName: string = 'Clínica') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Recibo</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #0ea5e9; margin: 0; }
        .info { margin: 20px 0; }
        .info p { margin: 8px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #0ea5e9; text-align: center; margin: 30px 0; }
        .footer { margin-top: 50px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${clinicName}</h1>
        <h2>Recibo</h2>
        <p>Número: ${entry.id.slice(0, 8).toUpperCase()}</p>
        <p>Data: ${new Date(entry.created_at).toLocaleDateString('pt-BR')}</p>
      </div>
      <div class="info">
        <p><strong>Paciente:</strong> ${entry.patient?.name || '-'}</p>
        <p><strong>Descrição:</strong> ${entry.description}</p>
        <p><strong>Forma de Pagamento:</strong> ${entry.payment_method || '-'}</p>
        <p><strong>Status:</strong> ${entry.status === 'paid' ? 'Pago' : 'Pendente'}</p>
      </div>
      <div class="amount">
        R$ ${Number(entry.amount).toFixed(2).replace('.', ',')}
      </div>
      <div class="footer">
        <p>_____________________________________</p>
        <p>Assinatura do Responsável</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};
