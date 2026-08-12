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
  Schedule as ScheduleIcon,
  BookmarkBorder,
  ConfirmationNumber,
  QrCode,
  Dashboard,
  AddCircle,
  ManageAccounts,
  ChevronLeft,
  ChevronRight,
  QrCodeScanner,
  Campaign,
  HelpOutline,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { textKey: 'nav.home', icon: <Home />, path: '/', roles: [] as UserRole[] },
    { textKey: 'nav.events', icon: <Event />, path: '/events', roles: [] as UserRole[] },
    { textKey: 'nav.announcements', icon: <Campaign />, path: '/announcements', roles: [] as UserRole[] },
    { textKey: 'nav.calendar', icon: <CalendarMonth />, path: '/calendar', roles: [] as UserRole[] },
    { textKey: 'nav.timetable', icon: <ScheduleIcon />, path: '/calendar?tab=timetable', roles: [] as UserRole[] },
    { textKey: 'nav.saved', icon: <BookmarkBorder />, path: '/saved', roles: [] as UserRole[] },
    { textKey: 'nav.registrations', icon: <ConfirmationNumber />, path: '/registrations', roles: [] as UserRole[] },
    { textKey: 'nav.userGuide', icon: <HelpOutline />, path: '/user-guide', roles: [] as UserRole[] },
  ];

  const managerItems = [
    {
      textKey: 'nav.createEvent',
      icon: <AddCircle />,
      path: '/events/create',
      roles: [UserRole.Lecturer, UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator],
    },
    {
      textKey: 'nav.manageEvents',
      icon: <ManageAccounts />,
      path: '/events/manage',
      roles: [UserRole.Lecturer, UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator],
    },
    {
      textKey: 'nav.eventQr',
      icon: <QrCode />,
      path: '/organizer-qr',
      roles: [UserRole.Lecturer, UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator],
    },
    {
      textKey: 'nav.attendanceScan',
      icon: <QrCodeScanner />,
      path: '/attendance/scan',
      roles: [UserRole.Lecturer, UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator],
    },
  ];

  const adminItems = [
    {
      textKey: 'nav.dashboard',
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

  const renderItem = (item: {
    textKey: string;
    icon: React.ReactNode;
    path: string;
    roles: UserRole[];
  }) => {
    if (!canAccess(item.roles)) return null;
    const label = t(item.textKey);

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
        {!mini && (
          <ListItemText primary={label} primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }} />
        )}
      </ListItemButton>
    );

    return mini ? (
      <Tooltip key={item.path} title={label} placement="right">
        {button}
      </Tooltip>
    ) : (
      button
    );
  };

  const drawer = (
    <Box sx={{ pt: isMobile ? 10 : 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List sx={{ flex: 1, px: 0 }}>{menuItems.map(renderItem)}</List>

      {user &&
        [UserRole.Lecturer, UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator].includes(user.role) && (
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
          <Tooltip
            title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
            placement="right"
          >
            <IconButton
              onClick={onToggleCollapse}
              aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
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
          top: 64,
          height: 'calc(100% - 64px)',
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
