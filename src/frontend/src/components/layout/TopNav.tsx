import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
  Typography,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Menu as MenuIcon,
  MenuOpen,
  PersonOutline,
  DashboardOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth, useNotifications } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog, LanguageSwitcher, HuflitLogo } from '@/components/common';
import { UserRole } from '@/types';
import ThemeToggle from './ThemeToggle';
import NotificationPopover from './NotificationPopover';

interface TopNavProps {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuClick, sidebarCollapsed = false }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = React.useState<null | HTMLElement>(null);
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const menuTooltip = isMobile
    ? t('nav.openMenu')
    : sidebarCollapsed
      ? t('nav.expandSidebar')
      : t('nav.collapseSidebar');

  const canAdmin =
    !!user &&
    [UserRole.Administrator, UserRole.FacultyManager].includes(user.role);

  const closeMenu = () => setAnchorEl(null);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        zIndex: (z) => z.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ gap: 0.5 }}>
        <Tooltip title={menuTooltip}>
          <IconButton edge="start" color="inherit" onClick={onMenuClick} aria-label={menuTooltip}>
            {isMobile || sidebarCollapsed ? <MenuIcon /> : <MenuOpen />}
          </IconButton>
        </Tooltip>

        <HuflitLogo height={38} onClick={() => navigate('/')} />

        <Box sx={{ flexGrow: 1 }} />

        <LanguageSwitcher />
        <ThemeToggle />

        <Tooltip title={t('nav.notifications')}>
          <IconButton
            color="inherit"
            onClick={(e) => setNotifAnchorEl(e.currentTarget)}
            aria-label={t('nav.notifications')}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <NotificationPopover
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={() => setNotifAnchorEl(null)}
        />

        <IconButton
          edge="end"
          color="inherit"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label={t('common.profile')}
        >
          {user?.avatarUrl ? (
            <Avatar src={user.avatarUrl} alt={user.fullName} sx={{ width: 32, height: 32 }} />
          ) : (
            <AccountCircle />
          )}
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { minWidth: 240, mt: 1 } }}
        >
          {user && (
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {user.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {user.email}
              </Typography>
            </Box>
          )}
          <Divider />
          {canAdmin && (
            <MenuItem
              onClick={() => {
                navigate('/admin');
                closeMenu();
              }}
            >
              <ListItemIcon>
                <DashboardOutlined fontSize="small" />
              </ListItemIcon>
              {t('nav.adminDashboard')}
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              navigate('/profile');
              closeMenu();
            }}
          >
            <ListItemIcon>
              <PersonOutline fontSize="small" />
            </ListItemIcon>
            {t('nav.viewProfile')}
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              closeMenu();
              setLogoutOpen(true);
            }}
          >
            <ListItemIcon>
              <LogoutOutlined fontSize="small" />
            </ListItemIcon>
            {t('common.logout')}
          </MenuItem>
        </Menu>

        <ConfirmDialog
          open={logoutOpen}
          title={t('auth.logoutTitle')}
          message={t('auth.logoutConfirm')}
          confirmText={t('common.logout')}
          cancelText={t('common.cancel')}
          severity="warning"
          onCancel={() => setLogoutOpen(false)}
          onConfirm={async () => {
            setLogoutOpen(false);
            await logout();
            navigate('/login');
          }}
        />
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
