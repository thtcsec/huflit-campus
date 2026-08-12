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
  Tabs,
  Tab,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today as TodayIcon,
  Event as EventIcon,
  CheckCircle,
  Schedule as ScheduleIcon,
  ZoomIn,
  Download,
  School,
  LocationOn,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader, CategoryChip, ListSkeleton } from '@/components/common';
import { calendarApi } from '@/api/calendar';
import type { CalendarEvent } from '@/types';
import { formatTime } from '@/utils';

export const CalendarPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialTab = searchParams.get('tab') === 'timetable' ? 1 : 0;
  const [tabValue, setTabValue] = useState(initialTab);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [tkbModalOpen, setTkbModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('tab') === 'timetable') {
      setTabValue(1);
    } else {
      setTabValue(0);
    }
  }, [searchParams]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) {
      setSearchParams({ tab: 'timetable' });
    } else {
      setSearchParams({});
    }
  };

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

      {/* Main Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary">
          <Tab icon={<EventIcon />} iconPosition="start" label={t('calendar.title')} sx={{ fontWeight: 700, py: 2 }} />
          <Tab icon={<ScheduleIcon />} iconPosition="start" label={t('nav.timetable')} sx={{ fontWeight: 700, py: 2 }} />
        </Tabs>
      </Paper>

      {/* TAB 0: Event Calendar */}
      {tabValue === 0 && (
        <>
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
        </>
      )}

      {/* TAB 1: Student Timetable */}
      {tabValue === 1 && (
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <School color="primary" sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  Thời Khóa Biểu Học Tập HUFLIT
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thời khóa biểu học tập & lịch thực hành các môn học trong học kỳ
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ mt: { xs: 2, sm: 0 } }}>
              <Button
                variant="outlined"
                startIcon={<ZoomIn />}
                onClick={() => setTkbModalOpen(true)}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Xem ảnh phóng to
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                component="a"
                href="/tkb.jpg"
                download="HUFLIT_ThoiKhoaBieu.jpg"
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Tải ảnh TKB
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                onClick={() => setTkbModalOpen(true)}
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: 2,
                  borderColor: 'primary.main',
                  cursor: 'pointer',
                  boxShadow: 3,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.01)' },
                }}
              >
                <Box
                  component="img"
                  src="/tkb.jpg"
                  alt="Thời khóa biểu HUFLIT"
                  sx={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: 12,
                  }}
                >
                  <ZoomIn fontSize="small" /> Phóng to Nét Cao
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={800} color="primary.main" gutterBottom>
                Hệ Thống Các Cơ Sở Đào Tạo HUFLIT
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Trường Đại học Ngoại ngữ – Tin học TP. Hồ Chí Minh (HUFLIT) sở hữu chuỗi cơ sở hiện đại, phục vụ tối đa nhu cầu học tập và hoạt động ngoại khóa của sinh viên:
              </Typography>
              
              <Stack spacing={1.5} sx={{ mt: 2, maxHeight: 380, overflowY: 'auto', pr: 1 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: 'primary.light' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <LocationOn color="error" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      1. Cơ sở Sư Vạn Hạnh (Quận 10)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    📍 828 Sư Vạn Hạnh, Phường 13, Quận 10, TP. Hồ Chí Minh
                  </Typography>
                  <Typography variant="caption" color="primary.main" fontWeight={600} display="block" sx={{ mt: 0.5 }}>
                    Cơ sở chính và là trung tâm điều hành, làm việc của Ban Giám hiệu cùng các phòng ban cốt lõi.
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: 'primary.light' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <LocationOn color="primary" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      2. Cơ sở Hóc Môn
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    📍 806 Lê Quang Đạo, Xã Tân Xuân, Huyện Hóc Môn, TP. Hồ Chí Minh
                  </Typography>
                  <Typography variant="caption" color="primary.main" fontWeight={600} display="block" sx={{ mt: 0.5 }}>
                    Cơ sở rộng rãi, hiện đại và mới nhất của trường.
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: 'primary.light' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <LocationOn color="success" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      3. Cơ sở Ba Gia (Quận Tân Bình)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    📍 52 - 70 Ba Gia, Phường 7, Quận Tân Bình, TP. Hồ Chí Minh
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: 'primary.light' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <LocationOn color="warning" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      4. Cơ sở Trường Sơn (Quận Tân Bình)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    📍 32 Trường Sơn, Phường 2, Quận Tân Bình, TP. Hồ Chí Minh
                  </Typography>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Modal View Large TKB Image */}
      <Dialog open={tkbModalOpen} onClose={() => setTkbModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            Thời Khóa Biểu Học Tập — Phóng To Nét Cao
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ textAlign: 'center', bgcolor: '#111' }}>
          <Box
            component="img"
            src="/tkb.jpg"
            alt="Thời khóa biểu"
            sx={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTkbModalOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CalendarPage;
