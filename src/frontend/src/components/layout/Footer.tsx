import React from 'react';
import { Box, Container, Typography, Link as MuiLink, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 8, borderTop: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              HUFLIT Campus
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Event Management System for HUFLIT University
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink component={Link} to="/events" color="text.secondary" underline="hover">
                Events
              </MuiLink>
              <MuiLink component={Link} to="/calendar" color="text.secondary" underline="hover">
                Calendar
              </MuiLink>
              <MuiLink component={Link} to="/about" color="text.secondary" underline="hover">
                About
              </MuiLink>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink href="#" color="text.secondary" underline="hover">
                Help Center
              </MuiLink>
              <MuiLink href="#" color="text.secondary" underline="hover">
                Contact Us
              </MuiLink>
              <MuiLink href="#" color="text.secondary" underline="hover">
                FAQs
              </MuiLink>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink href="#" color="text.secondary" underline="hover">
                Privacy Policy
              </MuiLink>
              <MuiLink href="#" color="text.secondary" underline="hover">
                Terms of Service
              </MuiLink>
            </Box>
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} HUFLIT University. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
