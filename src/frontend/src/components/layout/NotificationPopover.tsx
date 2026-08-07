import React from 'react';
import {
  Popover,
  Box,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Badge,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import { DoneAll, NotificationsNone } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks';
import { getRelativeTime } from '@/utils';

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const getNotificationUrl = (dataJson?: string): string | undefined => {
  if (!dataJson) return undefined;
  try {
    const parsed = JSON.parse(dataJson);
    return parsed.url || (parsed.eventId ? `/events/${parsed.eventId}` : undefined);
  } catch {
    return undefined;
  }
};

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const items = Array.isArray(notifications) ? notifications.slice(0, 5) : [];

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  const handleItemClick = async (id: string, isRead: boolean, targetUrl?: string) => {
    if (!isRead) {
      await markAsRead(id);
    }
    if (targetUrl) {
      onClose();
      navigate(targetUrl);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          width: { xs: 320, sm: 380 },
          maxHeight: 480,
          display: 'flex',
          flexDirection: 'column',
          mt: 1,
          borderRadius: 2,
          boxShadow: 6,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('notifications.title')}
          </Typography>
          {unreadCount > 0 && (
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{ '& .MuiBadge-badge': { fontSize: 11, height: 18, minWidth: 18 } }}
            />
          )}
        </Box>

        {items.length > 0 && (
          <Tooltip title={t('common.markAllRead')}>
            <IconButton
              size="small"
              onClick={() => void markAllAsRead()}
              color="primary"
              aria-label={t('common.markAllRead')}
            >
              <DoneAll fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Content List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 320 }}>
        {items.length > 0 ? (
          <List disablePadding>
            {items.map((notif, index) => (
              <React.Fragment key={notif.id}>
                {index > 0 && <Divider component="li" />}
                <ListItemButton
                  onClick={() =>
                    void handleItemClick(notif.id, notif.isRead, getNotificationUrl(notif.dataJson))
                  }
                  sx={{
                    py: 1.5,
                    px: 2,
                    bgcolor: notif.isRead ? 'transparent' : 'action.hover',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          fontWeight={notif.isRead ? 500 : 700}
                          color="text.primary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flexGrow: 1,
                          }}
                        >
                          {notif.title}
                        </Typography>
                        {!notif.isRead && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                            mb: 0.5,
                          }}
                        >
                          {notif.body}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" display="block">
                          {getRelativeTime(notif.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              py: 4,
              px: 2,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <NotificationsNone sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">
              {t('notifications.emptyTitle')}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Button
          fullWidth
          size="medium"
          variant="contained"
          disableElevation
          onClick={handleViewAll}
          sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          {t('common.viewAll')}
        </Button>
      </Box>
    </Popover>
  );
};

export default NotificationPopover;
