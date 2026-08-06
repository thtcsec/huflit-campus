import React, { useState } from 'react';
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
} from '@mui/material';
import { Star, Send } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/hooks';

interface FeedbackItem {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface EventFeedbackSectionProps {
  eventId: string;
  isCompleted: boolean;
  isAttended: boolean;
}

export const EventFeedbackSection: React.FC<EventFeedbackSectionProps> = ({
  eventId,
  isCompleted,
  isAttended,
}) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Mock initial feedback data for interactive display
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: 'fb-1',
      userName: 'Nguyễn Văn Minh',
      rating: 5,
      comment: 'Sự kiện rất bổ ích, diễn giả chia sẻ chi tiết và nhiệt tình! Rất mong Khoa tổ chức thêm nhiều workshop như thế này.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'fb-2',
      userName: 'Trần Thị Mai',
      rating: 4,
      comment: 'Nội dung hay, khâu check-in bằng QR code rất nhanh và tiện lợi.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
      : '5.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      enqueueSnackbar('Vui lòng chọn số sao đánh giá', { variant: 'warning' });
      return;
    }
    if (!comment.trim()) {
      enqueueSnackbar('Vui lòng nhập lời nhận xét', { variant: 'warning' });
      return;
    }

    const newFb: FeedbackItem = {
      id: `fb-${Date.now()}`,
      userName: user?.fullName || 'Sinh viên HUFLIT',
      userAvatar: user?.avatarUrl,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    setFeedbacks([newFb, ...feedbacks]);
    setComment('');
    setHasSubmitted(true);
    enqueueSnackbar(t('events.feedbackSuccess'), { variant: 'success' });
  };

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" fontWeight={600}>
          {t('events.feedbackTitle')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star sx={{ color: '#faaf00' }} />
          <Typography variant="h6" fontWeight={700}>
            {avgRating}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({feedbacks.length} đánh giá)
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Rating submission form for attendees */}
      {isAuthenticated && (isAttended || isCompleted) && !hasSubmitted ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 2.5, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Đánh giá của bạn về sự kiện này
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              precision={1}
              size="large"
            />
            {rating && (
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {rating} / 5 sao
              </Typography>
            )}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Chia sẻ cảm nghĩ, ý kiến đóng góp của bạn về sự kiện..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<Send />}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {t('events.feedbackSubmit')}
          </Button>
        </Box>
      ) : hasSubmitted ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Cảm ơn bạn đã đóng góp ý kiến đánh giá cho sự kiện này!
        </Alert>
      ) : null}

      {/* Review List */}
      <List disablePadding>
        {feedbacks.map((fb) => (
          <React.Fragment key={fb.id}>
            <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
              <ListItemAvatar>
                <Avatar src={fb.userAvatar} alt={fb.userName}>
                  {fb.userName.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {fb.userName}
                    </Typography>
                    <Rating value={fb.rating} readOnly size="small" />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                      {fb.comment}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default EventFeedbackSection;
