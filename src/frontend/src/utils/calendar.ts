import type { EventDetail, EventListItem } from '@/types';

export function generateIcsContent(event: EventDetail | EventListItem): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const title = event.title.replace(/\n/g, ' ');
  const description = ('description' in event ? event.description : title).replace(/\n/g, '\\n');
  const location = ('location' in event ? event.location : '') || 'HUFLIT Campus';
  const start = formatDate(event.startAt);
  const end = formatDate(event.endAt);
  const now = formatDate(new Date().toISOString());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HUFLIT Campus//EMS Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@huflit-campus`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(event: EventDetail | EventListItem) {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const sanitizedTitle = event.title.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '_').substring(0, 30);
  link.setAttribute('download', `HUFLIT_Event_${sanitizedTitle}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl(event: EventDetail | EventListItem): string {
  const formatUtcDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const titleText = event.title || 'HUFLIT Event';
  const descText = 'description' in event && typeof event.description === 'string' ? event.description : titleText;
  const locText = 'location' in event && typeof event.location === 'string' ? event.location : 'HUFLIT Campus';

  const title = encodeURIComponent(titleText);
  const description = encodeURIComponent(descText);
  const location = encodeURIComponent(locText || 'HUFLIT Campus');
  const start = formatUtcDate(event.startAt);
  const end = formatUtcDate(event.endAt);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}`;
}
