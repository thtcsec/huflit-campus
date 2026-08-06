import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader, SearchBar, EmptyState, EventGridSkeleton } from '@/components/common';
import { EventGrid } from '@/components/events';
import { eventsApi } from '@/api';
import { useDebounce } from '@/hooks';
import type { EventListItem, EventCategory, EventStatus } from '@/types';
import { EventCategory as EventCategoryEnum, EventStatus as EventStatusEnum } from '@/types';
import { unwrapPaged } from '@/types/paging';

const EventsPage: React.FC = () => {
  const { t } = useTranslation();
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
      setEvents(unwrapPaged<EventListItem>(data));
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
        title={t('events.title')}
        subtitle={t('events.subtitle')}
        breadcrumbs={[{ label: t('common.home'), path: '/' }, { label: t('events.title') }]}
      />

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <SearchBar value={search} onChange={setSearch} placeholder={t('events.searchPlaceholder')} />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('events.category')}</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                label={t('events.category')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {Object.values(EventCategoryEnum).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {t(`categories.${cat}` as any, cat)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('events.status')}</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                label={t('events.status')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {Object.values(EventStatusEnum).map((stat) => (
                  <MenuItem key={stat} value={stat}>
                    {stat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <TextField
              fullWidth
              label={t('events.faculty')}
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <EventGridSkeleton count={9} />
      ) : events.length > 0 ? (
        <EventGrid events={events} onUpdate={loadEvents} />
      ) : (
        <EmptyState
          title={t('events.emptyTitle')}
          description={t('events.emptyDescription')}
          action={{
            label: t('common.clearFilters'),
            onClick: () => {
              setSearch('');
              setCategory('');
              setStatus('');
              setFaculty('');
            },
          }}
        />
      )}
    </Container>
  );
};

export default EventsPage;
