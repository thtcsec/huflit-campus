import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { RoleGate, BootSplash } from '@/components/common';
import { UserRole } from '@/types';
import { useAuth } from '@/hooks';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import EventsPage from '@/pages/EventsPage';
import EventDetailPage from '@/pages/EventDetailPage';
import CreateEventPage from '@/pages/CreateEventPage';
import EditEventPage from '@/pages/EditEventPage';
import ManageEventsPage from '@/pages/ManageEventsPage';
import OrganizerQrPage from '@/pages/OrganizerQrPage';
import AttendanceScannerPage from '@/pages/AttendanceScannerPage';
import ProfilePage from '@/pages/ProfilePage';
import SavedEventsPage from '@/pages/SavedEventsPage';
import MyRegistrationsPage from '@/pages/MyRegistrationsPage';
import AnnouncementsPage from '@/pages/AnnouncementsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import UserGuidePage from '@/pages/UserGuidePage';
import CalendarPage from '@/pages/CalendarPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import AdminEventsPage from '@/pages/admin/AdminEventsPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminLayout from '@/components/layout/AdminLayout';
import NotFoundPage from '@/pages/NotFoundPage';

import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const location = useLocation();

  if (isLoading) {
    return <BootSplash />;
  }

  if (!isAuthenticated) {
    enqueueSnackbar(t('auth.loginRequiredNotice'), { variant: 'info' });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const OptionalAuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <BootSplash />;
  }

  return <>{children}</>;
};

/** First paint: login when anonymous; home feed when signed in. */
const HomeEntry: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AppShell>
      <HomePage />
    </AppShell>
  );
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <OptionalAuthRoute>
              <HomeEntry />
            </OptionalAuthRoute>
          }
        />

        <Route
          path="/events"
          element={
            <OptionalAuthRoute>
              <AppShell>
                <EventsPage />
              </AppShell>
            </OptionalAuthRoute>
          }
        />

        <Route
          path="/events/:id"
          element={
            <OptionalAuthRoute>
              <AppShell>
                <EventDetailPage />
              </AppShell>
            </OptionalAuthRoute>
          }
        />

        <Route
          path="/events/create"
          element={
            <ProtectedRoute>
              <AppShell>
                <RoleGate allowedRoles={[UserRole.Lecturer, UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator]}>
                  <CreateEventPage />
                </RoleGate>
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute>
              <AppShell>
                <RoleGate allowedRoles={[UserRole.Lecturer, UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator]}>
                  <EditEventPage />
                </RoleGate>
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/manage"
          element={
            <ProtectedRoute>
              <AppShell>
                <RoleGate allowedRoles={[UserRole.Lecturer, UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator]}>
                  <ManageEventsPage />
                </RoleGate>
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer-qr"
          element={
            <ProtectedRoute>
              <AppShell>
                <RoleGate allowedRoles={[UserRole.Lecturer, UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator]}>
                  <OrganizerQrPage />
                </RoleGate>
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance/scan"
          element={
            <ProtectedRoute>
              <AppShell>
                <RoleGate allowedRoles={[UserRole.Lecturer, UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator]}>
                  <AttendanceScannerPage />
                </RoleGate>
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <AppShell>
                <CalendarPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <AppShell>
                <SavedEventsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/registrations"
          element={
            <ProtectedRoute>
              <AppShell>
                <MyRegistrationsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/announcements"
          element={
            <OptionalAuthRoute>
              <AppShell>
                <AnnouncementsPage />
              </AppShell>
            </OptionalAuthRoute>
          }
        />

        <Route
          path="/user-guide"
          element={
            <OptionalAuthRoute>
              <AppShell>
                <UserGuidePage />
              </AppShell>
            </OptionalAuthRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AppShell>
                <NotificationsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProfilePage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Dedicated Admin Portal Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGate allowedRoles={[UserRole.Administrator, UserRole.FacultyManager]}>
                <AdminLayout />
              </RoleGate>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/analytics" replace />} />
          <Route path="analytics" element={<AdminDashboardPage />} />
          <Route
            path="users"
            element={
              <RoleGate allowedRoles={[UserRole.Administrator]} fallback="message">
                <UserManagementPage />
              </RoleGate>
            }
          />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
