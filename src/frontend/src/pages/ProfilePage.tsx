import React from 'react';
import { Container, Box, Paper, Avatar, Typography, Grid, Chip, Divider } from '@mui/material';
import { PageHeader } from '@/components/common';
import { useAuth } from '@/hooks';
import { formatDate } from '@/utils';
import { Email, School, Person, Badge } from '@mui/icons-material';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader title="Profile" subtitle="Manage your account and preferences" breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Profile' }]} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={user.avatarUrl}
              alt={user.fullName}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {user.fullName}
            </Typography>
            <Chip label={user.role} color="primary" sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Member since {formatDate(user.createdAt)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Email color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {user.email}
                </Typography>
              </Box>
            </Box>

            {user.studentId && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Badge color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Student ID
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {user.studentId}
                  </Typography>
                </Box>
              </Box>
            )}

            {user.faculty && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <School color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Faculty
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {user.faculty}
                  </Typography>
                </Box>
              </Box>
            )}

            {user.major && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Person color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Major
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {user.major}
                  </Typography>
                </Box>
              </Box>
            )}

            {user.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Person color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {user.phone}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Account Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Auth Provider
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {user.authProvider}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip label={user.isActive ? 'Active' : 'Inactive'} size="small" color={user.isActive ? 'success' : 'default'} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                FCM Token
              </Typography>
              <Chip label={user.hasFcmToken ? 'Connected' : 'Not Connected'} size="small" color={user.hasFcmToken ? 'success' : 'default'} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
