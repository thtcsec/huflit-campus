import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import { Add, MoreVert, Edit, Delete, Send, CheckCircle, Cancel, Publish } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '@/api';
import { PageHeader, StatusChip, CategoryChip, ConfirmDialog, EmptyState } from '@/components/common';
import { EventListItem, EventStatus, EventSearchRequest, UserRole } from '@/types';
import { formatDate } from '@/utils';
import { useAuth } from '@/hooks';

const ManageEventsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventListItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: string; eventId: string }>({
    open: false,
    action: '',
    eventId: '',
  });

  const isManager = user?.role && [UserRole.ClubManager, UserRole.FacultyManager, UserRole.Administrator].includes(user.role);
  const canApprove = user?.role && [UserRole.FacultyManager, UserRole.Administrator].includes(user.role);

  const tabs = canApprove
    ? ['My Events', 'Pending Approval', 'All Events']
    : ['My Events', 'Draft', 'Published'];

  const loadEvents = async () => {
    setLoading(true);
    try {
      let params: EventSearchRequest = {};
      
      if (canApprove) {
        switch (activeTab) {
          case 0:
            params.organizerId = user?.id;
            break;
          case 1:
            params.status = EventStatus.PendingApproval;
            break;
          case 2:
            break;
        }
      } else {
        params.organizerId = user?.id;
        switch (activeTab) {
          case 0:
            break;
          case 1:
            params.status = EventStatus.Draft;
            break;
          case 2:
            params.status = EventStatus.Published;
            break;
        }
      }

      const { data } = await eventsApi.searchEvents(params);
      setEvents(data);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to load events', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [activeTab]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventItem: EventListItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleAction = async (action: string, eventId: string) => {
    try {
      switch (action) {
        case 'submit':
          await eventsApi.submitEvent(eventId);
          enqueueSnackbar('Event submitted for approval', { variant: 'success' });
          break;
        case 'approve':
          await eventsApi.approveEvent(eventId);
          enqueueSnackbar('Event approved', { variant: 'success' });
          break;
        case 'reject':
          await eventsApi.rejectEvent(eventId, 'Rejected by admin');
          enqueueSnackbar('Event rejected', { variant: 'info' });
          break;
        case 'publish':
          await eventsApi.publishEvent(eventId);
          enqueueSnackbar('Event published', { variant: 'success' });
          break;
        case 'cancel':
          await eventsApi.cancelEvent(eventId);
          enqueueSnackbar('Event cancelled', { variant: 'info' });
          break;
        case 'close-registration':
          await eventsApi.closeRegistration(eventId);
          enqueueSnackbar('Registration closed', { variant: 'info' });
          break;
        case 'delete':
          await eventsApi.deleteEvent(eventId);
          enqueueSnackbar('Event deleted', { variant: 'success' });
          break;
      }
      loadEvents();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || `Failed to ${action} event`, { variant: 'error' });
    } finally {
      setConfirmDialog({ open: false, action: '', eventId: '' });
      handleMenuClose();
    }
  };

  const getAvailableActions = (event: EventListItem) => {
    const actions = [];
    const isOwner = event.organizerId === user?.id;

    if (isOwner) {
      if (event.status === EventStatus.Draft) {
        actions.push({ label: 'Edit', icon: <Edit />, action: 'edit' });
        actions.push({ label: 'Submit for Approval', icon: <Send />, action: 'submit' });
        actions.push({ label: 'Delete', icon: <Delete />, action: 'delete', destructive: true });
      } else if (event.status === EventStatus.Approved) {
        actions.push({ label: 'Publish', icon: <Publish />, action: 'publish' });
      } else if (event.status === EventStatus.Published) {
        actions.push({ label: 'Close Registration', icon: <Cancel />, action: 'close-registration' });
        actions.push({ label: 'Cancel Event', icon: <Cancel />, action: 'cancel', destructive: true });
      }
    }

    if (canApprove && event.status === EventStatus.PendingApproval) {
      actions.push({ label: 'Approve', icon: <CheckCircle />, action: 'approve' });
      actions.push({ label: 'Reject', icon: <Cancel />, action: 'reject', destructive: true });
    }

    return actions;
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={t('manage.title')}
        breadcrumbs={[{ label: t('common.home'), path: '/' }, { label: t('manage.title') }]}
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/events/create')}>
            {t('manage.create')}
          </Button>
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          {tabs.map((tab, idx) => (
            <Tab key={idx} label={tab} />
          ))}
        </Tabs>
      </Box>

      {loading ? (
        <Typography>{t('common.loadingShort')}</Typography>
      ) : events.length === 0 ? (
        <EmptyState
          title={t('manage.emptyTitle')}
          description={t('manage.emptyDescription')}
          action={{ label: t('manage.create'), onClick: () => navigate('/events/create') }}
        />
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <Card>
                {event.bannerUrl && (
                  <Box
                    component="img"
                    src={event.bannerUrl}
                    alt={event.title}
                    sx={{ width: '100%', height: 180, objectFit: 'cover' }}
                  />
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <CategoryChip category={event.category} size="small" />
                    <StatusChip status={event.status} size="small" />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formatDate(event.startAt, 'long')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('events.seats', { count: event.registrationCount, capacity: event.capacity })}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button size="small" onClick={() => navigate(`/events/${event.id}`)}>
                    {t('manage.viewDetails')}
                  </Button>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, event)}>
                    <MoreVert />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedEvent &&
          getAvailableActions(selectedEvent).map((action) => (
            <MenuItem
              key={action.action}
              onClick={() => {
                if (action.action === 'edit') {
                  navigate(`/events/${selectedEvent.id}/edit`);
                  handleMenuClose();
                } else if (action.destructive) {
                  setConfirmDialog({ open: true, action: action.action, eventId: selectedEvent.id });
                } else {
                  handleAction(action.action, selectedEvent.id);
                }
              }}
              sx={{ color: action.destructive ? 'error.main' : 'inherit' }}
            >
              {action.icon}
              <Typography sx={{ ml: 1 }}>{action.label}</Typography>
            </MenuItem>
          ))}
      </Menu>

      <ConfirmDialog
        open={confirmDialog.open}
        title={t('manage.confirmTitle')}
        message={t('manage.confirmMessage', { action: confirmDialog.action.replace('-', ' ') })}
        onConfirm={() => handleAction(confirmDialog.action, confirmDialog.eventId)}
        onCancel={() => setConfirmDialog({ open: false, action: '', eventId: '' })}
      />
    </Container>
  );
};

export default ManageEventsPage;
