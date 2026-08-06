import { apiClient } from './client';
import type { Announcement } from '@/types';

export const announcementsApi = {
  getAnnouncements: () =>
    apiClient.get<Announcement[]>('/announcements'),

  getActiveAnnouncements: () =>
    apiClient.get<Announcement[]>('/announcements/active'),

  createAnnouncement: (payload: { title: string; body: string; isPinned?: boolean; publishedAt?: string; expiresAt?: string }) =>
    apiClient.post<Announcement>('/announcements', payload),

  updateAnnouncement: (id: string, payload: { title: string; body: string; isPinned?: boolean; publishedAt?: string; expiresAt?: string }) =>
    apiClient.put<Announcement>(`/announcements/${id}`, payload),

  deleteAnnouncement: (id: string) =>
    apiClient.delete(`/announcements/${id}`),
};
