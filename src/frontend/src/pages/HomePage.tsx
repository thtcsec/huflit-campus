import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Grid, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { eventsApi, announcementsApi } from '@/api';
import { EventGrid } from '@/components/events';
import { EventGridSkeleton } from '@/components/common';
import type { HomeFeed, Announcement } from '@/types';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
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

  return (
    <Box>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{
          background: 'linear-gradient(135deg, #C8102E 0%, #9D0C24 100%)',
          color: 'white',
          py: 12,
          px: 3,
          borderRadius: 4,
          mb: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight={800} gutterBottom>
            Welcome to HUFLIT Campus
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.95 }}>
            Discover and join amazing events happening on campus
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/events')}
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' }, px: 6, py: 1.5 }}
          >
            Explore Events
          </Button>
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
            {feed?.today && feed.today.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" fontWeight={700}>
                    Happening Today
                  </Typography>
                  <Button onClick={() => navigate('/events')}>View All</Button>
                </Box>
                <EventGrid events={feed.today.slice(0, 3)} />
              </Box>
            )}

            {feed?.trending && feed.trending.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" fontWeight={700}>
                    Trending Events
                  </Typography>
                  <Button onClick={() => navigate('/events')}>View All</Button>
                </Box>
                <EventGrid events={feed.trending.slice(0, 6)} />
              </Box>
            )}

            <Divider sx={{ my: 6 }} />

            {feed?.upcoming && feed.upcoming.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" fontWeight={700}>
                    Upcoming Events
                  </Typography>
                  <Button onClick={() => navigate('/events')}>View All</Button>
                </Box>
                <EventGrid events={feed.upcoming.slice(0, 6)} />
              </Box>
            )}

            {feed?.recommended && feed.recommended.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" fontWeight={700}>
                    Recommended For You
                  </Typography>
                  <Button onClick={() => navigate('/events')}>View All</Button>
                </Box>
                <EventGrid events={feed.recommended.slice(0, 3)} />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
