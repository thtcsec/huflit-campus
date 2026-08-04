import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CapacityBarProps {
  current: number;
  max: number;
}

const CapacityBar: React.FC<CapacityBarProps> = ({ current, max }) => {
  const { t } = useTranslation();
  const percentage = (current / max) * 100;
  const color = percentage >= 90 ? 'error' : percentage >= 70 ? 'warning' : 'success';

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t('events.capacity')}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {current} / {max}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={percentage} color={color} sx={{ height: 8, borderRadius: 4 }} />
    </Box>
  );
};

export default CapacityBar;
