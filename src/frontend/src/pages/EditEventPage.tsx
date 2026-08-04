import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '@/api';
import { PageHeader } from '@/components/common';
import { EventCategory, CreateEventRequest, EventDetail } from '@/types';

const EditEventPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    description: '',
    agenda: '',
    bannerUrl: '',
    category: EventCategory.Academic,
    faculty: '',
    locationName: '',
    address: '',
    capacity: 50,
    waitlistEnabled: false,
    maxWaitlist: 10,
    registrationDeadline: '',
    checkInStart: '',
    checkInEnd: '',
    startAt: '',
    endAt: '',
    requirements: '',
    sponsor: '',
    isFeatured: false,
  });

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        const { data } = await eventsApi.getEventById(id);
        const event = data as EventDetail;
        setFormData({
          title: event.title,
          description: event.description,
          agenda: event.agenda || '',
          bannerUrl: event.bannerUrl || '',
          category: event.category,
          faculty: event.faculty || '',
          locationName: event.locationName,
          address: event.address || '',
          capacity: event.capacity,
          waitlistEnabled: event.waitlistEnabled,
          maxWaitlist: event.maxWaitlist,
          registrationDeadline: event.registrationDeadline.slice(0, 16),
          checkInStart: event.checkInStart?.slice(0, 16) || '',
          checkInEnd: event.checkInEnd?.slice(0, 16) || '',
          startAt: event.startAt.slice(0, 16),
          endAt: event.endAt.slice(0, 16),
          requirements: event.requirements || '',
          sponsor: event.sponsor || '',
          isFeatured: event.isFeatured,
        });
      } catch (error: any) {
        enqueueSnackbar(error.response?.data?.message || 'Failed to load event', { variant: 'error' });
        navigate('/events/manage');
      } finally {
        setLoadingEvent(false);
      }
    };
    loadEvent();
  }, [id]);

  const handleChange = (field: keyof CreateEventRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await eventsApi.updateEvent(id, formData);
      enqueueSnackbar('Event updated successfully', { variant: 'success' });
      navigate(`/events/${id}`);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to update event', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingEvent) {
    return (
      <Container maxWidth="lg">
        <Typography>{t('manage.loadingEvent')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={t('createEvent.editTitle')}
        breadcrumbs={[
          { label: t('common.home'), path: '/' },
          { label: t('events.title'), path: '/events' },
          { label: t('manage.title'), path: '/events/manage' },
          { label: t('createEvent.editTitle') },
        ]}
      />

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Event Title"
                value={formData.title}
                onChange={handleChange('title')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                required
                label="Category"
                value={formData.category}
                onChange={handleChange('category')}
              >
                {Object.values(EventCategory).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Faculty"
                value={formData.faculty}
                onChange={handleChange('faculty')}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Location Name"
                value={formData.locationName}
                onChange={handleChange('locationName')}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Capacity"
                value={formData.capacity}
                onChange={handleChange('capacity')}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.waitlistEnabled}
                    onChange={handleChange('waitlistEnabled')}
                  />
                }
                label="Enable Waitlist"
              />
              {formData.waitlistEnabled && (
                <TextField
                  fullWidth
                  type="number"
                  label="Max Waitlist"
                  value={formData.maxWaitlist}
                  onChange={handleChange('maxWaitlist')}
                  inputProps={{ min: 0 }}
                  sx={{ mt: 2 }}
                />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="Start Date & Time"
                value={formData.startAt}
                onChange={handleChange('startAt')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="End Date & Time"
                value={formData.endAt}
                onChange={handleChange('endAt')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="Registration Deadline"
                value={formData.registrationDeadline}
                onChange={handleChange('registrationDeadline')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Banner URL"
                value={formData.bannerUrl}
                onChange={handleChange('bannerUrl')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Agenda"
                value={formData.agenda}
                onChange={handleChange('agenda')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements"
                value={formData.requirements}
                onChange={handleChange('requirements')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sponsor"
                value={formData.sponsor}
                onChange={handleChange('sponsor')}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isFeatured}
                    onChange={handleChange('isFeatured')}
                  />
                }
                label="Featured Event"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditEventPage;
