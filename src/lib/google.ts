import type { Appointment } from '../types';
import { appEnv, assertGoogleEnvConfigured } from './env';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export const initiateGoogleOAuth = () => {
  assertGoogleEnvConfigured();

  const params = new URLSearchParams({
    client_id: appEnv.googleClientId,
    redirect_uri: appEnv.googleRedirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });
  window.location.href = `${GOOGLE_AUTH_URL}?${params}`;
};

export const createGoogleCalendarEvent = async (
  accessToken: string,
  appointment: Appointment & { patient?: { name: string }, professional?: { name: string } }
): Promise<{ eventId: string; meetLink?: string }> => {
  const event = {
    summary: `Fisioterapia - ${appointment.patient?.name || 'Paciente'}`,
    description: `Atendimento com ${appointment.professional?.name || 'Profissional'}`,
    start: {
      dateTime: `${appointment.date}T${appointment.start_time}:00`,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: `${appointment.date}T${appointment.end_time}:00`,
      timeZone: 'America/Sao_Paulo',
    },
    conferenceData: appointment.modality === 'online' ? {
      createRequest: {
        requestId: appointment.id,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    } : undefined,
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );
  const data = await response.json();

  if (!response.ok || !data.id) {
    throw new Error(data.error?.message || 'Não foi possível criar o evento no Google Calendar.');
  }

  return {
    eventId: data.id,
    meetLink: data.conferenceData?.entryPoints?.[0]?.uri,
  };
};

export const sendGmailReminder = async (
  accessToken: string,
  to: string,
  subject: string,
  htmlBody: string
): Promise<void> => {
  assertGoogleEnvConfigured();

  const email = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    htmlBody,
  ].join('\n');

  const base64Email = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64Email }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || 'Não foi possível enviar o email pelo Gmail.');
  }
};
