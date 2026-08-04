import React, { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { PageHeader, EmptyState, EventGridSkeleton } from '@/components/common';
import { EventGrid } from '@/components/events';
import { savedEventsApi } from '@/api';
import type { EventListItem } from '@/types';
import { useNavigate } from 'react-router-dom';

const SavedEventsPage: React.FC = () => {
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
        title="Saved Events"
        subtitle="Events you've bookmarked for later"
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Saved Events' }]}
      />

      {loading ? (
        <EventGridSkeleton count={6} />
      ) : events.length > 0 ? (
        <EventGrid events={events} onUpdate={loadSavedEvents} />
      ) : (
        <EmptyState
          title="No saved events"
          description="You haven't saved any events yet. Browse events and save the ones you're interested in."
          action={{ label: 'Browse Events', onClick: () => navigate('/events') }}
        />
      )}
    </Container>
  );
};

export default SavedEventsPage;
