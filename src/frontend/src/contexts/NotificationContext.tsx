import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { notificationsApi } from '@/api';
import type { Notification } from '@/types';
import { unwrapPaged } from '@/types/paging';
import { useSnackbar } from 'notistack';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const list = Array.isArray(notifications) ? notifications : [];
  const unreadCount = list.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationsApi.getMyNotifications();
      setNotifications(unwrapPaged<Notification>(data));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    void fetchNotifications();

    const newConnection = new HubConnectionBuilder()
      .withUrl('/hubs/notifications', {
        accessTokenFactory: () => localStorage.getItem('accessToken') || '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    newConnection.on('notificationReceived', (notification: Notification) => {
      setNotifications((prev) => [notification, ...(Array.isArray(prev) ? prev : [])]);
      enqueueSnackbar(notification.title, {
        variant: 'info',
        autoHideDuration: 5000,
      });
    });

    // Backward-compatible event name
    newConnection.on('ReceiveNotification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...(Array.isArray(prev) ? prev : [])]);
      enqueueSnackbar(notification.title, {
        variant: 'info',
        autoHideDuration: 5000,
      });
    });

    newConnection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => console.error('SignalR connection error:', err));

    newConnection.onreconnected(() => {
      setIsConnected(true);
      void fetchNotifications();
    });
    newConnection.onreconnecting(() => setIsConnected(false));
    newConnection.onclose(() => setIsConnected(false));

    return () => {
      void newConnection.stop();
    };
  }, [fetchNotifications, enqueueSnackbar]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    // Optimistic remove so UI never hangs on delete
    setNotifications((prev) => (Array.isArray(prev) ? prev : []).filter((n) => n.id !== id));
    try {
      await notificationsApi.deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      await fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: list,
        unreadCount,
        isConnected,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
