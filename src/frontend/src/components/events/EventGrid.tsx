import React from 'react';
import { Grid } from '@mui/material';
import EventCard from './EventCard';
import { EventListItem } from '@/types';

interface EventGridProps {
  events: EventListItem[];
  onUpdate?: () => void;
}

const EventGrid: React.FC<EventGridProps> = ({ events, onUpdate }) => {
  return (
    <Grid container spacing={3}>
      {events.map((event) => (
        <Grid item xs={12} sm={6} md={4} key={event.id}>
          <EventCard event={event} onUpdate={onUpdate} />
        </Grid>
      ))}
    </Grid>
  );
};

export default EventGrid;
