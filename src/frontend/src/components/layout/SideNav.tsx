import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
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
  ChevronLeft,
  ChevronRight,
  QrCodeScanner,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { UserRole } from '@/types';

export const DRAWER_WIDTH = 240;
export const DRAWER_WIDTH_COLLAPSED = 72;

interface SideNavProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ open, collapsed, onClose, onToggleCollapse }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/', roles: [] as UserRole[] },
    { text: 'Events', icon: <Event />, path: '/events', roles: [] as UserRole[] },
    { text: 'Calendar', icon: <CalendarMonth />, path: '/calendar', roles: [] as UserRole[] },
    { text: 'Saved Events', icon: <BookmarkBorder />, path: '/saved', roles: [] as UserRole[] },
    { text: 'My Registrations', icon: <ConfirmationNumber />, path: '/registrations', roles: [] as UserRole[] },
  ];

  const managerItems = [
    {
      text: 'Create Event',
      icon: <AddCircle />,
      path: '/events/create',
      roles: [UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator],
    },
    {
      text: 'My Events',
      icon: <ManageAccounts />,
      path: '/events/manage',
      roles: [UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator],
    },
    {
      text: 'Event QR',
      icon: <QrCode />,
      path: '/organizer-qr',
      roles: [UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator],
    },
    {
      text: 'Attendance Scan',
      icon: <QrCodeScanner />,
      path: '/attendance/scan',
      roles: [UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator],
    },
  ];

  const adminItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin',
      roles: [UserRole.Administrator, UserRole.FacultyManager],
    },
  ];

  const canAccess = (roles: UserRole[]) => {
    if (roles.length === 0) return true;
    return !!user && roles.includes(user.role);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const width = isMobile ? DRAWER_WIDTH : collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;
  const mini = !isMobile && collapsed;

  const renderItem = (item: { text: string; icon: React.ReactNode; path: string; roles: UserRole[] }) => {
    if (!canAccess(item.roles)) return null;

    const selected =
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

    const button = (
      <ListItemButton
        key={item.path}
        selected={selected}
        onClick={() => handleNavigate(item.path)}
        sx={{
          minHeight: 48,
          justifyContent: mini ? 'center' : 'flex-start',
          px: mini ? 1.25 : 2,
          borderRadius: 2,
          mx: 1,
          mb: 0.5,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: mini ? 0 : 2,
            justifyContent: 'center',
            color: selected ? 'primary.main' : 'inherit',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {!mini && <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }} />}
      </ListItemButton>
    );

    return mini ? (
      <Tooltip key={item.path} title={item.text} placement="right">
        {button}
      </Tooltip>
    ) : (
      button
    );
  };

  const drawer = (
    <Box sx={{ pt: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List sx={{ flex: 1, px: 0 }}>{menuItems.map(renderItem)}</List>

      {user &&
        [UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator].includes(user.role) && (
          <>
            <Divider sx={{ my: 1 }} />
            <List>{managerItems.map(renderItem)}</List>
          </>
        )}

      {user && [UserRole.Administrator, UserRole.FacultyManager].includes(user.role) && (
        <>
          <Divider sx={{ my: 1 }} />
          <List>{adminItems.map(renderItem)}</List>
        </>
      )}

      {!isMobile && (
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              sx={{ width: '100%', borderRadius: 2 }}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer anchor="left" open={open} onClose={onClose}>
        <Box sx={{ width: DRAWER_WIDTH }}>{drawer}</Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default SideNav;
