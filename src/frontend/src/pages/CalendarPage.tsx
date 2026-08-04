import React from 'react';
import { Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common';

const CalendarPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={t('calendar.title')}
        subtitle={t('calendar.subtitle')}
        breadcrumbs={[{ label: t('common.home'), path: '/' }, { label: t('calendar.title') }]}
      />
      <Typography variant="body1" color="text.secondary">
        {t('calendar.comingSoon')}
      </Typography>
    </Container>
  );
};

export default CalendarPage;
