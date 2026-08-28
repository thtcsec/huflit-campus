import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Star, Send, DeleteOutline, ThumbUpAltOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/hooks';
import { eventsApi } from '@/api/events';
import type { EventFeedback, EventFeedbackSummary } from '@/types';
import { UserRole } from '@/types';

interface EventFeedbackSectionProps {
  eventId: string;
  isCompleted?: boolean;
  isAttended?: boolean;
}

export const EventFeedbackSection: React.FC<EventFeedbackSectionProps> = ({
  eventId,
  isCompleted,
  isAttended,
}) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<EventFeedbackSummary>({
    averageRating: 5.0,
    totalFeedbacks: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    items: [],
  });

  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await eventsApi.getFeedbacks(eventId);
      if (res.data) {
        setSummary(res.data);
        const myFb = res.data.items.find((item) => item.userId === user?.id);
        if (myFb) {
          setRating(myFb.rating);
          setComment(myFb.comment);
          setIsAnonymous(myFb.isAnonymous);
        }
      }
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.id]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      enqueueSnackbar(t('events.feedbackSelectRating') || 'Vui lòng chọn số sao đánh giá', { variant: 'warning' });
      return;
    }
    if (!comment.trim()) {
      enqueueSnackbar(t('events.feedbackEnterComment') || 'Vui lòng nhập lời nhận xét', { variant: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      await eventsApi.submitFeedback(eventId, {
        rating,
        comment: comment.trim(),
        isAnonymous,
      });
      enqueueSnackbar(t('events.feedbackSuccess') || 'Đã gửi đánh giá thành công!', { variant: 'success' });
      await fetchFeedbacks();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Không thể gửi đánh giá';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhận xét này?')) return;
    try {
      await eventsApi.deleteFeedback(eventId, feedbackId);
      enqueueSnackbar('Đã xóa đánh giá', { variant: 'info' });
      await fetchFeedbacks();
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.detail || 'Không thể xóa đánh giá', { variant: 'error' });
    }
  };

  const myExisting = summary.items.find((item) => item.userId === user?.id);

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      {/* Header & Rating Breakdown */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {t('events.feedbackTitle') || 'Đánh giá & Nhận xét'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cảm nhận và phản hồi thực tế từ người tham gia sự kiện.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'action.hover', px: 2.5, py: 1.5, borderRadius: 2 }}>
          <Star sx={{ color: '#faaf00', fontSize: 36 }} />
          <Box>
            <Typography variant="h5" fontWeight={800} lineHeight={1}>
              {summary.averageRating.toFixed(1)} <Typography component="span" variant="body2" color="text.secondary">/ 5</Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {summary.totalFeedbacks} đánh giá
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Star Progress Breakdown */}
      {summary.totalFeedbacks > 0 && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.ratingCounts?.[star] ?? 0;
            const pct = summary.totalFeedbacks > 0 ? (count / summary.totalFeedbacks) * 100 : 0;
            return (
              <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
                <Typography variant="caption" sx={{ width: 30, textAlign: 'right', fontWeight: 600 }}>
                  {star} ★
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    flexGrow: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': { bgcolor: star >= 4 ? 'success.main' : star === 3 ? 'warning.main' : 'error.main' },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ width: 30 }}>
                  {count}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Rating submission form for authenticated users */}
      {isAuthenticated ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 2.5, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            {myExisting ? 'Cập nhật đánh giá của bạn' : 'Gửi đánh giá về sự kiện'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              precision={1}
              size="large"
            />
            {rating && (
              <Typography variant="body2" fontWeight={700} color="primary.main">
                {rating === 5 && 'Tuyệt vời ★★★★★'}
                {rating === 4 && 'Rất tốt ★★★★☆'}
                {rating === 3 && 'Bình thường ★★★☆☆'}
                {rating === 2 && 'Cần cải thiện ★★☆☆☆'}
                {rating === 1 && 'Kém ★☆☆☆☆'}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Chia sẻ cảm nhận của bạn về nội dung, diễn giả, khâu tổ chức..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Đánh giá ẩn danh (không hiện tên)</Typography>}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send />}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              {myExisting ? 'Cập nhật nhận xét' : (t('events.feedbackSubmit') || 'Gửi nhận xét')}
            </Button>
          </Box>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Vui lòng đăng nhập để gửi nhận xét và chấm điểm cho sự kiện này.
        </Alert>
      )}

      {/* Review List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : summary.items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <ThumbUpAltOutlined sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography variant="body1" fontWeight={600}>
            Chưa có nhận xét nào
          </Typography>
          <Typography variant="body2">
            Hãy là người đầu tiên chia sẻ cảm nhận về sự kiện này!
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {summary.items.map((fb) => {
            const canDelete =
              user?.id === fb.userId ||
              user?.role === UserRole.Administrator ||
              user?.role === UserRole.FacultyManager;

            return (
              <React.Fragment key={fb.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ px: 1, py: 2 }}
                  secondaryAction={
                    canDelete && (
                      <Tooltip title="Xóa nhận xét">
                        <IconButton size="small" edge="end" onClick={() => handleDelete(fb.id)}>
                          <DeleteOutline fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={fb.userAvatar} alt={fb.userName} sx={{ bgcolor: 'primary.main' }}>
                      {fb.userName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {fb.userName}
                        </Typography>
                        <Rating value={fb.rating} readOnly size="small" />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.primary" sx={{ mb: 0.5, whiteSpace: 'pre-line' }}>
                          {fb.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(fb.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Paper>
  );
};

export default EventFeedbackSection;
