import { apiClient } from './client';
import type { Announcement } from '@/types';

export const announcementsApi = {
  getAnnouncements: () =>
    apiClient.get<Announcement[]>('/announcements'),

  getActiveAnnouncements: () =>
    apiClient.get<Announcement[]>('/announcements/active'),
};
