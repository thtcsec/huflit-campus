import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const BootSplash: React.FC = () => (
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
    <Box
      component="img"
      src="/fit-huflit.png"
      alt="HUFLIT"
      sx={{ height: 56, mb: 1 }}
    />
    <CircularProgress size={32} sx={{ color: '#C8102E' }} />
    <Typography variant="body2" color="text.secondary">
      Loading HUFLIT Campus…
    </Typography>
  </Box>
);

export default BootSplash;
