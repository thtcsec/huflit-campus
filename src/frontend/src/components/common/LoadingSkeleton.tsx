import React from 'react';
import { Skeleton, Card, CardContent, Box, Grid } from '@mui/material';

export const EventCardSkeleton: React.FC = () => (
  <Card>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="40%" />
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="70%" />
      </Box>
    </CardContent>
  </Card>
);

export const EventGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <EventCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <Box>
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} sx={{ mb: 2 }}>
        <Skeleton variant="rectangular" height={100} sx={{ mb: 1, borderRadius: 2 }} />
      </Box>
    ))}
  </Box>
);
