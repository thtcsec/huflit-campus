import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import {
  MenuBook,
  School,
  Person,
  AdminPanelSettings,
  HelpOutline,
  CheckCircle,
  ArrowForward,
  Bookmark,
  QrCodeScanner,
  CardMembership,
  CalendarToday,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common';

export const UserGuidePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Role Tab state: 0: Student, 1: Lecturer, 2: Guest, 3: Admin
  const [activeTab, setActiveTab] = useState(0);
  const [activeSection, setActiveSection] = useState('sec-1');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Table of Contents definitions per role
  const tocItems = [
    {
      roleTab: 0, // Student
      items: [
        { id: 'sec-1', title: '1. Đăng nhập hệ thống bằng Microsoft Student' },
        { id: 'sec-2', title: '2. Khám phá & Tìm kiếm sự kiện campus' },
        { id: 'sec-3', title: '3. Quy trình Đăng ký tham gia & Hàng chờ Waitlist' },
        { id: 'sec-4', title: '4. Thêm sự kiện vào Lịch & Google Calendar' },
        { id: 'sec-5', title: '5. Điểm danh QR & Tải Giấy Chứng Nhận (PDF)' },
        { id: 'sec-6', title: '6. Gửi Đánh giá & Phản hồi sau sự kiện' },
      ],
    },
    {
      roleTab: 1, // Lecturer
      items: [
        { id: 'sec-lec-1', title: '1. Đăng nhập tài khoản Giảng viên' },
        { id: 'sec-lec-2', title: '2. Tạo sự kiện mới & Tùy chỉnh đối tượng' },
        { id: 'sec-lec-3', title: '3. Lưu Bản Nháp (Draft) vs Gửi Duyệt' },
        { id: 'sec-lec-4', title: '4. Sinh mã QR & Quét điểm danh tham gia' },
        { id: 'sec-lec-5', title: '5. Xuất danh sách đăng ký CSV & Hoàn tất sự kiện' },
      ],
    },
    {
      roleTab: 2, // Guest
      items: [
        { id: 'sec-gst-1', title: '1. Duyệt sự kiện không cần đăng nhập' },
        { id: 'sec-gst-2', title: '2. Đăng nhập tài khoản Khách bằng mã OTP' },
        { id: 'sec-gst-3', title: '3. Lưu sự kiện & Đăng ký tham gia' },
      ],
    },
  ];

  const currentToc = tocItems.find((t) => t.roleTab === activeTab)?.items || [];

  return (
    <Container maxWidth="xl">
      <PageHeader
        title={t('userGuide.title')}
        subtitle={t('userGuide.subtitle')}
        breadcrumbs={[
          { label: t('common.home'), path: '/' },
          { label: t('userGuide.title') },
        ]}
      />

      {/* Role Selection Tabs */}
      <Paper sx={{ mb: 4, borderRadius: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            const firstId = tocItems.find((t) => t.roleTab === val)?.items[0]?.id;
            if (firstId) setActiveSection(firstId);
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<School />} iconPosition="start" label="🎓 Dành cho Sinh Viên" />
          <Tab icon={<Person />} iconPosition="start" label="👨‍🏫 Dành cho Giảng Viên / CLB" />
          <Tab icon={<HelpOutline />} iconPosition="start" label="👤 Dành cho Khách (Guest)" />
        </Tabs>
      </Paper>

      <Grid container spacing={4}>
        {/* Left Sticky Table of Contents Sidebar */}
        <Grid item xs={12} md={3.5}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              position: { md: 'sticky' },
              top: { md: 84 },
              maxHeight: 'calc(100vh - 110px)',
              overflowY: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <MenuBook color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Mục lục Hướng dẫn (Contents)
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <List disablePadding>
              {currentToc.map((item) => {
                const active = activeSection === item.id;
                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => scrollToSection(item.id)}
                      sx={{
                        borderRadius: 2,
                        bgcolor: active ? 'primary.light' : 'transparent',
                        color: active ? 'primary.main' : 'text.primary',
                        fontWeight: active ? 700 : 500,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: active ? 700 : 500 }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            <Divider sx={{ my: 2 }} />

            <Alert severity="info" icon={<HelpOutline fontSize="inherit" />} sx={{ borderRadius: 2 }}>
              Bạn gặp sự cố cần hỗ trợ? Liên hệ Văn phòng Khoa CNTT HUFLIT qua email <strong>fit@huflit.edu.vn</strong>.
            </Alert>
          </Paper>
        </Grid>

        {/* Right Reader Article Content */}
        <Grid item xs={12} md={8.5}>
          <Paper sx={{ p: 4, borderRadius: 3, minHeight: 600 }}>
            {/* TAB 0: STUDENT GUIDE */}
            {activeTab === 0 && (
              <Box>
                {/* Sec 1 */}
                <Box id="sec-1" sx={{ mb: 5, scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="primary.main" gutterBottom>
                    1. Đăng nhập hệ thống bằng Microsoft Student
                  </Typography>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    Hệ thống HUFLIT Campus EMS cho phép toàn bộ sinh viên HUFLIT đăng nhập 1-click an toàn thông qua tài khoản Microsoft Trường (định dạng <strong>@student.huflit.edu.vn</strong>).
                  </Typography>

                  <Box sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Các bước thực hiện:
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ lineHeight: 1.8 }}>
                      1. Truy cập trang Đăng nhập tại đường dẫn <Chip size="small" label="/login" color="primary" />.<br />
                      2. Nhấp chọn tab <strong>Sinh viên</strong> và bấm nút <strong>"Tiếp tục với Microsoft"</strong>.<br />
                      3. Hệ thống xác thực tài khoản email sinh viên và tự động đồng bộ Họ tên, MSSV, Khoa & Chuyên ngành.<br />
                      4. Sau khi xác thực thành công, bạn được chuyển hướng thẳng tới Trang chủ sự kiện campus.
                    </Typography>
                  </Box>

                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Mẹo: Tài khoản sinh viên lần đầu đăng nhập không cần nhớ mật khẩu riêng biệt.
                  </Alert>
                </Box>

                {/* Sec 2 */}
                <Box id="sec-2" sx={{ mb: 5, scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="primary.main" gutterBottom>
                    2. Khám phá & Tìm kiếm sự kiện campus
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Bạn có thể dễ dàng duyệt các sự kiện diễn ra hôm nay, sự kiện nổi bật, hoặc lọc theo danh mục học thuật, workshop, cuộc thi và CLB.
                  </Typography>

                  <Box sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Các tính năng tìm kiếm chính:
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ lineHeight: 1.8 }}>
                      • <strong>Thanh tìm kiếm (Search)</strong>: Tìm theo tên sự kiện hoặc từ khóa quan tâm.<br />
                      • <strong>Bộ lọc Danh mục (Category)</strong>: Lọc xem sự kiện Học thuật, Workshop, Cuộc thi, Tình nguyện hay Hoạt động CLB.<br />
                      • <strong>Lưu sự kiện (<Bookmark fontSize="small" />)</strong>: Bấm biểu tượng Bookmark để lưu sự kiện vào danh sách <em>"Sự kiện đã lưu"</em> để theo dõi sau.
                    </Typography>
                  </Box>
                </Box>

                {/* Sec 3 */}
                <Box id="sec-3" sx={{ mb: 5, scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="primary.main" gutterBottom>
                    3. Quy trình Đăng ký tham gia & Hàng chờ Waitlist
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Mỗi sự kiện có giới hạn sức chứa chỗ ngồi cụ thể. Khi sự kiện còn chỗ, sinh viên bấm <strong>"Đăng ký ngay"</strong> để giữ chỗ.
                  </Typography>

                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                    Trường hợp Sự kiện đã hết chỗ (Sold Out): Nếu sự kiện có bật tính năng Hàng chờ, bạn sẽ được tự động xếp vào vị trí <strong>Waitlist (#1, #2...)</strong>. Ngay khi có sinh viên khác hủy vé, vị trí của bạn sẽ tự động đẩy lên danh sách chính thức!
                  </Alert>
                </Box>

                {/* Sec 4 */}
                <Box id="sec-4" sx={{ mb: 5, scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="primary.main" gutterBottom>
                    4. Thêm sự kiện vào Lịch & Google Calendar
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Trên trang chi tiết sự kiện, sinh viên có thể đồng bộ thời gian diễn ra sự kiện vào lịch cá nhân:
                  </Typography>

                  <Typography variant="body2" component="div" sx={{ lineHeight: 1.8, ml: 2, mb: 2 }}>
                    • <strong>Thêm vào Google Calendar (<CalendarToday fontSize="small" />)</strong>: Mở trực tiếp ứng dụng Google Calendar 1-click để tạo nhắc nhở.<br />
                    • <strong>Tải file Lịch (.ics)</strong>: Tải tập tin chuẩn .ics để nhập vào Apple Calendar hoặc Outlook.
                  </Typography>
                </Box>

                {/* Sec 5 */}
                <Box id="sec-5" sx={{ mb: 5, scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="primary.main" gutterBottom>
                    5. Điểm danh QR & Tải Giấy Chứng Nhận (PDF)
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Khi đến tham dự sự kiện tại hội trường campus HUFLIT:
                  </Typography>

                  <Box sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Quy trình Check-in & Nhận Giấy Chứng Nhận:
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ lineHeight: 1.8 }}>
                      1. Mở trang <strong>"Đăng ký của tôi"</strong> trên ứng dụng.<br />
                      2. Đưa mã QR vé điện tử cho Ban tổ chức / Giảng viên quét điểm danh bằng camera.<br />
                      3. Sau khi check-in thành công, trạng thái chuyển sang <Chip size="small" label="Attended" color="success" />.<br />
                      4. Bấm nút <strong>"Tải Giấy Chứng Nhận (PDF)"</strong> <CardMembership fontSize="small" /> để nhận Giấy chứng nhận có con dấu Khoa CNTT & QR xác thực.
                    </Typography>
                  </Box>
                </Box>

                {/* Sec 6 */}
                <Box id="sec-6" sx={{ scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="primary.main" gutterBottom>
                    6. Gửi Đánh giá & Phản hồi sau sự kiện
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Sau khi sự kiện hoàn tất, sinh viên có thể đánh giá từ 1 đến 5 sao ⭐ và gửi lời nhận xét đóng góp ý kiến để giúp Khoa cải thiện chất lượng các sự kiện tiếp theo.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* TAB 1: LECTURER GUIDE */}
            {activeTab === 1 && (
              <Box>
                <Box id="sec-lec-1" sx={{ mb: 5, scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="secondary.main" gutterBottom>
                    1. Đăng nhập tài khoản Giảng viên / Ban Chủ nhiệm CLB
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Giảng viên và Ban chủ nhiệm CLB đăng nhập qua tài khoản Microsoft chính thức. Hệ thống tự động cấp quyền Quản lý sự kiện (`CanManageEvents`).
                  </Typography>
                </Box>

                <Box id="sec-lec-2" sx={{ mb: 5, scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="secondary.main" gutterBottom>
                    2. Tạo sự kiện mới & Tùy chỉnh đối tượng tham gia
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Truy cập trang <strong>"Tạo sự kiện"</strong> từ thanh SideNav để thiết lập:
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ lineHeight: 1.8, ml: 2, mb: 2 }}>
                    • Nhập tiêu đề, mô tả, dán URL ảnh bìa Banner (có khung Live Preview xem trước).<br />
                    • Cấu hình bật/tắt đối tượng đăng ký: Sinh viên, Giảng viên hoặc Khách tự do.<br />
                    • Chọn cơ sở HUFLIT (Sư Vạn Hạnh, Hóc Môn, Ba Gia, Trường Sơn, Trực tuyến) và nhập tên phòng/hội trường.
                  </Typography>
                </Box>

                <Box id="sec-lec-3" sx={{ mb: 5, scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="secondary.main" gutterBottom>
                    3. Lưu Bản Nháp (Draft) vs Gửi Duyệt (Submit Approval)
                  </Typography>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    • <strong>Lưu Bản Nháp (Save Draft)</strong>: Lưu thông tin sự kiện để chỉnh sửa tiếp mà chưa công khai.<br />
                    • <strong>Gửi Duyệt Sự Kiện</strong>: Gửi sự kiện lên Ban Quản lý Khoa để duyệt công khai trên toàn campus.
                  </Alert>
                </Box>

                <Box id="sec-lec-4" sx={{ mb: 5, scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="secondary.main" gutterBottom>
                    4. Sinh mã QR & Quét điểm danh tham gia
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Giảng viên / BTC có thể dùng máy ảnh điện thoại hoặc laptop truy cập trang <strong>"Quét điểm danh"</strong> để quét mã QR vé của sinh viên. Hệ thống phát âm thanh phản hồi ngay lập tức khi check-in thành công.
                  </Typography>
                </Box>

                <Box id="sec-lec-5" sx={{ scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="secondary.main" gutterBottom>
                    5. Xuất danh sách đăng ký CSV & Hoàn tất sự kiện
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Trên trang <strong>"Sự kiện của tôi"</strong>, Giảng viên có thể bấm <strong>"Xuất File CSV Đăng Ký"</strong> (tập tin mở chuẩn tiếng Việt trên Excel) và bấm <strong>"Hoàn Tất Sự Kiện"</strong> sau khi sự kiện kết thúc.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* TAB 2: GUEST GUIDE */}
            {activeTab === 2 && (
              <Box>
                <Box id="sec-gst-1" sx={{ mb: 5, scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="info.main" gutterBottom>
                    1. Duyệt sự kiện không cần đăng nhập
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Khách tham quan và cựu sinh viên có thể xem danh sách sự kiện campus, lịch trình và bảng tin thông báo trực tiếp mà không cần đăng nhập tài khoản.
                  </Typography>
                </Box>

                <Box id="sec-gst-2" sx={{ mb: 5, scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="info.main" gutterBottom>
                    2. Đăng nhập tài khoản Khách bằng mã OTP
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Để đăng ký tham gia các sự kiện dành cho Khách, bạn chọn tab <strong>Khách</strong> trên trang Đăng nhập, nhập Email cá nhân để nhận mã OTP xác thực 1-click.
                  </Typography>
                </Box>

                <Box id="sec-gst-3" sx={{ scrollMarginTop: 100 }}>
                  <Typography variant="h5" fontWeight={800} color="info.main" gutterBottom>
                    3. Lưu sự kiện & Đăng ký tham gia
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Sau khi đăng nhập tài khoản Khách, bạn có thể lưu các sự kiện quan tâm và bấm đăng ký giữ chỗ tham gia dễ dàng.
                  </Typography>
                </Box>
              </Box>
            )}

          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserGuidePage;
