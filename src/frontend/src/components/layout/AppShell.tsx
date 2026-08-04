import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import TopNav from './TopNav';
import SideNav from './SideNav';
import Footer from './Footer';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <TopNav onMenuClick={handleDrawerToggle} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <SideNav open={mobileOpen} onClose={handleDrawerToggle} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: 10,
            px: { xs: 2, md: 3 },
            ml: isMobile ? 0 : '240px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flex: 1 }}>{children}</Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
