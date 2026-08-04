import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Typography, Button, Divider, Chip, Stack } from '@mui/material';
import { AccessTime, LocationOn, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { eventsApi, announcementsApi } from '@/api';
import { EventGrid } from '@/components/events';
import { EventGridSkeleton, StatusChip } from '@/components/common';
import type { HomeFeed, Announcement, EventListItem } from '@/types';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils';

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
        <Button onClick={() => navigate('/events')}>{t('common.viewAll')}</Button>
      </Box>
      <EventGrid events={events.slice(0, limit)} />
    </Box>
  );

  return (
    <Box>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          position: 'relative',
          borderRadius: 3,
          mb: 6,
          overflow: 'hidden',
          minHeight: { xs: 280, md: 340 },
          color: 'white',
          background: spotlight?.bannerUrl
            ? undefined
            : 'linear-gradient(120deg, #C8102E 0%, #7a0a1c 55%, #1a0a0c 100%)',
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
              ? 'linear-gradient(90deg, rgba(122,10,28,0.92) 0%, rgba(200,16,46,0.72) 45%, rgba(26,10,12,0.35) 100%)'
              : 'transparent',
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 1,
            py: { xs: 5, md: 7 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            minHeight: { xs: 280, md: 340 },
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
                sx={{ maxWidth: 720, mb: 1.5, lineHeight: 1.15 }}
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
                  color: '#C8102E',
                  fontWeight: 700,
                  px: 3,
                  '&:hover': { bgcolor: '#f5f5f5' },
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
                  color: '#C8102E',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                {t('home.noSpotlightExplore')}
              </Button>
            </>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg">
        {announcements.length > 0 && (
          <Box sx={{ mb: 6 }}>
            {announcements.map((announcement) => (
              <Box
                key={announcement.id}
                sx={{
                  bgcolor: 'info.lighter',
                  p: 2,
                  borderRadius: 2,
                  mb: 2,
                  borderLeft: 4,
                  borderColor: 'info.main',
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {announcement.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {announcement.body}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

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
      </Container>
    </Box>
  );
};

export default HomePage;
