import React from 'react';
import { Box, useTheme } from '@mui/material';

interface HuflitLogoProps {
  height?: number | { xs?: number; sm?: number; md?: number };
  onClick?: () => void;
}

export const HuflitLogo: React.FC<HuflitLogoProps> = ({ height = 40, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        px: isDark ? 1.5 : 0,
        py: isDark ? 0.6 : 0,
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(255, 255, 255, 0.96)' : 'transparent',
        boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick
          ? {
              transform: 'translateY(-1px)',
              boxShadow: isDark ? '0 6px 16px rgba(0, 0, 0, 0.4)' : 'none',
            }
          : {},
      }}
    >
      <Box
        component="img"
        src="/fit-huflit.png"
        alt="HUFLIT Faculty of IT"
        sx={{
          height,
          width: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  );
};

export default HuflitLogo;
