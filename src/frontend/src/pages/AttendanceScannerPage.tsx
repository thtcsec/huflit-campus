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
import { attendanceApi } from '@/api';
import { PageHeader } from '@/components/common';
import { Attendance } from '@/types';

const AttendanceScannerPage: React.FC = () => {
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
      enqueueSnackbar('Check-in successful', { variant: 'success' });
      setQrData('');
    } catch (error: any) {
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
        title="Attendance Scanner"
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Attendance Scanner' }]}
      />

      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <QrCodeScanner sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Scan QR Code for Check-in
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter the QR code data below to check in attendees
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="QR Code Data"
            placeholder='{"eventId":"...","token":"..."}'
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            onKeyPress={handleKeyPress}
            helperText="Paste the QR code JSON data here"
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
          {loading ? 'Processing...' : 'Check In'}
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
