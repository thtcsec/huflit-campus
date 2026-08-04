import React from 'react';
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { ColorModeContext } from '@/theme/ColorModeContext';

const ThemeToggle: React.FC = () => {
  const { mode, toggleColorMode } = React.useContext(ColorModeContext);

  return (
    <IconButton onClick={toggleColorMode} color="inherit">
      {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
};

export default ThemeToggle;
