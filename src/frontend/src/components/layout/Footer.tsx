import React from 'react';
import { Box, Container, Typography, Link as MuiLink, Stack, IconButton } from '@mui/material';
import { Facebook, LinkedIn, YouTube } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0b1220',
        color: '#e2e8f0',
        pt: 6,
        pb: 4,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.3fr 1.1fr 0.9fr' },
            gap: { xs: 4, md: 6 },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 800,
                fontSize: '1.5rem',
                mb: 1.5,
              }}
            >
              fit<span style={{ color: '#F5C518' }}>@</span>huflit
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, maxWidth: 360 }}>
              © {new Date().getFullYear()} Faculty of Information Technology, HUFLIT — Ho Chi Minh
              City University of Foreign Languages – Information Technology.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
              <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                Campus Event Management System
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
              Follow us
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" sx={{ color: '#fff' }} aria-label="Facebook">
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#fff' }} aria-label="LinkedIn">
                <LinkedIn fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#fff' }} aria-label="YouTube">
                <YouTube fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          <Box>
            <Typography fontWeight={700} sx={{ mb: 1.5 }}>
              Contact information
            </Typography>
            <Typography fontWeight={600} variant="body2" sx={{ mb: 0.75 }}>
              Faculty Office
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 0.5 }}>
              828 Sư Vạn Hạnh, Phường 12, Quận 10, TP. Hồ Chí Minh
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1.5 }}>
              69/68 Đặng Thùy Trâm, Bình Thạnh, TP. Hồ Chí Minh
            </Typography>
            <MuiLink
              href="mailto:fit@huflit.edu.vn"
              sx={{ color: '#38bdf8', display: 'block', mb: 0.5, fontWeight: 600 }}
            >
              fit@huflit.edu.vn
            </MuiLink>
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
              Tel: (028) 3863 2052
            </Typography>
          </Box>

          <Box>
            <Typography fontWeight={700} sx={{ mb: 1.5 }}>
              Links
            </Typography>
            <Stack spacing={1}>
              <MuiLink component={Link} to="/events" sx={{ color: '#38bdf8' }}>
                Campus events
              </MuiLink>
              <MuiLink component={Link} to="/calendar" sx={{ color: '#38bdf8' }}>
                Event calendar
              </MuiLink>
              <MuiLink component={Link} to="/login" sx={{ color: '#38bdf8' }}>
                Sign in
              </MuiLink>
              <MuiLink
                href="https://www.huflit.edu.vn"
                target="_blank"
                rel="noreferrer"
                sx={{ color: '#38bdf8' }}
              >
                HUFLIT website
              </MuiLink>
              <MuiLink
                href="https://fit.huflit.edu.vn"
                target="_blank"
                rel="noreferrer"
                sx={{ color: '#38bdf8' }}
              >
                Faculty of IT
              </MuiLink>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
