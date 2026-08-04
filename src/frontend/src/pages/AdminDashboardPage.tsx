import React from 'react';
import { Container, Box, Typography, Card, CardContent, Grid, Paper } from '@mui/material';
import { PageHeader } from '@/components/common';
import { motion } from 'framer-motion';

const AdminDashboardPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Admin Dashboard"
        subtitle="System overview and analytics"
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Dashboard' }]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card component={motion.div} whileHover={{ scale: 1.02 }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="primary">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
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
                Total Events
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
                Total Registrations
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
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dashboard analytics implementation in progress. Connect to backend APIs for real-time data.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AdminDashboardPage;
