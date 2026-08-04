import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { eventsApi } from '@/api';
import { PageHeader } from '@/components/common';
import { EventCategory, CreateEventRequest } from '@/types';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (field: keyof CreateEventRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await eventsApi.createEvent(formData);
      enqueueSnackbar('Event created successfully', { variant: 'success' });
      navigate(`/events/${data.id}`);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to create event', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Create Event"
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Events', path: '/events' }, { label: 'Create Event' }]}
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
                  {loading ? 'Creating...' : 'Create Event'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateEventPage;
