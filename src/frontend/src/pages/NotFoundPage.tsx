import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography variant="h1" fontWeight={800} color="primary" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
