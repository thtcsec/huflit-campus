import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, useTheme, useMediaQuery } from '@mui/material';
import {
  Home,
  Event,
  CalendarMonth,
  BookmarkBorder,
  ConfirmationNumber,
  QrCode,
  Dashboard,
  AddCircle,
  ManageAccounts,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { UserRole } from '@/types';

interface SideNavProps {
  open: boolean;
  onClose: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/', roles: [] },
    { text: 'Events', icon: <Event />, path: '/events', roles: [] },
    { text: 'Calendar', icon: <CalendarMonth />, path: '/calendar', roles: [] },
    { text: 'Saved Events', icon: <BookmarkBorder />, path: '/saved', roles: [] },
    { text: 'My Registrations', icon: <ConfirmationNumber />, path: '/registrations', roles: [] },
  ];

  const managerItems = [
    { text: 'Create Event', icon: <AddCircle />, path: '/events/create', roles: [UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator] },
    { text: 'My Events', icon: <ManageAccounts />, path: '/events/manage', roles: [UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator] },
    { text: 'Event QR', icon: <QrCode />, path: '/organizer-qr', roles: [UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator] },
  ];

  const adminItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin', roles: [UserRole.Administrator, UserRole.FacultyManager] },
  ];

  const canAccess = (roles: UserRole[]) => {
    if (roles.length === 0) return true;
    return user && roles.includes(user.role);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const drawer = (
    <Box sx={{ pt: 10 }}>
      <List>
        {menuItems.map((item) =>
          canAccess(item.roles) ? (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ) : null
        )}
      </List>

      {user && [UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator].includes(user.role) && (
        <>
          <Divider sx={{ my: 2 }} />
          <List>
            {managerItems.map((item) =>
              canAccess(item.roles) ? (
                <ListItemButton
                  key={item.path}
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ) : null
            )}
          </List>
        </>
      )}

      {user && [UserRole.Administrator, UserRole.FacultyManager].includes(user.role) && (
        <>
          <Divider sx={{ my: 2 }} />
          <List>
            {adminItems.map((item) =>
              canAccess(item.roles) ? (
                <ListItemButton
                  key={item.path}
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ) : null
            )}
          </List>
        </>
      )}
    </Box>
  );

  return isMobile ? (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250 }}>{drawer}</Box>
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default SideNav;
