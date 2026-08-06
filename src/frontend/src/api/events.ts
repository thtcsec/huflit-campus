import { apiClient } from './client';
import type {
  EventListItem,
  EventDetail,
  CreateEventRequest,
  EventSearchRequest,
  HomeFeed,
} from '@/types';

export const eventsApi = {
  getHomeFeed: () =>
    apiClient.get<HomeFeed>('/events/home'),

  searchEvents: (params: EventSearchRequest) =>
    apiClient.get<EventListItem[]>('/events', { params }),

  getEventById: (id: string) =>
    apiClient.get<EventDetail>(`/events/${id}`),

  createEvent: (payload: CreateEventRequest) =>
    apiClient.post<EventDetail>('/events', payload),

  updateEvent: (id: string, payload: CreateEventRequest) =>
    apiClient.put<EventDetail>(`/events/${id}`, payload),

  deleteEvent: (id: string) =>
    apiClient.delete(`/events/${id}`),

  submitEvent: (id: string) =>
    apiClient.post(`/events/${id}/submit`),

  approveEvent: (id: string, note?: string) =>
    apiClient.post(`/events/${id}/approve`, { note }),

  rejectEvent: (id: string, reason: string) =>
    apiClient.post(`/events/${id}/reject`, { reason }),

  publishEvent: (id: string) =>
    apiClient.post(`/events/${id}/publish`),

  cancelEvent: (id: string) =>
    apiClient.post(`/events/${id}/cancel`),

  closeRegistration: (id: string) =>
    apiClient.post(`/events/${id}/close-registration`),

  completeEvent: (id: string) =>
    apiClient.post(`/events/${id}/complete`),
};
