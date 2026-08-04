import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Box, Chip, IconButton } from '@mui/material';
import { AccessTime, LocationOn, People, BookmarkBorder, Bookmark } from '@mui/icons-material';
import { EventListItem } from '@/types';
import { formatDate } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { CategoryChip } from '@/components/common';
import { savedEventsApi } from '@/api';
import { useState } from 'react';
import { useSnackbar } from 'notistack';

interface EventCardProps {
  event: EventListItem;
  onUpdate?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onUpdate }) => {
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
        enqueueSnackbar('Event removed from saved', { variant: 'info' });
      } else {
        await savedEventsApi.saveEvent(event.id);
        setIsSaved(true);
        enqueueSnackbar('Event saved', { variant: 'success' });
      }
      onUpdate?.();
    } catch (error) {
      enqueueSnackbar('Failed to update', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const capacityPercent = (event.registrationCount / event.capacity) * 100;
  const isAlmostFull = capacityPercent >= 80;

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
        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
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
            label="Featured"
            size="small"
            color="primary"
            sx={{ position: 'absolute', top: 12, right: 12 }}
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
            <Chip label="Almost Full" size="small" color="warning" sx={{ ml: 1 }} />
          )}
        </Box>
      </CardContent>

      {event.isRegistered && (
        <CardActions sx={{ pt: 0 }}>
          <Chip label="Registered" size="small" color="success" sx={{ ml: 1 }} />
        </CardActions>
      )}
    </Card>
  );
};

export default EventCard;
