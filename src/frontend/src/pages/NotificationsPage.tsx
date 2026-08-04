import React, { useEffect, useState } from 'react';
import { Container, List, ListItem, ListItemText, ListItemButton, Typography, Box, IconButton, Badge } from '@mui/material';
import { Delete, CheckCircle } from '@mui/icons-material';
import { PageHeader, EmptyState, ListSkeleton } from '@/components/common';
import { useNotifications } from '@/hooks';
import { getRelativeTime } from '@/utils';
import type { Notification } from '@/types';

const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="md">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with your events"
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Notifications' }]}
        action={
          notifications.length > 0 ? (
            <IconButton onClick={markAllAsRead} color="primary">
              <CheckCircle />
            </IconButton>
          ) : undefined
        }
      />

      {loading ? (
        <ListSkeleton count={5} />
      ) : notifications.length > 0 ? (
        <List>
          {notifications.map((notif) => (
            <ListItem
              key={notif.id}
              disablePadding
              secondaryAction={
                <IconButton edge="end" onClick={() => deleteNotification(notif.id)}>
                  <Delete />
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                sx={{ bgcolor: notif.isRead ? 'transparent' : 'action.hover' }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={notif.isRead ? 400 : 600}>
                        {notif.title}
                      </Typography>
                      {!notif.isRead && (
                        <Badge variant="dot" color="primary" />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {notif.body}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getRelativeTime(notif.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <EmptyState title="No notifications" description="You're all caught up! Check back later for updates." />
      )}
    </Container>
  );
};

export default NotificationsPage;
