import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const BootSplash: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        bgcolor: '#f5f7fb',
      }}
    >
      <Box component="img" src="/fit-huflit.png" alt="HUFLIT" sx={{ height: 56, mb: 1 }} />
      <CircularProgress size={32} sx={{ color: '#C8102E' }} />
      <Typography variant="body2" color="text.secondary">
        {t('common.loading')}
      </Typography>
    </Box>
  );
};

export default BootSplash;
