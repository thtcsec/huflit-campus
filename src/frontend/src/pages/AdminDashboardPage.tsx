import React from 'react';
import { Container, Typography, Card, CardContent, Grid, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common';
import { motion } from 'framer-motion';

const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={t('admin.title')}
        subtitle={t('admin.subtitle')}
        breadcrumbs={[{ label: t('common.home'), path: '/' }, { label: t('nav.dashboard') }]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card component={motion.div} whileHover={{ scale: 1.02 }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="primary">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('admin.totalUsers')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card component={motion.div} whileHover={{ scale: 1.02 }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="success.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('admin.totalEvents')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card component={motion.div} whileHover={{ scale: 1.02 }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="info.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('admin.totalRegistrations')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card component={motion.div} whileHover={{ scale: 1.02 }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('admin.pendingApproval')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          {t('admin.comingSoon')}
        </Typography>
      </Paper>
    </Container>
  );
};

export default AdminDashboardPage;
