import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { PageHeader, SearchBar, EmptyState, EventGridSkeleton } from '@/components/common';
import { EventGrid } from '@/components/events';
import { eventsApi } from '@/api';
import { useDebounce } from '@/hooks';
import type { EventListItem, EventCategory, EventStatus } from '@/types';
import { EventCategory as EventCategoryEnum, EventStatus as EventStatusEnum } from '@/types';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<EventCategory | ''>('');
  const [status, setStatus] = useState<EventStatus | ''>('');
  const [faculty, setFaculty] = useState('');

  const debouncedSearch = useDebounce(search, 500);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data } = await eventsApi.searchEvents({
        search: debouncedSearch || undefined,
        category: category || undefined,
        status: status || undefined,
        faculty: faculty || undefined,
        page: 1,
        pageSize: 50,
      });
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [debouncedSearch, category, status, faculty]);

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Events"
        subtitle="Discover and join events happening on campus"
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Events' }]}
      />

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search events..." />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value as EventCategory)} label="Category">
                <MenuItem value="">All</MenuItem>
                {Object.values(EventCategoryEnum).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)} label="Status">
                <MenuItem value="">All</MenuItem>
                {Object.values(EventStatusEnum).map((stat) => (
                  <MenuItem key={stat} value={stat}>
                    {stat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <TextField fullWidth label="Faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)} />
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <EventGridSkeleton count={9} />
      ) : events.length > 0 ? (
        <EventGrid events={events} onUpdate={loadEvents} />
      ) : (
        <EmptyState
          title="No events found"
          description="Try adjusting your filters or search query"
          action={{ label: 'Clear Filters', onClick: () => { setSearch(''); setCategory(''); setStatus(''); setFaculty(''); } }}
        />
      )}
    </Container>
  );
};

export default EventsPage;
