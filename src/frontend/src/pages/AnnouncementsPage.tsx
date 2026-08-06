import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  PushPin as PushPinIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { announcementsApi } from '@/api';
import { useAuth } from '@/hooks';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import type { Announcement } from '@/types';
import dayjs from 'dayjs';

export const AnnouncementsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canManage =
    user?.role === 'Administrator' ||
    user?.role === 'FacultyManager' ||
    user?.role === 'ClubManager' ||
    user?.role === 'Lecturer';

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementsApi.getAnnouncements();
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      enqueueSnackbar(t('announcements.errorLoad'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle('');
    setBody('');
    setIsPinned(false);
    setOpenModal(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingItem(item);
    setTitle(item.title);
    setBody(item.body);
    setIsPinned(item.isPinned);
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('announcements.confirmDelete'))) return;
    try {
      await announcementsApi.deleteAnnouncement(id);
      enqueueSnackbar(t('announcements.successDelete'), { variant: 'success' });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      enqueueSnackbar(t('announcements.errorDelete'), { variant: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSubmitting(true);
    try {
      if (editingItem) {
        await announcementsApi.updateAnnouncement(editingItem.id, {
          title: title.trim(),
          body: body.trim(),
          isPinned,
        });
        enqueueSnackbar(t('announcements.successUpdate'), { variant: 'success' });
      } else {
        await announcementsApi.createAnnouncement({
          title: title.trim(),
          body: body.trim(),
          isPinned,
        });
        enqueueSnackbar(t('announcements.successCreate'), { variant: 'success' });
      }
      setOpenModal(false);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      enqueueSnackbar(t('announcements.errorSave'), { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0, 114, 63, 0.25)',
            }}
          >
            <CampaignIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {t('announcements.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('announcements.subtitle')}
            </Typography>
          </Box>
        </Box>

        {canManage && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}
          >
            {t('announcements.create')}
          </Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : announcements.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          {t('announcements.empty')}
        </Alert>
      ) : (
        <Stack spacing={3}>
          {announcements.map((item) => (
            <Card
              key={item.id}
              sx={{
                borderRadius: 3,
                boxShadow: item.isPinned ? '0 4px 20px rgba(0, 114, 63, 0.12)' : '0 2px 10px rgba(0,0,0,0.04)',
                border: item.isPinned ? '2px solid' : '1px solid',
                borderColor: item.isPinned ? 'primary.main' : 'divider',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {item.isPinned && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderBottomLeftRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <PushPinIcon fontSize="small" /> {t('announcements.pinned')}
                </Box>
              )}

              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                  <Box pr={item.isPinned ? 12 : 0}>
                    <Typography variant="h6" fontWeight={700} gutterBottom color="text.primary">
                      {item.title}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip
                        icon={<ScheduleIcon fontSize="small" />}
                        label={dayjs(item.publishedAt || item.createdAt).format('DD/MM/YYYY HH:mm')}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1.5 }}
                      />
                    </Stack>
                  </Box>

                  {canManage && (
                    <Box display="flex" gap={1}>
                      <IconButton size="small" color="primary" onClick={() => handleOpenEdit(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>

                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ whitespace: 'pre-line', lineHeight: 1.7 }}
                >
                  {item.body}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Modal Dialog thêm/sửa thông báo */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight={700}>
            {editingItem ? t('announcements.editTitle') : t('announcements.createTitle')}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                label={t('announcements.titleLabel')}
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <TextField
                label={t('announcements.bodyLabel')}
                fullWidth
                required
                multiline
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    color="primary"
                  />
                }
                label={t('announcements.pinLabel')}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} /> : null}
            >
              {editingItem ? t('announcements.submitUpdate') : t('announcements.submitCreate')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default AnnouncementsPage;
