import { apiClient } from './client';
import type { Registration } from '@/types';

export const registrationsApi = {
  registerEvent: (eventId: string, notes?: string) =>
    apiClient.post<Registration>(`/registrations/events/${eventId}`, { notes }),

  cancelRegistration: (eventId: string) =>
    apiClient.delete(`/registrations/events/${eventId}`),

  getMyRegistrations: () =>
    apiClient.get<Registration[]>('/registrations/my-registrations'),

  getEventRegistrations: (eventId: string) =>
    apiClient.get<Registration[]>(`/registrations/events/${eventId}`),
};
