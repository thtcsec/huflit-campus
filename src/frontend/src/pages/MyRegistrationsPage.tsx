import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader, EmptyState, ListSkeleton } from '@/components/common';
import { registrationsApi } from '@/api';
import type { Registration } from '@/types';
import { formatDateTime } from '@/utils';
import { useNavigate } from 'react-router-dom';

const MyRegistrationsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const { data } = await registrationsApi.getMyRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'CheckedIn':
        return 'success';
      case 'Registered':
        return 'info';
      case 'Waitlisted':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={t('registrations.title')}
        subtitle={t('registrations.subtitle')}
        breadcrumbs={[{ label: t('common.home'), path: '/' }, { label: t('registrations.title') }]}
      />

      {loading ? (
        <ListSkeleton count={5} />
      ) : registrations.length > 0 ? (
        <Grid container spacing={3}>
          {registrations.map((reg) => (
            <Grid item xs={12} key={reg.id}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${reg.eventId}`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {reg.eventTitle || t('registrations.eventFallback')}
                      </Typography>
                      {reg.eventStartAt && (
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(reg.eventStartAt)}
                        </Typography>
                      )}
                    </Box>
                    <Chip label={reg.status} color={getStatusColor(reg.status)} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('registrations.registeredAt', { date: formatDateTime(reg.registeredAt) })}
                    </Typography>
                    {reg.ticketCode && (
                      <Typography variant="body2" fontWeight={600}>
                        {t('registrations.ticket', { code: reg.ticketCode })}
                      </Typography>
                    )}
                    {reg.waitlistPosition && (
                      <Typography variant="body2" color="warning.main">
                        {t('registrations.waitlist', { position: reg.waitlistPosition })}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          title={t('registrations.emptyTitle')}
          description={t('registrations.emptyDescription')}
          action={{ label: t('common.browseEvents'), onClick: () => navigate('/events') }}
        />
      )}
    </Container>
  );
};

export default MyRegistrationsPage;
