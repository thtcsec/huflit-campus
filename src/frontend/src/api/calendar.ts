import { apiClient } from './client';
import type { CalendarEvent } from '@/types';

export const calendarApi = {
  getCalendarEvents: (month: number, year: number) =>
    apiClient.get<CalendarEvent[]>('/calendar', {
      params: { month, year },
    }),

  getMyCalendarEvents: (month: number, year: number) =>
    apiClient.get<CalendarEvent[]>('/calendar/my-events', {
      params: { month, year },
    }),
};
