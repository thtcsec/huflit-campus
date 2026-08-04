import { apiClient } from './client';
import type { EventListItem } from '@/types';

export const savedEventsApi = {
  saveEvent: (eventId: string) =>
    apiClient.post(`/saved-events/${eventId}`),

  unsaveEvent: (eventId: string) =>
    apiClient.delete(`/saved-events/${eventId}`),

  getMySavedEvents: () =>
    apiClient.get<EventListItem[]>('/saved-events'),
};
