import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  EmailOutlined,
  MenuBookOutlined,
  Microsoft,
  PersonOutline,
  SchoolOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/hooks';
import { authApi } from '@/api';
import type { MicrosoftLoginRequest } from '@/types';

const LoginPage: React.FC = () => {
  const { login, loginGuest, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [mode, setMode] = useState<'student' | 'lecturer' | 'guest'>('student');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestOtp, setGuestOtp] = useState('');
  const [guestName, setGuestName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  React.useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const handleMicrosoftLogin = async (roleHint: 'student' | 'lecturer') => {
    setLoading(true);
    try {
      const mockPayload: MicrosoftLoginRequest = {
        idToken: 'dev-mock-id-token',
        email:
          roleHint === 'lecturer'
            ? 'lecturer@huflit.edu.vn'
            : 'user@student.huflit.edu.vn',
        fullName: roleHint === 'lecturer' ? 'Demo Lecturer' : 'Demo Student',
        externalId: `mock-${roleHint}-id`,
        studentId: roleHint === 'student' ? '2021600123' : undefined,
        faculty: 'Information Technology',
        major: roleHint === 'student' ? 'Software Engineering' : undefined,
      };
      await login(mockPayload);
      enqueueSnackbar('Signed in successfully', { variant: 'success' });
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string; title?: string } } })?.response?.data
          ?.detail ||
        (error as { response?: { data?: { title?: string } } })?.response?.data?.title ||
        'Microsoft sign-in failed';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestOtpRequest = async () => {
    if (!guestEmail.includes('@')) {
      enqueueSnackbar('Please enter a valid email', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      await authApi.requestGuestOtp({ email: guestEmail });
      setOtpSent(true);
      enqueueSnackbar('OTP sent (check API console in Development)', { variant: 'success' });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to send OTP';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestVerify = async () => {
    if (!guestOtp || !guestEmail) {
      enqueueSnackbar('Enter the OTP code', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      await loginGuest({ email: guestEmail, code: guestOtp, fullName: guestName || undefined });
      enqueueSnackbar('Signed in as guest', { variant: 'success' });
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Invalid OTP';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#eef3f9',
        backgroundImage: `
          radial-gradient(circle at 12% 18%, rgba(200,16,46,0.08) 0 2px, transparent 2px),
          radial-gradient(circle at 88% 72%, rgba(30,90,168,0.1) 0 2px, transparent 2px),
          linear-gradient(118deg, #dce9f8 0%, #dce9f8 46%, #f4f6f8 46%, #f4f6f8 100%)
        `,
        backgroundSize: '28px 28px, 28px 28px, 100% 100%',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', px: { xs: 2, md: 6 }, py: 4 }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1180,
            mx: 'auto',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'center',
          }}
        >
          {/* Brand / hero */}
          <Box
            sx={{
              color: '#1E5AA8',
              textAlign: { xs: 'center', md: 'left' },
              px: { md: 2 },
            }}
          >
            <Box
              component="img"
              src="/fit-huflit.png"
              alt="HUFLIT"
              sx={{ height: { xs: 72, md: 96 }, mb: 3, filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.12))' }}
            />
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 800,
                fontSize: { xs: '2.4rem', md: '3.4rem' },
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: '#C8102E',
              }}
            >
              HUFLIT
            </Typography>
            <Typography
              sx={{
                mt: 1,
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '0.04em',
                color: '#1E5AA8',
              }}
            >
              CAMPUS EMS
            </Typography>
            <Typography
              sx={{
                mt: 2,
                fontWeight: 700,
                letterSpacing: '0.08em',
                fontSize: '0.85rem',
                color: '#1B7A4E',
              }}
            >
              EVENT MANAGEMENT SYSTEM
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                fontWeight: 600,
                letterSpacing: '0.06em',
                fontSize: '0.8rem',
                color: '#334155',
              }}
            >
              FACULTY OF INFORMATION TECHNOLOGY
            </Typography>
          </Box>

          {/* Login card */}
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 4,
              boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)',
              p: { xs: 3, sm: 4 },
              width: '100%',
              maxWidth: 440,
              mx: { xs: 'auto', md: 0 },
              justifySelf: { md: 'end' },
            }}
          >
            <Stack spacing={0.5} sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 800,
                  fontSize: '1.55rem',
                  color: '#0f172a',
                }}
              >
                fit<span style={{ color: '#C8102E' }}>@</span>huflit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ho Chi Minh City University of Foreign Languages – Information Technology
              </Typography>
            </Stack>

            {mode !== 'guest' ? (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Students and lecturers sign in with their Microsoft account. No password form —
                  no Google login.
                </Typography>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Microsoft />}
                  disabled={loading}
                  onClick={() => handleMicrosoftLogin(mode)}
                  sx={{
                    py: 1.35,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: '#1E5AA8',
                    '&:hover': { bgcolor: '#174a8a' },
                  }}
                >
                  Continue with Microsoft
                </Button>
                <MuiLink
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => {
                    setMode('guest');
                    setOtpSent(false);
                  }}
                  sx={{ alignSelf: 'flex-start', fontSize: 14 }}
                >
                  Create guest account
                </MuiLink>
              </Stack>
            ) : (
              <Stack spacing={2}>
                {!otpSent ? (
                  <>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      disabled={loading}
                      onClick={handleGuestOtpRequest}
                      sx={{
                        py: 1.35,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: '#C8102E',
                        '&:hover': { bgcolor: '#a50d25' },
                      }}
                    >
                      {loading ? <CircularProgress size={22} color="inherit" /> : 'Send OTP'}
                    </Button>
                  </>
                ) : (
                  <>
                    <TextField
                      fullWidth
                      label="Full name (optional)"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutline fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="OTP code"
                      type={showOtp ? 'text' : 'password'}
                      value={guestOtp}
                      onChange={(e) => setGuestOtp(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton edge="end" onClick={() => setShowOtp((v) => !v)}>
                              {showOtp ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      disabled={loading}
                      onClick={handleGuestVerify}
                      sx={{
                        py: 1.35,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: '#C8102E',
                        '&:hover': { bgcolor: '#a50d25' },
                      }}
                    >
                      {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify & login'}
                    </Button>
                    <Button fullWidth variant="text" onClick={() => setOtpSent(false)}>
                      Use another email
                    </Button>
                  </>
                )}
                <MuiLink
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => setMode('student')}
                  sx={{ alignSelf: 'flex-start', fontSize: 14 }}
                >
                  Back to Microsoft sign-in
                </MuiLink>
              </Stack>
            )}

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary" letterSpacing={1}>
                OR CONTINUE WITH
              </Typography>
            </Divider>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Button
                variant={mode === 'lecturer' ? 'contained' : 'outlined'}
                startIcon={<SchoolOutlined />}
                onClick={() => setMode('lecturer')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2.5,
                  py: 1.2,
                  fontWeight: 700,
                  ...(mode === 'lecturer'
                    ? { bgcolor: '#1E5AA8', '&:hover': { bgcolor: '#174a8a' } }
                    : { borderColor: '#cbd5e1', color: '#0f172a' }),
                }}
              >
                Lecturer
              </Button>
              <Button
                variant={mode === 'student' ? 'contained' : 'outlined'}
                startIcon={<Microsoft />}
                onClick={() => setMode('student')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2.5,
                  py: 1.2,
                  fontWeight: 700,
                  ...(mode === 'student'
                    ? { bgcolor: '#1E5AA8', '&:hover': { bgcolor: '#174a8a' } }
                    : { borderColor: '#cbd5e1', color: '#0f172a' }),
                }}
              >
                Student
              </Button>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'rgba(30, 90, 168, 0.08)',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                <MenuBookOutlined sx={{ color: '#1E5AA8', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700} color="#1E5AA8">
                  Read user guides
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                {(['Lecturer', 'Student', 'Guest'] as const).map((label) => (
                  <Button
                    key={label}
                    size="small"
                    variant="contained"
                    onClick={() =>
                      setMode(label.toLowerCase() as 'lecturer' | 'student' | 'guest')
                    }
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      bgcolor: '#fff',
                      color: '#1E5AA8',
                      boxShadow: 'none',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#f8fafc', boxShadow: 'none' },
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </Box>

            <Button
              component={Link}
              to="/"
              fullWidth
              sx={{ mt: 2, textTransform: 'none' }}
            >
              Browse events without signing in
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Dark footer strip */}
      <Box sx={{ bgcolor: '#0b1220', color: '#e2e8f0', py: 4, px: { xs: 2, md: 6 } }}>
        <Box
          sx={{
            maxWidth: 1180,
            mx: 'auto',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr' },
            gap: 4,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', mb: 1 }}>
              fit<span style={{ color: '#F5C518' }}>@</span>huflit
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1.5 }}>
              © {new Date().getFullYear()} Faculty of Information Technology, HUFLIT
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
              <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                Campus events platform
              </Typography>
            </Stack>
          </Box>
          <Box>
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Contact
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
              828 Sư Vạn Hạnh, P.12, Q.10, TP.HCM
            </Typography>
            <MuiLink href="mailto:fit@huflit.edu.vn" sx={{ color: '#38bdf8', display: 'block', mt: 0.5 }}>
              fit@huflit.edu.vn
            </MuiLink>
          </Box>
          <Box>
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Links
            </Typography>
            <Stack spacing={0.75}>
              <MuiLink component={Link} to="/" sx={{ color: '#38bdf8' }}>
                Home
              </MuiLink>
              <MuiLink component={Link} to="/events" sx={{ color: '#38bdf8' }}>
                Events
              </MuiLink>
              <MuiLink href="https://www.huflit.edu.vn" target="_blank" rel="noreferrer" sx={{ color: '#38bdf8' }}>
                HUFLIT website
              </MuiLink>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
