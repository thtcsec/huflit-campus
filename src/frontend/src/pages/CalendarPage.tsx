import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Paper,
  Grid,
  Typography,
  IconButton,
  Button,
  Chip,
  Card,
  CardContent,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today as TodayIcon,
  Event as EventIcon,
  CheckCircle,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, CategoryChip, ListSkeleton } from '@/components/common';
import { calendarApi } from '@/api/calendar';
import type { CalendarEvent } from '@/types';
import { formatTime } from '@/utils';

export const CalendarPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysOfWeek = useMemo(() => {
    const locale = i18n.language || 'vi';
    const dates = [
      new Date(2024, 0, 1), // Monday
      new Date(2024, 0, 2),
      new Date(2024, 0, 3),
      new Date(2024, 0, 4),
      new Date(2024, 0, 5),
      new Date(2024, 0, 6),
      new Date(2024, 0, 7), // Sunday
    ];
    return dates.map((d) => d.toLocaleDateString(locale, { weekday: 'short' }));
  }, [i18n.language]);

  const { startIso, endIso, daysInMonth, startDayOfWeek } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Convert JavaScript Sunday-0 to Monday-0 index
    let dayOfWeek = firstDay.getDay() - 1;
    if (dayOfWeek === -1) dayOfWeek = 6;

    return {
      startIso: firstDay.toISOString(),
      endIso: new Date(year, month + 1, 0, 23, 59, 59).toISOString(),
      daysInMonth: lastDay.getDate(),
      startDayOfWeek: dayOfWeek,
    };
  }, [year, month]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    calendarApi
      .getCalendarEvents(startIso, endIso)
      .then(({ data }) => {
        if (alive) setEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load calendar events:', err);
        if (alive) setEvents([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [startIso, endIso]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().getDate());
  };

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    events.forEach((ev) => {
      const day = new Date(ev.startAt).getDate();
      if (!map[day]) map[day] = [];
      map[day].push(ev);
    });
    return map;
  }, [events]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const dayCells = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    return cells;
  }, [startDayOfWeek, daysInMonth]);

  const activeDayEvents = selectedDay ? eventsByDay[selectedDay] || [] : events;

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={t('calendar.title')}
        subtitle={t('calendar.subtitle')}
        breadcrumbs={[{ label: t('common.home'), path: '/' }, { label: t('calendar.title') }]}
      />

      {/* Calendar Header Controls */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {currentDate.toLocaleDateString(i18n.language || 'vi', { month: 'long', year: 'numeric' })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<TodayIcon />}
              onClick={handleToday}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {t('calendar.today')}
            </Button>

            <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Tooltip title={t('calendar.prevMonth')}>
                <IconButton onClick={handlePrevMonth} size="small" aria-label={t('calendar.prevMonth')}>
                  <ChevronLeft />
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem />
              <Tooltip title={t('calendar.nextMonth')}>
                <IconButton onClick={handleNextMonth} size="small" aria-label={t('calendar.nextMonth')}>
                  <ChevronRight />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Calendar Grid */}
      {loading ? (
        <ListSkeleton count={4} />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
              {/* Day headers */}
              <Grid container spacing={1} sx={{ mb: 1, textAlign: 'center' }}>
                {daysOfWeek.map((dayName, index) => (
                  <Grid item xs={12 / 7} key={index}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      {dayName}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* Day cells */}
              <Grid container spacing={1}>
                {dayCells.map((day, idx) => {
                  if (day === null) {
                    return (
                      <Grid item xs={12 / 7} key={`empty-${idx}`}>
                        <Box sx={{ minHeight: 70, borderRadius: 2, bgcolor: 'action.hover', opacity: 0.3 }} />
                      </Grid>
                    );
                  }

                  const dayEvents = eventsByDay[day] || [];
                  const isToday = isCurrentMonth && day === todayDate;
                  const isSelected = selectedDay === day;

                  return (
                    <Grid item xs={12 / 7} key={`day-${day}`}>
                      <Paper
                        elevation={0}
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                        sx={{
                          minHeight: 75,
                          p: 1,
                          borderRadius: 2,
                          border: 1,
                          borderColor: isSelected
                            ? 'primary.main'
                            : isToday
                            ? 'secondary.main'
                            : 'divider',
                          bgcolor: isSelected
                            ? 'primary.50'
                            : isToday
                            ? 'action.selected'
                            : 'background.paper',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 2,
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography
                            variant="body2"
                            fontWeight={isToday || isSelected ? 800 : 600}
                            color={isToday ? 'secondary.main' : 'text.primary'}
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: isToday ? 'primary.main' : 'transparent',
                              color: isToday ? 'white' : 'inherit',
                            }}
                          >
                            {day}
                          </Typography>
                          {dayEvents.length > 0 && (
                            <Chip
                              label={dayEvents.length}
                              size="small"
                              color="primary"
                              sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
                            />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {dayEvents.slice(0, 2).map((ev) => (
                            <Tooltip key={ev.id} title={`${ev.title} (${formatTime(ev.startAt)})`}>
                              <Box
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/events/${ev.id}`);
                                }}
                                sx={{
                                  px: 0.8,
                                  py: 0.2,
                                  borderRadius: 1,
                                  bgcolor: ev.isRegistered ? 'success.lighter' : 'primary.lighter',
                                  color: ev.isRegistered ? 'success.dark' : 'primary.dark',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  '&:hover': {
                                    textDecoration: 'underline',
                                  },
                                }}
                              >
                                {ev.title}
                              </Box>
                            </Tooltip>
                          ))}
                          {dayEvents.length > 2 && (
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              {t('calendar.moreEvents', { count: dayEvents.length - 2 })}
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>

          {/* Side panel: Selected Day or Month Events list */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  {selectedDay
                    ? t('calendar.dayEvents', { day: selectedDay, month: month + 1, year })
                    : t('calendar.monthEvents', { month: month + 1, year })}
                </Typography>
                {selectedDay && (
                  <Button size="small" onClick={() => setSelectedDay(null)}>
                    {t('common.viewAll')}
                  </Button>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 420 }}>
                {activeDayEvents.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {activeDayEvents.map((ev) => (
                      <Card
                        key={ev.id}
                        variant="outlined"
                        onClick={() => navigate(`/events/${ev.id}`)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3,
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <CategoryChip category={ev.category} size="small" />
                            {ev.isRegistered && (
                              <Chip
                                icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                                label={t('calendar.registered')}
                                color="success"
                                size="small"
                              />
                            )}
                          </Box>

                          <Typography variant="subtitle1" fontWeight={700} gutterBottom noWrap>
                            {ev.title}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            🕒 {new Date(ev.startAt).toLocaleDateString(i18n.language || 'vi')} · {formatTime(ev.startAt)}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <EventIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
                    <Typography variant="body2">
                      {selectedDay
                        ? t('calendar.noDayEvents', { day: selectedDay, month: month + 1 })
                        : t('calendar.noMonthEvents', { month: month + 1, year })}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CalendarPage;
