import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks';
import { UserRole } from '@/types';
import { Box, Typography } from '@mui/material';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: 'navigate' | 'hide' | 'message';
}

const RoleGate: React.FC<RoleGateProps> = ({ children, allowedRoles, fallback = 'navigate' }) => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return fallback === 'navigate' ? <Navigate to="/login" replace /> : null;
  }

  const userRoleStr = String(user.role || '').toLowerCase();
  const isAllowed = allowedRoles.some(
    (role) =>
      role.toLowerCase() === userRoleStr ||
      (userRoleStr === 'admin' && role === UserRole.Administrator) ||
      (userRoleStr === 'administrator' && role === UserRole.Administrator)
  );

  if (!isAllowed) {
    if (fallback === 'navigate') {
      return <Navigate to="/" replace />;
    }
    if (fallback === 'message') {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error">
            {t('access.deniedTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('access.deniedDescription')}
          </Typography>
        </Box>
      );
    }
    return null;
  }

  return <>{children}</>;
};

export default RoleGate;
