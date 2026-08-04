import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Avatar,
  Typography,
  Grid,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Email,
  Badge as BadgeIcon,
  Phone,
  Search,
  EventAvailable,
  EventBusy,
  Upcoming,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, EmptyState, ListSkeleton } from '@/components/common';
import { useAuth } from '@/hooks';
import { registrationsApi } from '@/api';
import { formatDate, formatDateTime } from '@/utils';
import { RegistrationStatus, type Registration } from '@/types';

const unwrapRegistrations = (data: unknown): Registration[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: Registration[] }).items;
  }
  return [];
};

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoadingRegs(true);
      try {
        const { data } = await registrationsApi.getMyRegistrations();
        setRegistrations(unwrapRegistrations(data));
      } catch (error) {
        console.error('Failed to load registrations:', error);
      } finally {
        setLoadingRegs(false);
      }
    };
    void load();
  }, []);

  const now = Date.now();

  const stats = useMemo(() => {
    const active = registrations.filter((r) => r.status !== RegistrationStatus.Cancelled);
    const participated = registrations.filter((r) => r.status === RegistrationStatus.Attended);
    const upcoming = registrations.filter((r) => {
      if (!r.eventStartAt) return false;
      if (r.status === RegistrationStatus.Cancelled || r.status === RegistrationStatus.Rejected) {
        return false;
      }
      return new Date(r.eventStartAt).getTime() > now;
    });
    return {
      registered: active.length,
      participated: participated.length,
      upcoming: upcoming.length,
    };
  }, [registrations, now]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...registrations].sort((a, b) => {
      const aTime = a.eventStartAt ? new Date(a.eventStartAt).getTime() : 0;
      const bTime = b.eventStartAt ? new Date(b.eventStartAt).getTime() : 0;
      return bTime - aTime;
    });
    if (!q) return list;
    return list.filter((r) => (r.eventTitle || '').toLowerCase().includes(q));
  }, [registrations, search]);

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Typography>{t('common.loadingShort')}</Typography>
      </Container>
    );
  }

  const initials = user.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
        breadcrumbs={[{ label: t('common.home'), path: '/' }, { label: t('profile.title') }]}
      />

      <Paper
        sx={{
          mb: 3,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            height: 88,
            background: 'linear-gradient(120deg, rgba(200,16,46,0.12) 0%, rgba(245,197,24,0.18) 100%)',
          }}
        />
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3, mt: -6 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
          >
            <Avatar
              src={user.avatarUrl}
              alt={user.fullName}
              sx={{
                width: 96,
                height: 96,
                border: 3,
                borderColor: 'background.paper',
                fontSize: '1.75rem',
                fontWeight: 700,
                bgcolor: 'primary.main',
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h5" fontWeight={800}>
                  {user.fullName}
                </Typography>
                <Chip label={user.role} color="primary" size="small" />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('profile.memberSince', { date: formatDate(user.createdAt) })}
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <BadgeIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {t('profile.adminId')}
                  </Typography>
                </Stack>
                <Typography fontWeight={700} noWrap>
                  {user.studentId || user.id.slice(0, 8)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {t('profile.email')}
                  </Typography>
                </Stack>
                <Typography fontWeight={700} noWrap>
                  {user.email}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {t('profile.phone')}
                  </Typography>
                </Stack>
                <Typography fontWeight={700} noWrap>
                  {user.phone || t('profile.notUpdated')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: t('profile.registeredCount'),
            value: stats.registered,
            icon: <EventAvailable sx={{ color: 'primary.main' }} />,
            bgcolor: 'rgba(200,16,46,0.08)',
          },
          {
            label: t('profile.participatedCount'),
            value: stats.participated,
            icon: <EventBusy sx={{ color: 'success.main' }} />,
            bgcolor: 'rgba(34,197,94,0.1)',
          },
          {
            label: t('profile.upcomingCount'),
            value: stats.upcoming,
            icon: <Upcoming sx={{ color: 'warning.dark' }} />,
            bgcolor: 'rgba(245,197,24,0.16)',
          },
        ].map((card) => (
          <Grid item xs={12} sm={4} key={card.label}>
            <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {card.label}
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  {loadingRegs ? '—' : card.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: card.bgcolor,
                }}
              >
                {card.icon}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={700}>
            {t('profile.myActivities')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('profile.searchActivities')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { sm: 240 } }}
            />
            <Button variant="outlined" onClick={() => navigate('/registrations')}>
              {t('profile.viewAllRegistrations')}
            </Button>
          </Stack>
        </Stack>

        {loadingRegs ? (
          <ListSkeleton count={3} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={t('profile.noActivities')}
            description={t('registrations.emptyDescription')}
            action={{ label: t('common.browseEvents'), onClick: () => navigate('/events') }}
          />
        ) : (
          <List disablePadding>
            {filtered.slice(0, 8).map((reg, idx) => (
              <React.Fragment key={reg.id}>
                {idx > 0 && <Divider />}
                <ListItemButton onClick={() => navigate(`/events/${reg.eventId}`)} sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={reg.eventTitle || t('registrations.eventFallback')}
                    secondary={
                      reg.eventStartAt
                        ? formatDateTime(reg.eventStartAt)
                        : t('registrations.registeredAt', { date: formatDateTime(reg.registeredAt) })
                    }
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                  <Chip label={reg.status} size="small" sx={{ ml: 1 }} />
                </ListItemButton>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default ProfilePage;
