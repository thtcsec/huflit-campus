import React from 'react';
import { Box, Container, Typography, Link as MuiLink, Stack, IconButton } from '@mui/material';
import { Facebook, LinkedIn, YouTube } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

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
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
              <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                {t('footer.about')}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
              {t('footer.followUs')}
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
              {t('footer.contact')}
            </Typography>
            <Typography fontWeight={600} variant="body2" sx={{ mb: 0.75 }}>
              {t('footer.facultyOffice')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1.5 }}>
              Lầu 2, Khu B, 828 Sư Vạn Hạnh, Phường 13, Quận 10, TP. Hồ Chí Minh
            </Typography>
            <MuiLink
              href="mailto:fit@huflit.edu.vn"
              sx={{ color: '#38bdf8', display: 'block', mb: 0.5, fontWeight: 600 }}
            >
              fit@huflit.edu.vn
            </MuiLink>
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
              Tel: 08 3862 1859
            </Typography>
          </Box>

          <Box>
            <Typography fontWeight={700} sx={{ mb: 1.5 }}>
              {t('footer.links')}
            </Typography>
            <Stack spacing={1}>
              <MuiLink component={Link} to="/events" sx={{ color: '#38bdf8' }}>
                {t('footer.campusEvents')}
              </MuiLink>
              <MuiLink component={Link} to="/calendar" sx={{ color: '#38bdf8' }}>
                {t('footer.eventCalendar')}
              </MuiLink>
              <MuiLink component={Link} to="/login" sx={{ color: '#38bdf8' }}>
                {t('footer.signIn')}
              </MuiLink>
              <MuiLink
                href="https://www.huflit.edu.vn"
                target="_blank"
                rel="noreferrer"
                sx={{ color: '#38bdf8' }}
              >
                {t('footer.huflitWebsite')}
              </MuiLink>
              <MuiLink
                href="https://fit.huflit.edu.vn"
                target="_blank"
                rel="noreferrer"
                sx={{ color: '#38bdf8' }}
              >
                {t('footer.facultyIt')}
              </MuiLink>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
