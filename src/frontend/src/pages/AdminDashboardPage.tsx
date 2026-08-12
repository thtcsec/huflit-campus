import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Box,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  People,
  Event,
  HowToReg,
  PendingActions,
  CheckCircle,
  TrendingUp,
  School,
  Category,
  EmojiEvents,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { PageHeader, ListSkeleton } from '@/components/common';
import { dashboardApi } from '@/api';
import type { AdminDashboard } from '@/types';
import { motion } from 'framer-motion';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await dashboardApi.getAdminDashboard();
        setDashboard(data);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          t('admin.loadFailed');
        setError(message);
        enqueueSnackbar(message, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, [enqueueSnackbar, t]);

  const totalRegistrations = dashboard?.totalRegistrations ?? 0;
  const totalAttendance = dashboard?.totalAttendance ?? 0;
  const totalEvents = dashboard?.totalEvents ?? 0;
  const showUpRate =
    totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0;

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={t('admin.title')}
        subtitle={t('admin.subtitle')}
        breadcrumbs={[{ label: t('common.home'), path: '/' }, { label: t('nav.dashboard') }]}
      />

      {loading ? (
        <ListSkeleton count={4} />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : dashboard ? (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card component={motion.div} whileHover={{ y: -4 }} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main' }}>
                      <People fontSize="medium" />
                    </Box>
                    <Chip
                      label={`${dashboard.activeUsers} ${t('admin.active')}`}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="h4" fontWeight={800}>
                    {dashboard.totalUsers.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.totalUsers')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card component={motion.div} whileHover={{ y: -4 }} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.main' }}>
                      <Event fontSize="medium" />
                    </Box>
                    <Chip
                      label={`${dashboard.publishedEvents} ${t('admin.published')}`}
                      color="success"
                      size="small"
                    />
                  </Box>
                  <Typography variant="h4" fontWeight={800}>
                    {dashboard.totalEvents.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.totalEvents')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card component={motion.div} whileHover={{ y: -4 }} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.light', color: 'info.main' }}>
                      <HowToReg fontSize="medium" />
                    </Box>
                    <Chip label={t('admin.registrations')} color="info" size="small" variant="outlined" />
                  </Box>
                  <Typography variant="h4" fontWeight={800}>
                    {dashboard.totalRegistrations.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.totalRegistrations')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card component={motion.div} whileHover={{ y: -4 }} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.main' }}>
                      <PendingActions fontSize="medium" />
                    </Box>
                    {dashboard.pendingApprovalEvents > 0 && (
                      <Chip label={t('admin.needsAction')} color="warning" size="small" />
                    )}
                  </Box>
                  <Typography variant="h4" fontWeight={800}>
                    {dashboard.pendingApprovalEvents.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.pendingApproval')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <TrendingUp color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    {t('admin.showUpRate')}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {t('admin.attendanceRate')}
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                      {showUpRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(showUpRate, 100)}
                    sx={{ height: 10, borderRadius: 5, bgcolor: 'action.hover' }}
                  />
                </Box>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                      <CheckCircle color="success" sx={{ mb: 0.5 }} />
                      <Typography variant="h6" fontWeight={700}>
                        {totalAttendance.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('admin.checkedIn')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                      <HowToReg color="info" sx={{ mb: 0.5 }} />
                      <Typography variant="h6" fontWeight={700}>
                        {totalRegistrations.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('admin.totalRegistrations')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Category color="secondary" />
                  <Typography variant="h6" fontWeight={700}>
                    {t('admin.categoryBreakdown')}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                {dashboard.topCategories.length > 0 ? (
                  dashboard.topCategories.map((item) => {
                    const percent = totalEvents > 0 ? Math.round((item.count / totalEvents) * 100) : 0;
                    return (
                      <Box key={item.category} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {item.category}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.count} ({percent}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          color="secondary"
                          sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover' }}
                        />
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.noCategoryData')}
                  </Typography>
                )}

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <School color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {t('admin.categoryHint')}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <People color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    {t('admin.topOrganizers')}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <List dense>
                  {dashboard.topOrganizers.length > 0 ? (
                    dashboard.topOrganizers.map((org) => (
                      <ListItem key={org.organizerId} disableGutters>
                        <ListItemText
                          primary={org.organizerName}
                          secondary={`${org.eventCount} ${t('admin.events')} · ${org.totalRegistrations} ${t('admin.registrations')}`}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {t('admin.noOrganizerData')}
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <EmojiEvents color="warning" />
                  <Typography variant="h6" fontWeight={700}>
                    {t('admin.popularEvents')}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <List dense>
                  {dashboard.popularEvents.length > 0 ? (
                    dashboard.popularEvents.slice(0, 5).map((evt) => (
                      <ListItem key={evt.eventId} disableGutters>
                        <ListItemText
                          primary={evt.title}
                          secondary={`${evt.registrationCount} ${t('admin.registrations')} · ${evt.viewCount} ${t('admin.views')}`}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {t('admin.noPopularEvents')}
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : null}
    </Container>
  );
};

export default AdminDashboardPage;
