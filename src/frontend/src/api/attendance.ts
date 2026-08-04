import { apiClient } from './client';
import type { QrPayload, CheckInRequest, Attendance } from '@/types';

export const attendanceApi = {
  generateQr: (eventId: string, validitySeconds = 30, isSingleUse = true) =>
    apiClient.post<QrPayload>('/attendance/generate-qr', {
      eventId,
      validitySeconds,
      isSingleUse,
    }),

  checkIn: (payload: CheckInRequest) =>
    apiClient.post<Attendance>('/attendance/check-in', payload),

  checkOut: (payload: CheckInRequest) =>
    apiClient.post<Attendance>('/attendance/check-out', payload),

  getMyAttendance: () =>
    apiClient.get<Attendance[]>('/attendance/my-attendance'),

  getEventAttendance: (eventId: string) =>
    apiClient.get<Attendance[]>(`/attendance/events/${eventId}`),
};
