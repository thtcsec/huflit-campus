import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Chip, Paper, Avatar, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { AccessTime, LocationOn, Person, CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '@/api';
import { PageHeader, CategoryChip, StatusChip, Countdown, ShareButton, EmptyState } from '@/components/common';
import { CapacityBar, RegisterButton, SaveEventButton } from '@/components/events';
import { formatDateTime } from '@/utils';
import { downloadIcsFile } from '@/utils/calendar';
import type { EventDetail } from '@/types';
import { motion } from 'framer-motion';

const EventDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEvent = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await eventsApi.getEventById(id);
      setEvent(data);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>{t('common.loadingShort')}</Typography>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg">
        <EmptyState
          title={t('events.notFound')}
          description={t('events.notFoundDesc')}
          action={{ label: t('common.back'), onClick: () => navigate(-1) }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={event.title}
        breadcrumbs={[
          { label: t('common.home'), path: '/' },
          { label: t('events.title'), path: '/events' },
          { label: event.title },
        ]}
      />

      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {event.bannerUrl && (
          <Box
            component="img"
            src={event.bannerUrl}
            alt={event.title}
            sx={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 3, mb: 4 }}
          />
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <CategoryChip category={event.category} size="medium" />
              <StatusChip status={event.status} size="medium" />
              {event.isFeatured && <Chip label={t('events.featured')} color="primary" />}
            </Box>

            <Typography variant="h3" fontWeight={800} gutterBottom>
              {event.title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
              <SaveEventButton eventId={event.id} isSaved={event.isSaved} onUpdate={loadEvent} />
              <ShareButton title={event.title} url={window.location.href} />
            </Box>

            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {t('events.details')}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AccessTime color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('events.start')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDateTime(event.startAt)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AccessTime color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('events.end')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDateTime(event.endAt)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <LocationOn color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('events.location')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {event.locationName}
                  </Typography>
                  {event.address && (
                    <Typography variant="body2" color="text.secondary">
                      {event.address}
                    </Typography>
                  )}
                </Box>
              </Box>

              {event.organizerName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Person color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('events.organizer')}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {event.organizerName}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {t('events.description')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {event.description}
              </Typography>
            </Paper>

            {event.agenda && (
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {t('events.agenda')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {event.agenda}
                </Typography>
              </Paper>
            )}

            {event.speakers && event.speakers.length > 0 && (
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {t('events.speakers')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  {event.speakers.map((speaker) => (
                    <Grid item xs={12} sm={6} key={speaker.id}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar src={speaker.avatarUrl} alt={speaker.name} sx={{ width: 64, height: 64 }} />
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {speaker.name}
                          </Typography>
                          {speaker.title && (
                            <Typography variant="body2" color="text.secondary">
                              {speaker.title}
                            </Typography>
                          )}
                          {speaker.bio && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {speaker.bio}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 80 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('events.registration')}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('events.timeUntil')}
                </Typography>
                <Countdown targetDate={event.startAt} />
              </Box>

              <Box sx={{ mb: 3 }}>
                <CapacityBar current={event.registrationCount} max={event.capacity} />
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('events.registrationDeadline')}
              </Typography>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                {formatDateTime(event.registrationDeadline)}
              </Typography>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <RegisterButton
                  eventId={event.id}
                  isRegistered={event.isRegistered}
                  remainingSeats={event.remainingSeats}
                  onUpdate={loadEvent}
                />

                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<CalendarTodayIcon />}
                  onClick={() => downloadIcsFile(event)}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  {t('events.addToCalendar')}
                </Button>

                {(event.status === 'Published' || event.status === 'RegistrationClosed') && (
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={async () => {
                      if (window.confirm('Xác nhận hoàn tất sự kiện này?')) {
                        try {
                          await eventsApi.completeEvent(event.id);
                          loadEvent();
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                  >
                    {t('events.completeEvent')}
                  </Button>
                )}
              </Box>

              {event.requirements && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {t('events.requirements')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.requirements}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default EventDetailPage;
