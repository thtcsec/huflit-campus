import { apiClient } from './client';
import type { CalendarEvent } from '@/types';

export const calendarApi = {
  getCalendarEvents: (from: string, to: string) =>
    apiClient.get<CalendarEvent[]>('/calendar/events', {
      params: { from, to },
    }),
};
