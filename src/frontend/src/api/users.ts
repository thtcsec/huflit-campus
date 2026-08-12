import { apiClient } from './client';
import type { UserProfile, UserRole } from '@/types';
import type { PagedResult } from '@/types/paging';

export interface ListUsersParams {
  search?: string;
  role?: UserRole | '';
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const usersApi = {
  list: (params: ListUsersParams = {}) =>
    apiClient.get<PagedResult<UserProfile>>('/users', {
      params: {
        search: params.search || undefined,
        role: params.role || undefined,
        isActive: params.isActive,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 50,
      },
    }),

  updateRole: (id: string, role: UserRole) =>
    apiClient.put<UserProfile>(`/users/${id}/role`, { role }),

  setActive: (id: string, isActive: boolean) =>
    apiClient.put<UserProfile>(`/users/${id}/active`, { isActive }),
};
