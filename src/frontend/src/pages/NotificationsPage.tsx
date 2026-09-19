import React, { useEffect, useState } from 'react';
import {
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  IconButton,
  Badge,
  Tooltip,
  Alert,
} from '@mui/material';
import { Close, Delete, DoneAll } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PageHeader, EmptyState, ListSkeleton, ConfirmDialog } from '@/components/common';
import { useNotifications } from '@/hooks';
import { getRelativeTime } from '@/utils';

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const items = Array.isArray(notifications) ? notifications : [];

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchNotifications()
      .catch(() => {
        if (alive) setError(t('notifications.loadError'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [fetchNotifications, t]);

  const askDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setConfirmOpen(false);
    setPendingDeleteId(null);
    await deleteNotification(id);
  };

  return (
    <Container maxWidth="md">
      <PageHeader
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle')}
        breadcrumbs={[
          { label: t('common.home'), path: '/' },
          { label: t('notifications.title') },
        ]}
        action={
          items.length > 0 ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={t('common.markAllRead')}>
                <IconButton
                  onClick={() => void markAllAsRead()}
                  color="primary"
                  aria-label={t('common.markAllRead')}
                >
                  <DoneAll />
                </IconButton>
              </Tooltip>
            </Box>
          ) : undefined
        }
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <IconButton size="small" color="inherit" onClick={() => setError(null)} aria-label={t('common.close')}>
              <Close fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <ListSkeleton count={5} />
      ) : items.length > 0 ? (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          {items.map((notif) => (
            <ListItem
              key={notif.id}
              disablePadding
              secondaryAction={
                <Tooltip title={t('common.delete')}>
                  <IconButton
                    edge="end"
                    aria-label={t('common.delete')}
                    onClick={(e) => askDelete(notif.id, e)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemButton
                onClick={() => {
                  if (!notif.isRead) void markAsRead(notif.id);
                }}
                sx={{ bgcolor: notif.isRead ? 'transparent' : 'action.hover', pr: 7 }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={notif.isRead ? 400 : 700}>
                        {notif.title}
                      </Typography>
                      {!notif.isRead && <Badge variant="dot" color="primary" />}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" component="span" display="block">
                        {notif.body}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span">
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
        <EmptyState
          title={t('notifications.emptyTitle')}
          description={t('notifications.emptyDescription')}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={t('notifications.deleteTitle')}
        message={t('notifications.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        severity="error"
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </Container>
  );
};

export default NotificationsPage;
