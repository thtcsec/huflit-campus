import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Menu as MenuIcon,
  MenuOpen,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth, useNotifications } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/common';
import ThemeToggle from './ThemeToggle';

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

  const menuTooltip = isMobile
    ? t('nav.openMenu')
    : sidebarCollapsed
      ? t('nav.expandSidebar')
      : t('nav.collapseSidebar');

  return (
    <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Tooltip title={menuTooltip}>
          <IconButton edge="start" color="inherit" onClick={onMenuClick} aria-label={menuTooltip} sx={{ mr: 1 }}>
            {isMobile || sidebarCollapsed ? <MenuIcon /> : <MenuOpen />}
          </IconButton>
        </Tooltip>

        <Box
          component="img"
          src="/fit-huflit.png"
          alt="HUFLIT"
          sx={{ height: 40, mr: 1.5, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        />

        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          {t('common.appName')}
        </Typography>

        <LanguageSwitcher compact />
        <ThemeToggle />

        <Tooltip title={t('nav.notifications')}>
          <IconButton
            color="inherit"
            onClick={() => navigate('/notifications')}
            sx={{ ml: 0.5 }}
            aria-label={t('nav.notifications')}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <IconButton
          edge="end"
          color="inherit"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ ml: 0.5 }}
          aria-label={t('common.profile')}
        >
          {user?.avatarUrl ? (
            <Avatar src={user.avatarUrl} alt={user.fullName} sx={{ width: 32, height: 32 }} />
          ) : (
            <AccountCircle />
          )}
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => {
              navigate('/profile');
              setAnchorEl(null);
            }}
          >
            {t('common.profile')}
          </MenuItem>
          <MenuItem
            onClick={async () => {
              await logout();
              navigate('/login');
              setAnchorEl(null);
            }}
          >
            {t('common.logout')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
