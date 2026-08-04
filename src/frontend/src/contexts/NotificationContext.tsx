import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { notificationsApi } from '@/api';
import type { Notification } from '@/types';
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
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationsApi.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetchNotifications();

    const newConnection = new HubConnectionBuilder()
      .withUrl('/hubs/notifications', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    newConnection.on('ReceiveNotification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      enqueueSnackbar(notification.title, {
        variant: 'info',
        autoHideDuration: 5000,
      });
    });

    newConnection
      .start()
      .then(() => {
        setIsConnected(true);
        console.log('SignalR connected');
      })
      .catch((err) => console.error('SignalR connection error:', err));

    newConnection.onreconnected(() => {
      setIsConnected(true);
      fetchNotifications();
    });

    newConnection.onreconnecting(() => {
      setIsConnected(false);
    });

    newConnection.onclose(() => {
      setIsConnected(false);
    });

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, [fetchNotifications, enqueueSnackbar]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
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
