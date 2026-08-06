import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { BookmarkBorder, Bookmark } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      enqueueSnackbar(t('auth.loginRequiredNotice'), { variant: 'info' });
      navigate('/login', { state: { from: { pathname: `/events/${eventId}` } } });
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        await savedEventsApi.unsaveEvent(eventId);
        enqueueSnackbar(t('events.unsaved'), { variant: 'info' });
      } else {
        await savedEventsApi.saveEvent(eventId);
        enqueueSnackbar(t('events.saved'), { variant: 'success' });
      }
      onUpdate();
    } catch {
      enqueueSnackbar(t('events.updateFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={isSaved ? t('events.unsave') : t('events.saveForLater')}>
      <IconButton color={isSaved ? 'primary' : 'default'} onClick={handleToggle} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : isSaved ? <Bookmark /> : <BookmarkBorder />}
      </IconButton>
    </Tooltip>
  );
};

export default SaveEventButton;
