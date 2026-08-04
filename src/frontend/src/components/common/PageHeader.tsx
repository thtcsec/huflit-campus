import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, action }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && (
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
          {breadcrumbs.map((crumb, index) =>
            crumb.path ? (
              <MuiLink key={index} component={Link} to={crumb.path} underline="hover" color="inherit">
                {crumb.label}
              </MuiLink>
            ) : (
              <Typography key={index} color="text.primary">
                {crumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom={!!subtitle}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  );
};

export default PageHeader;
