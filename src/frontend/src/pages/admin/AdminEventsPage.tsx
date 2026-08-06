import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { CheckCircle, Cancel, Visibility, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '@/api';
import { unwrapPaged } from '@/types/paging';
import type { EventListItem } from '@/types';
import { formatDateTime } from '@/utils';

export const AdminEventsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data } = await eventsApi.searchEvents({});
      setEvents(unwrapPaged<EventListItem>(data));
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await eventsApi.approveEvent(id);
      enqueueSnackbar('Đã duyệt sự kiện thành công!', { variant: 'success' });
      void loadEvents();
    } catch (err) {
      enqueueSnackbar('Duyệt sự kiện thất bại', { variant: 'error' });
    }
  };

  const filteredEvents = events.filter((e) => {
    switch (activeTab) {
      case 1:
        return e.status === 'PendingApproval';
      case 2:
        return e.status === 'Approved' || e.status === 'Published';
      case 3:
        return e.status === 'Draft';
      case 4:
        return e.status === 'Completed';
      default:
        return true;
    }
  });

  return (
    <Container maxWidth="xl" disableGutters>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>
          Quản lý Sự kiện Hệ thống (Events Management)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Duyệt bài, theo dõi và quản lý toàn bộ các sự kiện campus do Giảng viên & Ban Chủ nhiệm CLB đăng ký.
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label={`Tất cả (${events.length})`} />
          <Tab label={`Chờ duyệt (${events.filter((e) => e.status === 'PendingApproval').length})`} />
          <Tab label={`Đã duyệt & Đang chạy`} />
          <Tab label={`Bản nháp (Draft)`} />
          <Tab label={`Đã hoàn tất`} />
        </Tabs>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>TÊN SỰ KIỆN</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>DANH MỤC</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>THỜI GIAN</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>SỨC CHỨA</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>TRẠNG THÁI</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>THAO TÁC</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.map((evt) => (
              <TableRow key={evt.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {evt.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {evt.organizerName || 'HUFLIT Organizer'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={evt.category} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {formatDateTime(evt.startAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {evt.registrationCount || 0} / {evt.capacity}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={evt.status}
                    color={
                      evt.status === 'Approved' || evt.status === 'Published'
                        ? 'success'
                        : evt.status === 'PendingApproval'
                        ? 'warning'
                        : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Xem chi tiết">
                    <IconButton onClick={() => navigate(`/events/${evt.id}`)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>

                  {evt.status === 'PendingApproval' && (
                    <Tooltip title="Duyệt sự kiện này">
                      <IconButton color="success" onClick={() => void handleApprove(evt.id)}>
                        <CheckCircle />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminEventsPage;
