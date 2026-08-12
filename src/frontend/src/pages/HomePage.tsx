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
  IconButton,
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
  ChevronLeft,
  ChevronRight,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [activeSlide, setActiveSlide] = useState(0);

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

  const carouselSlides = useMemo(() => {
    const slides = [
      {
        id: 'svh',
        tag: 'HUFLIT · QUẬN 10',
        title: 'Trụ sở chính Sư Vạn Hạnh — Trung tâm Sự kiện & Hội thảo',
        description: 'Trái tim kết nối các hoạt động phong trào sinh viên, hội thảo khoa học và sự kiện lớn tại HUFLIT.',
        location: '828 Sư Vạn Hạnh, Phường 13, Quận 10, TP.HCM',
        image: '/campus_svh.jpg',
        ctaText: 'Khám phá Sự kiện',
        ctaAction: () => navigate('/events'),
        badgeColor: '#1E5AA8',
      },
      {
        id: 'hocmon',
        tag: 'HUFLIT · HÓC MÔN',
        title: 'Cơ sở Hóc Môn — Không gian Hiện đại & Khuôn viên Xanh',
        description: 'Tổ hợp không gian sáng tạo tích hợp chuỗi hoạt động thể thao, ngoại khóa & workshop kỹ năng.',
        location: 'Đường Tân Xuân 6, Xã Tân Xuân, Huyện Hóc Môn, TP.HCM',
        image: '/campus_hocmon.png',
        ctaText: 'Xem Lịch Sự Kiện',
        ctaAction: () => navigate('/calendar'),
        badgeColor: '#C8102E',
      },
    ];

    if (spotlight) {
      slides.push({
        id: 'spotlight',
        tag: 'SỰ KIỆN NỔI BẬT KHUYÊN DÙNG',
        title: spotlight.title,
        description: `Diễn ra tại ${spotlight.locationName} · Bắt đầu ngày ${formatDate(spotlight.startAt, 'long')}`,
        location: spotlight.locationName,
        image: spotlight.bannerUrl || '/campus_svh.jpg',
        ctaText: t('home.viewDetails'),
        ctaAction: () => navigate(`/events/${spotlight.id}`),
        badgeColor: '#F5C518',
      });
    }

    return slides;
  }, [spotlight, navigate, t]);

  // Auto-advance slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const currentSlide = carouselSlides[activeSlide] || carouselSlides[0];

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
      {/* Hero Campus Carousel Slider */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3.5,
          mb: 5,
          overflow: 'hidden',
          minHeight: { xs: 340, md: 420 },
          color: 'white',
          boxShadow: 5,
          bgcolor: '#0b1220',
        }}
      >
        <AnimatePresence mode="wait">
          <Box
            key={currentSlide.id}
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <Box
              component="img"
              src={currentSlide.image}
              alt={currentSlide.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, rgba(11,18,32,0.95) 0%, rgba(30,90,168,0.75) 55%, rgba(200,16,46,0.3) 100%)',
              }}
            />
          </Box>
        </AnimatePresence>

        {/* Carousel Content overlay */}
        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 2,
            py: { xs: 5, md: 7 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            minHeight: { xs: 340, md: 420 },
          }}
        >
          <Box component={motion.div} key={currentSlide.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Chip
                label={currentSlide.tag}
                size="small"
                sx={{
                  bgcolor: currentSlide.badgeColor,
                  color: currentSlide.badgeColor === '#F5C518' ? '#1a0a0c' : 'white',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: 0.5,
                }}
              />
            </Stack>
            <Typography
              variant="h3"
              component="h1"
              fontWeight={800}
              sx={{ maxWidth: 820, mb: 1.5, lineHeight: 1.15, fontSize: { xs: '1.8rem', md: '2.6rem' } }}
            >
              {currentSlide.title}
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 700, mb: 3, opacity: 0.92, fontWeight: 400 }}>
              {currentSlide.description}
            </Typography>
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={currentSlide.ctaAction}
              sx={{
                bgcolor: 'white',
                color: '#1E5AA8',
                fontWeight: 700,
                px: 3.5,
                py: 1.2,
                borderRadius: 2.5,
                boxShadow: 3,
                fontSize: '0.95rem',
                '&:hover': { bgcolor: '#f8fafc', transform: 'translateY(-1px)' },
              }}
            >
              {currentSlide.ctaText}
            </Button>
          </Box>

          {/* Carousel Arrows & Dots */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              right: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              zIndex: 3,
            }}
          >
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              {carouselSlides.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  sx={{
                    width: activeSlide === idx ? 28 : 10,
                    height: 10,
                    borderRadius: 5,
                    bgcolor: activeSlide === idx ? '#F5C518' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 2, p: 0.5 }}>
              <IconButton size="small" onClick={handlePrevSlide} sx={{ color: 'white' }} aria-label="Slide trước">
                <ChevronLeft fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleNextSlide} sx={{ color: 'white' }} aria-label="Slide tiếp">
                <ChevronRight fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Quick Utility Feature Cards */}
        <Grid container spacing={2.5} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={2.4}>
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
                gap: 1.5,
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-3px)',
                  boxShadow: 4,
                },
              }}
            >
              <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 44, height: 44 }}>
                <CalendarMonth />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {t('calendar.title')}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Lịch sự kiện
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={0}
              onClick={() => navigate('/calendar?tab=timetable')}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                  borderColor: 'info.main',
                  transform: 'translateY(-3px)',
                  boxShadow: 4,
                },
              }}
            >
              <Avatar sx={{ bgcolor: 'info.50', color: 'info.main', width: 44, height: 44 }}>
                <ScheduleIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Thời khóa biểu
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Lịch học & phòng
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
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
                gap: 1.5,
                '&:hover': {
                  borderColor: 'secondary.main',
                  transform: 'translateY(-3px)',
                  boxShadow: 4,
                },
              }}
            >
              <Avatar sx={{ bgcolor: 'secondary.50', color: 'secondary.main', width: 44, height: 44 }}>
                <QrCodeScanner />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Điểm danh QR
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Check-in mã QR
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
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
                gap: 1.5,
                '&:hover': {
                  borderColor: 'success.main',
                  transform: 'translateY(-3px)',
                  boxShadow: 4,
                },
              }}
            >
              <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', width: 44, height: 44 }}>
                <WorkspacePremium />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Chứng nhận
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Tải Certificate
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
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
                gap: 1.5,
                '&:hover': {
                  borderColor: 'warning.main',
                  transform: 'translateY(-3px)',
                  boxShadow: 4,
                },
              }}
            >
              <Avatar sx={{ bgcolor: 'warning.50', color: 'warning.main', width: 44, height: 44 }}>
                <Campaign />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Bảng tin
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Thông báo Khoa
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
