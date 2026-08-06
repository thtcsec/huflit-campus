import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Divider,
  Card,
  CardMedia,
  Chip,
  Alert,
} from '@mui/material';
import {
  CloudUpload,
  Save,
  Send,
  Image,
  LocationOn,
  Group,
  EventNote,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '@/api';
import { PageHeader } from '@/components/common';
import { EventCategory, CreateEventRequest, EventStatus } from '@/types';

export const CreateEventPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    description: '',
    agenda: '',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    category: EventCategory.Academic,
    faculty: 'Khoa Công nghệ Thông tin',
    locationName: 'Hội trường B - Cơ sở 10 Cao Thắng',
    address: '828 Sư Vạn Hạnh, Phường 13, Quận 10, TP.HCM',
    capacity: 100,
    waitlistEnabled: true,
    maxWaitlist: 20,
    registrationDeadline: new Date(Date.now() + 86400000 * 7).toISOString().substring(0, 16),
    startAt: new Date(Date.now() + 86400000 * 8).toISOString().substring(0, 16),
    endAt: new Date(Date.now() + 86400000 * 8 + 10800000).toISOString().substring(0, 16),
    requirements: 'Mang theo thẻ Sinh viên / Giảng viên HUFLIT',
    sponsor: 'BCH Khoa Công nghệ Thông tin HUFLIT',
    isFeatured: true,
  });

  // Audience Scoping Switches
  const [allowStudent, setAllowStudent] = useState(true);
  const [allowLecturer, setAllowLecturer] = useState(true);
  const [allowGuest, setAllowGuest] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // Campus selection
  const [selectedCampus, setSelectedCampus] = useState('Cơ sở 10 Cao Thắng');

  const handleChange = (field: keyof CreateEventRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (asDraft: boolean) => {
    if (!formData.title.trim()) {
      enqueueSnackbar('Vui lòng nhập tên sự kiện', { variant: 'warning' });
      return;
    }
    if (!formData.description.trim()) {
      enqueueSnackbar('Vui lòng nhập mô tả sự kiện', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const payload: CreateEventRequest = {
        ...formData,
        locationName: `${selectedCampus} - ${formData.locationName}`,
      };

      const { data } = await eventsApi.createEvent(payload);

      if (asDraft) {
        enqueueSnackbar('Đã lưu sự kiện dưới dạng Bản Nháp (Draft)!', { variant: 'info' });
      } else {
        enqueueSnackbar('Đã gửi sự kiện chờ duyệt (Pending Approval)!', { variant: 'success' });
      }

      navigate(`/events/${data.id}`);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Không thể tạo sự kiện', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Tạo Sự Kiện Mới (Create Campus Event)"
        subtitle="Thiết lập thông tin, ảnh bìa, đối tượng tham gia và lịch trình sự kiện campus"
        breadcrumbs={[
          { label: t('common.home'), path: '/' },
          { label: t('events.title'), path: '/events' },
          { label: t('createEvent.title') },
        ]}
      />

      <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Grid container spacing={3.5}>
            {/* Section 1: General Event Info */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EventNote color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  1. Thông tin Chung (General Information)
                </Typography>
              </Box>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Tên Sự kiện (Event Title)"
                placeholder="Ví dụ: Workshop Lập Trình Web với React & .NET Core 2026"
                value={formData.title}
                onChange={handleChange('title')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Mô tả Chi tiết (Description)"
                placeholder="Nội dung chi tiết về sự kiện, mục tiêu và các nội dung chính..."
                value={formData.description}
                onChange={handleChange('description')}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                required
                label="Danh mục (Category)"
                value={formData.category}
                onChange={handleChange('category')}
              >
                {Object.values(EventCategory).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Khoa / Đơn vị Tổ chức"
                value={formData.faculty}
                onChange={handleChange('faculty')}
              />
            </Grid>

            {/* Section 2: Banner Image & Preview */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 1 }}>
                <Image color="secondary" />
                <Typography variant="h6" fontWeight={700}>
                  2. Ảnh Bìa & Banner Sự kiện (Media & Banner)
                </Typography>
              </Box>
              <Divider />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="URL Ảnh Bìa / Banner (Banner URL)"
                placeholder="https://..."
                value={formData.bannerUrl}
                onChange={handleChange('bannerUrl')}
                helperText="Dán liên kết ảnh bìa Banner chất lượng cao để hiển thị nổi bật trên trang chủ."
              />
            </Grid>

            {formData.bannerUrl && (
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Xem trước Ảnh bìa (Live Banner Preview):
                </Typography>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardMedia
                    component="img"
                    height="120"
                    image={formData.bannerUrl}
                    alt="Banner Preview"
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200';
                    }}
                  />
                </Card>
              </Grid>
            )}

            {/* Section 3: Audience Scoping & Registration Rules */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 1 }}>
                <Group color="success" />
                <Typography variant="h6" fontWeight={700}>
                  3. Đối tượng & Cấu hình Đăng ký (Registration & Audience Controls)
                </Typography>
              </Box>
              <Divider />
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Quyền Đăng ký Đối tượng (Audience Scoping):
                </Typography>
                <FormControlLabel
                  control={<Switch checked={allowStudent} onChange={(e) => setAllowStudent(e.target.checked)} />}
                  label="Cho phép Sinh viên đăng ký (Allow Student Registration)"
                />
                <br />
                <FormControlLabel
                  control={<Switch checked={allowLecturer} onChange={(e) => setAllowLecturer(e.target.checked)} />}
                  label="Cho phép Giảng viên đăng ký (Allow Lecturer Registration)"
                />
                <br />
                <FormControlLabel
                  control={<Switch checked={allowGuest} onChange={(e) => setAllowGuest(e.target.checked)} />}
                  label="Cho phép Khách tự do (Allow Guest Registration)"
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Hàng chờ & Hiển thị (Waitlist & Visibility):
                </Typography>
                <FormControlLabel
                  control={<Switch checked={formData.waitlistEnabled} onChange={handleChange('waitlistEnabled')} />}
                  label="Kích hoạt Hàng chờ tự động khi hết chỗ (Allow Waitlist)"
                />
                <br />
                <FormControlLabel
                  control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
                  label="Công khai Sự kiện trên toàn campus (Public Event)"
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Sức chứa Tối đa (Capacity / Max Seats)"
                value={formData.capacity}
                onChange={handleChange('capacity')}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="Hạn chót Đăng ký (Registration Deadline)"
                value={formData.registrationDeadline}
                onChange={handleChange('registrationDeadline')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Section 4: Date, Time & Location */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 1 }}>
                <LocationOn color="warning" />
                <Typography variant="h6" fontWeight={700}>
                  4. Thời gian & Cơ sở Tổ chức (Location & Time)
                </Typography>
              </Box>
              <Divider />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Chọn Cơ sở HUFLIT (Campus)"
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
              >
                <MenuItem value="Cơ sở 10 Cao Thắng">Cơ sở 10 Cao Thắng (828 Sư Vạn Hạnh, Q.10)</MenuItem>
                <MenuItem value="Cơ sở Hóc Môn">Cơ sở Hóc Môn (Tân Hiệp, Hóc Môn)</MenuItem>
                <MenuItem value="Trực tuyến (Online)">Trực tuyến (MS Teams / Zoom)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Phòng / Địa điểm Cụ thể (Venue Location)"
                placeholder="Ví dụ: Hội trường B - Lầu 2"
                value={formData.locationName}
                onChange={handleChange('locationName')}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="Thời gian Bắt đầu (Start Date & Time)"
                value={formData.startAt}
                onChange={handleChange('startAt')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="Thời gian Kết thúc (End Date & Time)"
                value={formData.endAt}
                onChange={handleChange('endAt')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Chương trình / Lịch trình (Agenda Summary)"
                placeholder="08:00 - Check-in; 08:30 - Khai mạc; 09:00 - Diễn giả trình bày..."
                value={formData.agenda}
                onChange={handleChange('agenda')}
              />
            </Grid>

            {/* Action Buttons: Save Draft vs Submit Approval */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" color="inherit" onClick={() => navigate(-1)}>
                  Hủy
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<Save />}
                  onClick={() => void handleSave(true)}
                  disabled={loading}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Lưu Bản Nháp (Save Draft)
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Send />}
                  onClick={() => void handleSave(false)}
                  disabled={loading}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Gửi Duyệt Sự Kiện (Submit Approval)
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateEventPage;
