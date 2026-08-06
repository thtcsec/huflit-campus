import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Search,
  PersonAdd,
  Download,
  Edit,
  Block,
  CheckCircle,
  Delete,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { UserRole } from '@/types';

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  studentId?: string;
  role: UserRole;
  faculty?: string;
  isActive: boolean;
  createdAt: string;
}

export const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  // Seed user roster matching HUFLIT Campus roles
  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: 'usr-1',
      fullName: 'Nguyễn Văn Admin',
      email: 'admin@huflit.edu.vn',
      role: UserRole.Administrator,
      faculty: 'Khoa Công nghệ Thông tin',
      isActive: true,
      createdAt: '2026-01-10T08:00:00Z',
    },
    {
      id: 'usr-2',
      fullName: 'TS. Lê Thành Long',
      email: 'longlt@huflit.edu.vn',
      role: UserRole.FacultyManager,
      faculty: 'Khoa Công nghệ Thông tin',
      isActive: true,
      createdAt: '2026-01-15T09:30:00Z',
    },
    {
      id: 'usr-3',
      fullName: 'ThS. Phạm Hoàng Nam',
      email: 'namph@huflit.edu.vn',
      role: UserRole.Lecturer,
      faculty: 'Khoa Công nghệ Thông tin',
      isActive: true,
      createdAt: '2026-02-01T10:00:00Z',
    },
    {
      id: 'usr-4',
      fullName: 'Trần Minh Huy',
      email: '2021600123@student.huflit.edu.vn',
      studentId: '2021600123',
      role: UserRole.ClubManager,
      faculty: 'Khoa Công nghệ Thông tin',
      isActive: true,
      createdAt: '2026-02-12T14:20:00Z',
    },
    {
      id: 'usr-5',
      fullName: 'Đặng Ngọc Anh',
      email: '2021600456@student.huflit.edu.vn',
      studentId: '2021600456',
      role: UserRole.Student,
      faculty: 'Khoa Ngoại ngữ',
      isActive: true,
      createdAt: '2026-03-05T11:15:00Z',
    },
  ]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal dialog state
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    role: UserRole.Student,
    faculty: 'Khoa Công nghệ Thông tin',
  });

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.studentId && u.studentId.includes(search));
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
    enqueueSnackbar('Đã cập nhật trạng thái người dùng', { variant: 'info' });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      enqueueSnackbar('Vui lòng điền họ tên và email', { variant: 'warning' });
      return;
    }

    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      fullName: formData.fullName,
      email: formData.email,
      studentId: formData.studentId || undefined,
      role: formData.role,
      faculty: formData.faculty,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setUsers([newUser, ...users]);
    setOpenModal(false);
    setFormData({
      fullName: '',
      email: '',
      studentId: '',
      role: UserRole.Student,
      faculty: 'Khoa Công nghệ Thông tin',
    });
    enqueueSnackbar('Thêm người dùng mới thành công!', { variant: 'success' });
  };

  const handleExportCsv = () => {
    const headers = ['Họ và Tên,Email,MSSV,Vai Trò,Khoa,Trạng Thái,Ngày Tạo'];
    const rows = users.map(
      (u) =>
        `"${u.fullName}","${u.email}","${u.studentId || ''}","${u.role}","${u.faculty || ''}","${
          u.isActive ? 'Active' : 'Inactive'
        }","${new Date(u.createdAt).toLocaleDateString('vi-VN')}"`
    );

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HUFLIT_Users_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    enqueueSnackbar('Đã xuất danh sách người dùng CSV thành công', { variant: 'success' });
  };

  const getRoleChipColor = (role: UserRole) => {
    switch (role) {
      case UserRole.Administrator:
        return 'error';
      case UserRole.FacultyManager:
        return 'warning';
      case UserRole.Lecturer:
        return 'secondary';
      case UserRole.ClubManager:
        return 'primary';
      case UserRole.Student:
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Quản lý Người dùng (Users Management)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý toàn bộ danh sách sinh viên, giảng viên và ban quản trị hệ thống HUFLIT Campus.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Download />}
            onClick={handleExportCsv}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Xuất File CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={() => setOpenModal(true)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            + Thêm Người Dùng
          </Button>
        </Box>
      </Box>

      {/* Filter Controls */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm theo tên, email, MSSV..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Lọc theo Vai trò"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="ALL">Tất cả vai trò</MenuItem>
              <MenuItem value={UserRole.Administrator}>Admin</MenuItem>
              <MenuItem value={UserRole.FacultyManager}>BHL Khoa</MenuItem>
              <MenuItem value={UserRole.Lecturer}>Giảng viên</MenuItem>
              <MenuItem value={UserRole.ClubManager}>Chủ nhiệm CLB</MenuItem>
              <MenuItem value={UserRole.Student}>Sinh viên</MenuItem>
              <MenuItem value={UserRole.Guest}>Khách</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* User Data Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>NGƯỜI DÙNG</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>MSSV / MÃ SỐ</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>KHOA</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>VAI TRÒ</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>TRẠNG THÁI</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>NGÀY TẠO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>THAO TÁC</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}>
                      {u.fullName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {u.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {u.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {u.studentId || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{u.faculty || '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={u.role} color={getRoleChipColor(u.role)} size="small" sx={{ fontWeight: 600 }} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.isActive ? 'Active' : 'Inactive'}
                    color={u.isActive ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={u.isActive ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}>
                    <IconButton
                      color={u.isActive ? 'warning' : 'success'}
                      onClick={() => handleToggleStatus(u.id)}
                    >
                      {u.isActive ? <Block /> : <CheckCircle />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Thêm Người Dùng Mới (+ Add User)</DialogTitle>
        <Box component="form" onSubmit={handleCreateUser}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Họ và Tên người dùng"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email trường (HUFLIT / Student)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mã số sinh viên (MSSV)"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Phân quyền Vai trò"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  <MenuItem value={UserRole.Student}>Sinh viên</MenuItem>
                  <MenuItem value={UserRole.ClubManager}>Chủ nhiệm CLB</MenuItem>
                  <MenuItem value={UserRole.Lecturer}>Giảng viên</MenuItem>
                  <MenuItem value={UserRole.FacultyManager}>Trưởng/Phó Khoa</MenuItem>
                  <MenuItem value={UserRole.Administrator}>Admin Hệ thống</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              Tạo Người Dùng
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};

export default UserManagementPage;
