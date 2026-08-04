import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { BookmarkBorder, Bookmark } from '@mui/icons-material';
import { savedEventsApi } from '@/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';

interface SaveEventButtonProps {
  eventId: string;
  isSaved: boolean;
  onUpdate: () => void;
}

const SaveEventButton: React.FC<SaveEventButtonProps> = ({ eventId, isSaved, onUpdate }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        await savedEventsApi.unsaveEvent(eventId);
        enqueueSnackbar('Event removed from saved', { variant: 'info' });
      } else {
        await savedEventsApi.saveEvent(eventId);
        enqueueSnackbar('Event saved', { variant: 'success' });
      }
      onUpdate();
    } catch (error) {
      enqueueSnackbar('Failed to update', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={isSaved ? 'Unsave' : 'Save for later'}>
      <IconButton color={isSaved ? 'primary' : 'default'} onClick={handleToggle} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : isSaved ? <Bookmark /> : <BookmarkBorder />}
      </IconButton>
    </Tooltip>
  );
};

export default SaveEventButton;
