import React, { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader, EmptyState, EventGridSkeleton } from '@/components/common';
import { EventGrid } from '@/components/events';
import { savedEventsApi } from '@/api';
import type { EventListItem } from '@/types';
import { useNavigate } from 'react-router-dom';

const SavedEventsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedEvents = async () => {
    setLoading(true);
    try {
      const { data } = await savedEventsApi.getMySavedEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load saved events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedEvents();
  }, []);

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={t('saved.title')}
        subtitle={t('saved.subtitle')}
        breadcrumbs={[{ label: t('common.home'), path: '/' }, { label: t('saved.title') }]}
      />

      {loading ? (
        <EventGridSkeleton count={6} />
      ) : events.length > 0 ? (
        <EventGrid events={events} onUpdate={loadSavedEvents} />
      ) : (
        <EmptyState
          title={t('saved.emptyTitle')}
          description={t('saved.emptyDescription')}
          action={{ label: t('common.browseEvents'), onClick: () => navigate('/events') }}
        />
      )}
    </Container>
  );
};

export default SavedEventsPage;
