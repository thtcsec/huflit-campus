/**
 * Calendar Sync Utilities (iCalendar .ics export & Google Calendar 1-click sync)
 */

interface CalendarEventData {
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  endAt: string;
}

const formatIcsDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

/**
 * Generates an .ics file content and initiates browser download
 */
export const downloadIcsFile = (event: CalendarEventData, filename?: string): void => {
  const start = formatIcsDate(event.startAt);
  const end = formatIcsDate(event.endAt);
  const now = formatIcsDate(new Date().toISOString());

  const cleanDescription = (event.description || '').replace(/\n/g, '\\n').replace(/,/g, '\\,');
  const cleanLocation = (event.location || 'Trường Đại học Ngoại ngữ - Tin học TP.HCM (HUFLIT)').replace(/,/g, '\\,');
  const cleanTitle = (event.title || 'HUFLIT Event').replace(/,/g, '\\,');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HUFLIT Campus//Event Management System//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:huflit-${Date.now()}@huflit.edu.vn`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename || 'huflit-event'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Builds Google Calendar web add link
 */
export const getGoogleCalendarUrl = (event: CalendarEventData): string => {
  const start = formatIcsDate(event.startAt);
  const end = formatIcsDate(event.endAt);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description || '',
    location: event.location || 'Trường Đại học Ngoại ngữ - Tin học TP.HCM (HUFLIT)',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
