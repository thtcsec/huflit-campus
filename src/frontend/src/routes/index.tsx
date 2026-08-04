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
import NotificationsPage from '@/pages/NotificationsPage';
import CalendarPage from '@/pages/CalendarPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <BootSplash />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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

/** First paint: login (HCMUS-style) when anonymous; home feed when signed in. */
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
                <RoleGate allowedRoles={[UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator]}>
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
                <RoleGate allowedRoles={[UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator]}>
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
                <RoleGate allowedRoles={[UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator]}>
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
                <RoleGate allowedRoles={[UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator]}>
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
                <RoleGate allowedRoles={[UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator]}>
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

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AppShell>
                <RoleGate allowedRoles={[UserRole.Administrator, UserRole.FacultyManager]}>
                  <AdminDashboardPage />
                </RoleGate>
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
