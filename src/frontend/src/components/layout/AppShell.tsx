import React, { useEffect, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import TopNav from './TopNav';
import SideNav, { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from './SideNav';
import Footer from './Footer';

interface AppShellProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'huflit.sidebarCollapsed';

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  const sidebarWidth = isMobile ? 0 : collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <TopNav onMenuClick={handleDrawerToggle} sidebarCollapsed={collapsed} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <SideNav
          open={mobileOpen}
          collapsed={collapsed}
          onClose={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: 10,
            ml: `${sidebarWidth}px`,
            transition: theme.transitions.create('margin-left', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <Box sx={{ flex: 1, px: { xs: 2, md: 3 } }}>{children}</Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
