import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { QrCodeScanner, CheckCircle } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { attendanceApi } from '@/api';
import { PageHeader } from '@/components/common';
import { Attendance } from '@/types';

const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio errors
  }
};

const playErrorSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Ignore audio errors
  }
};

const AttendanceScannerPage: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastAttendance, setLastAttendance] = useState<Attendance | null>(null);

  const handleScan = async () => {
    if (!qrData.trim()) {
      enqueueSnackbar('Please enter QR code data', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const parsed = JSON.parse(qrData);
      const { eventId, token } = parsed;

      if (!eventId || !token) {
        throw new Error('Invalid QR code format');
      }

      const { data } = await attendanceApi.checkIn({
        eventId,
        qrToken: token,
        deviceInfo: navigator.userAgent,
      });

      setLastAttendance(data);
      playSuccessSound();
      enqueueSnackbar('Check-in successful!', { variant: 'success' });
      setQrData('');
    } catch (error: any) {
      playErrorSound();
      const message = error.response?.data?.message || error.message || 'Failed to check in';
      enqueueSnackbar(message, { variant: 'error' });
      setLastAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <Container maxWidth="md">
      <PageHeader
        title={t('attendance.title')}
        breadcrumbs={[{ label: t('common.home'), path: '/' }, { label: t('attendance.title') }]}
      />

      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <QrCodeScanner sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {t('attendance.scanTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('attendance.hint')}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('attendance.qrData')}
            placeholder='{"eventId":"...","token":"..."}'
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            onKeyPress={handleKeyPress}
            helperText={t('attendance.helper')}
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<CheckCircle />}
          onClick={handleScan}
          disabled={loading || !qrData.trim()}
        >
          {loading ? t('attendance.processing') : t('attendance.checkIn')}
        </Button>

        {lastAttendance && (
          <Card sx={{ mt: 4, bgcolor: 'success.lighter' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600} color="success.dark">
                    Check-in Successful
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(lastAttendance.scannedAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Attendee:</strong> {lastAttendance.userFullName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Email:</strong> {lastAttendance.userEmail}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Event:</strong> {lastAttendance.eventTitle}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {lastAttendance.status} {lastAttendance.isLate && '(Late)'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>How to use:</strong>
            <br />
            1. Ask attendees to show their QR code
            <br />
            2. Scan or manually enter the QR data
            <br />
            3. Press Enter or click "Check In"
            <br />
            4. Verify the attendee information
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default AttendanceScannerPage;
