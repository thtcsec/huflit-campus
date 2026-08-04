import React, { useMemo, useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { AccessTime, LocationOn, People, BookmarkBorder, Bookmark } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { EventListItem, EventStatus } from '@/types';
import { formatDate, getTimeUntil } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { CategoryChip } from '@/components/common';
import { savedEventsApi } from '@/api';
import { useSnackbar } from 'notistack';

interface EventCardProps {
  event: EventListItem;
  onUpdate?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onUpdate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isSaved, setIsSaved] = useState(event.isSaved);
  const [loading, setLoading] = useState(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      if (isSaved) {
        await savedEventsApi.unsaveEvent(event.id);
        setIsSaved(false);
        enqueueSnackbar(t('events.unsaved'), { variant: 'info' });
      } else {
        await savedEventsApi.saveEvent(event.id);
        setIsSaved(true);
        enqueueSnackbar(t('events.saved'), { variant: 'success' });
      }
      onUpdate?.();
    } catch {
      enqueueSnackbar(t('events.updateFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const capacityPercent = (event.registrationCount / event.capacity) * 100;
  const isAlmostFull = capacityPercent >= 80;

  const scheduleBadge = useMemo(() => {
    const start = new Date(event.startAt).getTime();
    const end = new Date(event.endAt).getTime();
    const now = Date.now();

    if (
      event.status === EventStatus.Completed ||
      event.status === EventStatus.Cancelled ||
      end < now
    ) {
      return { label: t('events.ended'), color: 'default' as const };
    }

    if (start <= now && end >= now) {
      return { label: t('events.ongoing'), color: 'success' as const };
    }

    if (start > now) {
      const { days, hours, minutes } = getTimeUntil(event.startAt);
      let label: string;
      if (days > 0) {
        label = t('events.startsInDaysHours', { days, hours });
      } else if (hours > 0) {
        label = t('events.startsInHoursMins', { hours, minutes });
      } else {
        label = t('events.startsInMins', { minutes: Math.max(minutes, 1) });
      }
      return { label, color: 'warning' as const };
    }

    return null;
  }, [event.endAt, event.startAt, event.status, t]);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => navigate(`/events/${event.id}`)}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={event.bannerUrl || '/placeholder-event.jpg'}
          alt={event.title}
          sx={{ objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            alignItems: 'flex-start',
            maxWidth: '70%',
          }}
        >
          {scheduleBadge && (
            <Chip
              label={scheduleBadge.label}
              size="small"
              color={scheduleBadge.color}
              sx={{ fontWeight: 700, bgcolor: scheduleBadge.color === 'warning' ? '#F5C518' : undefined, color: scheduleBadge.color === 'warning' ? '#1a0a0c' : undefined }}
            />
          )}
          <CategoryChip category={event.category} />
        </Box>
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
          size="small"
          onClick={handleSaveToggle}
          disabled={loading}
        >
          {isSaved ? <Bookmark color="primary" /> : <BookmarkBorder />}
        </IconButton>
        {event.isFeatured && (
          <Chip
            label={t('events.featured')}
            size="small"
            color="primary"
            sx={{ position: 'absolute', bottom: 12, right: 12 }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="h6" component="h3" fontWeight={600} gutterBottom noWrap>
          {event.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <AccessTime fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {formatDate(event.startAt, 'long')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" noWrap>
            {event.locationName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <People fontSize="small" color="action" />
          <Typography variant="body2" color={isAlmostFull ? 'warning.main' : 'text.secondary'}>
            {event.registrationCount} / {event.capacity}
          </Typography>
          {isAlmostFull && (
            <Chip label={t('events.almostFull')} size="small" color="warning" sx={{ ml: 1 }} />
          )}
        </Box>
      </CardContent>

      {event.isRegistered && (
        <CardActions sx={{ pt: 0 }}>
          <Chip label={t('events.registered')} size="small" color="success" sx={{ ml: 1 }} />
        </CardActions>
      )}
    </Card>
  );
};

export default EventCard;
