import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  MenuItem,
  Grid,
} from '@mui/material';
import { QrCode2, Refresh } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import QRCode from 'react-qr-code';
import { attendanceApi, eventsApi } from '@/api';
import { PageHeader } from '@/components/common';
import { EventListItem, QrPayload } from '@/types';

const OrganizerQrPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [qrData, setQrData] = useState<QrPayload | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data } = await eventsApi.searchEvents({ organizerId: 'me' });
        setEvents(data);
      } catch (error: any) {
        enqueueSnackbar(error.response?.data?.message || 'Failed to load events', { variant: 'error' });
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (!qrData) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(qrData.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setQrData(null);
        enqueueSnackbar('QR code expired', { variant: 'warning' });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData]);

  const generateQr = async () => {
    if (!selectedEventId) {
      enqueueSnackbar('Please select an event', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const { data } = await attendanceApi.generateQr(selectedEventId, 30, true);
      setQrData(data);
      enqueueSnackbar('QR code generated', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to generate QR code', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="md">
      <PageHeader
        title="Event QR Code Generator"
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Organizer QR' }]}
      />

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Select Event
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Generate a QR code for attendees to check in at your event
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Event"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.title} - {new Date(event.startAt).toLocaleDateString()}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={qrData ? <Refresh /> : <QrCode2 />}
              onClick={generateQr}
              disabled={loading || !selectedEventId}
            >
              {qrData ? 'Regenerate QR Code' : 'Generate QR Code'}
            </Button>
          </Grid>
        </Grid>

        {qrData && (
          <Box sx={{ mt: 4 }}>
            <Card sx={{ bgcolor: 'background.default' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'inline-block',
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <QRCode
                    value={JSON.stringify({
                      eventId: qrData.eventId,
                      token: qrData.token,
                    })}
                    size={256}
                  />
                </Box>

                <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
                  {formatTime(timeRemaining)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time Remaining
                </Typography>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Instructions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    1. Display this QR code at your event entrance
                    <br />
                    2. Attendees scan the code to check in
                    <br />
                    3. QR code expires in 30 seconds for security
                    <br />
                    4. Click "Regenerate" to create a new code
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Sequence: {qrData.sequence}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default OrganizerQrPage;
