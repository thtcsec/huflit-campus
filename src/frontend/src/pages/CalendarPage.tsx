import React from 'react';
import { Container, Typography } from '@mui/material';
import { PageHeader } from '@/components/common';

const CalendarPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Calendar"
        subtitle="View all events in calendar format"
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Calendar' }]}
      />
      <Typography variant="body1" color="text.secondary">
        Calendar view implementation in progress.
      </Typography>
    </Container>
  );
};

export default CalendarPage;
