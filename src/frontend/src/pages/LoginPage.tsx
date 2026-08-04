import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Button, TextField, Divider, CircularProgress } from '@mui/material';
import { Microsoft } from '@mui/icons-material';
import { useAuth } from '@/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/api';
import { useSnackbar } from 'notistack';
import type { MicrosoftLoginRequest } from '@/types';

const LoginPage: React.FC = () => {
  const { login, loginGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [guestEmail, setGuestEmail] = useState('');
  const [guestOtp, setGuestOtp] = useState('');
  const [guestName, setGuestName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    try {
      const mockPayload: MicrosoftLoginRequest = {
        idToken: 'mock-id-token',
        email: 'user@student.huflit.edu.vn',
        fullName: 'Test User',
        externalId: 'mock-external-id',
        studentId: '2021600123',
        faculty: 'Information Technology',
        major: 'Software Engineering',
      };
      await login(mockPayload);
      enqueueSnackbar('Login successful', { variant: 'success' });
      navigate(from, { replace: true });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Login failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestOtpRequest = async () => {
    if (!guestEmail || !guestEmail.includes('@')) {
      enqueueSnackbar('Please enter a valid email', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      await authApi.requestGuestOtp({ email: guestEmail });
      setOtpSent(true);
      enqueueSnackbar('OTP sent to your email', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to send OTP', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestVerify = async () => {
    if (!guestOtp || !guestEmail) {
      enqueueSnackbar('Please enter OTP code', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      await loginGuest({ email: guestEmail, code: guestOtp, fullName: guestName || undefined });
      enqueueSnackbar('Login successful', { variant: 'success' });
      navigate(from, { replace: true });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Invalid OTP', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #C8102E 0%, #1B7A4E 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box component="img" src="/fit-huflit.png" alt="HUFLIT" sx={{ height: 60, mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              HUFLIT Campus
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access events and more
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Microsoft />}
            onClick={handleMicrosoftLogin}
            disabled={loading}
            sx={{ mb: 3, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign in with Microsoft'}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Typography variant="h6" gutterBottom>
            Guest Login
          </Typography>

          {!otpSent ? (
            <Box>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGuestOtpRequest}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Request OTP'}
              </Button>
            </Box>
          ) : (
            <Box>
              <TextField
                fullWidth
                label="Full Name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="OTP Code"
                value={guestOtp}
                onChange={(e) => setGuestOtp(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleGuestVerify}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify & Login'}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => setOtpSent(false)}
                sx={{ mt: 1 }}
              >
                Back
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
