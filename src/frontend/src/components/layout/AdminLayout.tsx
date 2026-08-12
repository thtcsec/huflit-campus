import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  People,
  EventNote,
  Category,
  Analytics,
  ChevronLeft,
  Menu as MenuIcon,
  Home,
  ExitToApp,
  AccountCircle,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks';
import HuflitLogo from '@/components/common/HuflitLogo';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { UserRole } from '@/types';

const DRAWER_WIDTH = 260;

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isAdministrator = user?.role === UserRole.Administrator;

  const navItems = [
    ...(isAdministrator
      ? [
          {
            text: t('adminUsers.title'),
            path: '/admin/users',
            icon: <People />,
          },
        ]
      : []),
    {
      text: t('admin.manageEventsNav'),
      path: '/admin/events',
      icon: <EventNote />,
    },
    {
      text: t('admin.categoriesNav'),
      path: '/admin/categories',
      icon: <Category />,
    },
    {
      text: t('admin.title'),
      path: '/admin/analytics',
      icon: <Analytics />,
    },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0D1B2A', color: '#ffffff' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HuflitLogo height={32} />
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#ffffff', letterSpacing: 1 }}>
            {t('admin.brandShort')}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Admin Nav List */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? '#1E5AA8' : 'transparent',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    bgcolor: active ? '#1E5AA8' : 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: active ? '#ffffff' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Return to Public App Portal */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => navigate('/')}
          sx={{
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#ffffff',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <ListItemIcon sx={{ color: '#ffffff', minWidth: 40 }}>
            <Home />
          </ListItemIcon>
          <ListItemText
            primary={t('admin.backToPublic')}
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={700} noWrap>
            {t('admin.workspaceTitle')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LanguageSwitcher />
            <ThemeToggle />

            <Chip
              label={user?.role ? t(`roles.${user.role}`, { defaultValue: user.role }) : t('roles.Administrator')}
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar src={user?.avatarUrl} alt={user?.fullName}>
                {user?.fullName?.charAt(0) || <AccountCircle />}
              </Avatar>
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  logout();
                  navigate('/login');
                }}
              >
                <ListItemIcon>
                  <ExitToApp fontSize="small" />
                </ListItemIcon>
                {t('admin.logoutAdmin')}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawers */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Workspace Body */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
