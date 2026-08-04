import React from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Badge, Avatar, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { Notifications as NotificationsIcon, AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth, useNotifications } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

interface TopNavProps {
  onMenuClick: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="fixed" color="inherit" elevation={0}>
      <Toolbar>
        {isMobile && (
          <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}
        
        <Box component="img" src="/fit-huflit.png" alt="HUFLIT" sx={{ height: 40, mr: 2 }} />
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          HUFLIT Campus
        </Typography>

        <ThemeToggle />

        <IconButton color="inherit" onClick={() => navigate('/notifications')} sx={{ ml: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <IconButton edge="end" color="inherit" onClick={handleMenu} sx={{ ml: 1 }}>
          {user?.avatarUrl ? (
            <Avatar src={user.avatarUrl} alt={user.fullName} sx={{ width: 32, height: 32 }} />
          ) : (
            <AccountCircle />
          )}
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={handleProfile}>Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
