import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { getTimeUntil } from '@/utils';

interface CountdownProps {
  targetDate: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntil(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Event has started
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {timeLeft.days > 0 && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700}>
            {timeLeft.days}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            days
          </Typography>
        </Box>
      )}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700}>
          {String(timeLeft.hours).padStart(2, '0')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          hours
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight={700}>
        :
      </Typography>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700}>
          {String(timeLeft.minutes).padStart(2, '0')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          mins
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight={700}>
        :
      </Typography>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700}>
          {String(timeLeft.seconds).padStart(2, '0')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          secs
        </Typography>
      </Box>
    </Box>
  );
};

export default Countdown;
