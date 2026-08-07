import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Divider,
  Chip,
  Stack,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  AccessTime,
  LocationOn,
  ArrowForward,
  CalendarMonth,
  QrCodeScanner,
  WorkspacePremium,
  Campaign,
  School,
  AutoAwesome,
  EmojiEvents,
  Group,
  CheckCircleOutline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { eventsApi, announcementsApi } from '@/api';
import { EventGrid } from '@/components/events';
import { EventGridSkeleton, StatusChip } from '@/components/common';
import type { HomeFeed, Announcement, EventListItem } from '@/types';
import { formatDate } from '@/utils';

const CATEGORY_ITEMS = [
  { key: 'Academic', label: 'Học thuật', color: '#1E5AA8', icon: <School fontSize="small" /> },
  { key: 'Workshop', label: 'Workshop', color: '#0284C7', icon: <AutoAwesome fontSize="small" /> },
  { key: 'Competition', label: 'Cuộc thi', color: '#C8102E', icon: <EmojiEvents fontSize="small" /> },
  { key: 'Sports', label: 'Thể thao', color: '#16A34A', icon: <Group fontSize="small" /> },
  { key: 'Career', label: 'Tuyển dụng', color: '#D97706', icon: <WorkspacePremium fontSize="small" /> },
];

const pickSpotlight = (feed: HomeFeed | null): EventListItem | null => {
  if (!feed) return null;
  return (
    feed.featured?.[0] ??
    feed.trending?.find((e) => e.isFeatured) ??
    feed.trending?.[0] ??
    feed.upcoming?.[0] ??
    feed.today?.[0] ??
    null
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [feedRes, announcementsRes] = await Promise.all([
          eventsApi.getHomeFeed(),
          announcementsApi.getActiveAnnouncements(),
        ]);
        setFeed(feedRes.data);
        setAnnouncements(announcementsRes.data);
      } catch (error) {
        console.error('Failed to load home feed:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const spotlight = useMemo(() => pickSpotlight(feed), [feed]);

  const section = (title: string, events: EventListItem[], limit: number) => (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          {title}
        </Typography>
        <Button onClick={() => navigate('/events')} endIcon={<ArrowForward />}>
          {t('common.viewAll')}
        </Button>
      </Box>
      <EventGrid events={events.slice(0, limit)} />
    </Box>
  );

  return (
    <Box sx={{ pb: 4 }}>
      {/* Hero Spotlight Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          position: 'relative',
          borderRadius: 3,
          mb: 5,
          overflow: 'hidden',
          minHeight: { xs: 320, md: 380 },
          color: 'white',
          boxShadow: 4,
          background: spotlight?.bannerUrl
            ? undefined
            : 'linear-gradient(120deg, #1E5AA8 0%, #C8102E 60%, #0b1220 100%)',
        }}
      >
        {spotlight?.bannerUrl && (
          <Box
            component="img"
            src={spotlight.bannerUrl}
            alt={spotlight.title}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: spotlight?.bannerUrl
              ? 'linear-gradient(90deg, rgba(11,18,32,0.92) 0%, rgba(30,90,168,0.78) 50%, rgba(200,16,46,0.4) 100%)'
              : 'transparent',
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 1,
            py: { xs: 4, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            minHeight: { xs: 320, md: 380 },
          }}
        >
          {spotlight ? (
            <>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                <Chip
                  label={t('home.spotlight')}
                  size="small"
                  sx={{
                    bgcolor: '#F5C518',
                    color: '#1a0a0c',
                    fontWeight: 800,
                    letterSpacing: 0.4,
                  }}
                />
                <StatusChip status={spotlight.status} size="small" />
              </Stack>
              <Typography
                variant="h3"
                component="h1"
                fontWeight={800}
                sx={{ maxWidth: 780, mb: 1.5, lineHeight: 1.15, fontSize: { xs: '1.8rem', md: '2.5rem' } }}
              >
                {spotlight.title}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, opacity: 0.95 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <LocationOn fontSize="small" />
                  <Typography variant="body1">{spotlight.locationName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <AccessTime fontSize="small" />
                  <Typography variant="body1">{formatDate(spotlight.startAt, 'long')}</Typography>
                </Box>
              </Stack>
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => navigate(`/events/${spotlight.id}`)}
                sx={{
                  alignSelf: 'flex-start',
                  bgcolor: 'white',
                  color: '#1E5AA8',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: 3,
                  '&:hover': { bgcolor: '#f8fafc', transform: 'translateY(-1px)' },
                }}
              >
                {t('home.viewDetails')}
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                {t('home.welcome')}
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, maxWidth: 560, opacity: 0.95 }}>
                {t('home.tagline')}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/events')}
                sx={{
                  alignSelf: 'flex-start',
                  bgcolor: 'white',
                  color: '#1E5AA8',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#f8fafc' },
                }}
              >
                {t('home.noSpotlightExplore')}
              </Button>
            </>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Quick Utility Feature Cards */}
        <Grid container spacing={2.5} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              onClick={() => navigate('/calendar')}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-3px)',
                  boxShadow: 4,
                },
              }}
            >
              <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 48, height: 48 }}>
                <CalendarMonth />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {t('calendar.title')}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Xem lịch sự kiện tháng
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              onClick={() => navigate('/attendance/scan')}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '&:hover': {
                  borderColor: 'secondary.main',
                  transform: 'translateY(-3px)',
                  boxShadow: 4,
                },
              }}
            >
              <Avatar sx={{ bgcolor: 'secondary.50', color: 'secondary.main', width: 48, height: 48 }}>
                <QrCodeScanner />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Điểm danh QR
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Quét mã QR check-in
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              onClick={() => navigate('/registrations')}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '&:hover': {
                  borderColor: 'success.main',
                  transform: 'translateY(-3px)',
                  boxShadow: 4,
                },
              }}
            >
              <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', width: 48, height: 48 }}>
                <WorkspacePremium />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Giấy chứng nhận
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Tải Certificate PDF
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              onClick={() => navigate('/announcements')}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '&:hover': {
                  borderColor: 'warning.main',
                  transform: 'translateY(-3px)',
                  boxShadow: 4,
                },
              }}
            >
              <Avatar sx={{ bgcolor: 'warning.50', color: 'warning.main', width: 48, height: 48 }}>
                <Campaign />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Bảng tin Campus
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Thông báo mới từ Khoa
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Category Filter Pills */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Khám phá theo danh mục
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {CATEGORY_ITEMS.map((item) => (
              <Chip
                key={item.key}
                icon={item.icon}
                label={item.label}
                onClick={() => navigate(`/events?category=${item.key}`)}
                sx={{
                  px: 1.5,
                  py: 2.2,
                  borderRadius: 2.5,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: item.color,
                    color: 'white',
                    borderColor: item.color,
                    '& .MuiChip-icon': { color: 'white' },
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Active Campus Announcements */}
        {announcements.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Campaign color="primary" /> Thông báo Campus nổi bật
            </Typography>
            {announcements.slice(0, 2).map((announcement) => (
              <Box
                key={announcement.id}
                sx={{
                  bgcolor: 'background.paper',
                  p: 2.5,
                  borderRadius: 3,
                  mb: 2,
                  borderLeft: 5,
                  borderColor: 'primary.main',
                  boxShadow: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {announcement.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {announcement.body}
                  </Typography>
                </Box>
                <Button size="small" onClick={() => navigate('/announcements')}>
                  Xem thêm
                </Button>
              </Box>
            ))}
          </Box>
        )}

        {/* Dynamic Event Feed */}
        {loading ? (
          <EventGridSkeleton count={6} />
        ) : (
          <>
            {feed?.today && feed.today.length > 0 && section(t('home.happeningToday'), feed.today, 3)}
            {feed?.trending && feed.trending.length > 0 && section(t('home.trending'), feed.trending, 6)}
            <Divider sx={{ my: 6 }} />
            {feed?.upcoming && feed.upcoming.length > 0 && section(t('home.upcoming'), feed.upcoming, 6)}
            {feed?.recommended &&
              feed.recommended.length > 0 &&
              section(t('home.recommended'), feed.recommended, 3)}
          </>
        )}

        {/* HUFLIT Campus Benefits Banner */}
        <Paper
          elevation={0}
          sx={{
            mt: 8,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            bgcolor: 'primary.50',
            border: 1,
            borderColor: 'primary.200',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h4" fontWeight={800} color="primary.dark" gutterBottom>
                Cùng HUFLIT Campus trải nghiệm sự kiện số hóa
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Nền tảng sinh thái sự kiện số dành riêng cho Sinh viên & Giảng viên Trường Đại học Ngoại ngữ – Tin học TP.HCM.
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleOutline color="primary" />
                  <Typography variant="body2" fontWeight={600}>
                    Tích lũy Điểm Rèn Luyện & Giờ Xã Hội tự động sau khi quét điểm danh QR.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleOutline color="primary" />
                  <Typography variant="body2" fontWeight={600}>
                    Tải Giấy chứng nhận (Certificate PDF) chính thức từ Khoa CNTT HUFLIT.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleOutline color="primary" />
                  <Typography variant="body2" fontWeight={600}>
                    Cập nhật thông báo sự kiện theo thời gian thực qua SignalR & Email.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 4,
                  borderRadius: 3,
                  boxShadow: 3,
                  display: 'inline-block',
                  maxWidth: 320,
                }}
              >
                <WorkspacePremium sx={{ fontSize: 64, color: '#1E5AA8', mb: 1 }} />
                <Typography variant="h6" fontWeight={700}>
                  HUFLIT Campus EMS
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Khoa Công nghệ Thông tin
                </Typography>
                <Button variant="contained" fullWidth onClick={() => navigate('/events')}>
                  Khám phá ngay
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
