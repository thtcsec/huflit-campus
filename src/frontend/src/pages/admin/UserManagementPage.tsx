import React, { useCallback, useEffect, useState } from 'react';
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
  CircularProgress,
  TablePagination,
} from '@mui/material';
import {
  Search,
  Download,
  Block,
  CheckCircle,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { usersApi } from '@/api';
import { unwrapPaged } from '@/types/paging';
import { UserRole, type UserProfile } from '@/types';
import { useAuth } from '@/hooks';

const ASSIGNABLE_ROLES: UserRole[] = [
  UserRole.Guest,
  UserRole.Student,
  UserRole.Lecturer,
  UserRole.ClubManager,
  UserRole.FacultyManager,
  UserRole.Administrator,
];

export const UserManagementPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser } = useAuth();

  const dateLocale = i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US';

  const roleLabel = (role: UserRole) => t(`roles.${role}`, { defaultValue: role });

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [roleDialogUser, setRoleDialogUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Student);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.list({
        search: search || undefined,
        role: roleFilter === 'ALL' ? undefined : (roleFilter as UserRole),
        page: page + 1,
        pageSize,
      });
      setUsers(unwrapPaged<UserProfile>(data));
      setTotalCount(
        data && typeof data === 'object' && 'totalCount' in data
          ? Number((data as { totalCount: number }).totalCount) || 0
          : unwrapPaged<UserProfile>(data).length,
      );
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        t('adminUsers.loadFailed');
      enqueueSnackbar(message, { variant: 'error' });
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, page, pageSize, roleFilter, search, t]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (user: UserProfile) => {
    if (user.id === currentUser?.id && user.isActive) {
      enqueueSnackbar(t('adminUsers.cannotDeactivateSelf'), { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const { data } = await usersApi.setActive(user.id, !user.isActive);
      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
      enqueueSnackbar(
        data.isActive ? t('adminUsers.activated') : t('adminUsers.deactivated'),
        { variant: 'success' },
      );
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        t('adminUsers.updateFailed');
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const openRoleDialog = (user: UserProfile) => {
    setRoleDialogUser(user);
    setSelectedRole(user.role);
  };

  const handleSaveRole = async () => {
    if (!roleDialogUser) return;
    setSaving(true);
    try {
      const { data } = await usersApi.updateRole(roleDialogUser.id, selectedRole);
      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
      setRoleDialogUser(null);
      enqueueSnackbar(t('adminUsers.roleUpdated'), { variant: 'success' });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        t('adminUsers.updateFailed');
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [t('adminUsers.csvHeaders')];
    const rows = users.map(
      (u) =>
        `"${u.fullName}","${u.email}","${u.studentId || ''}","${roleLabel(u.role)}","${u.faculty || ''}","${
          u.isActive ? t('adminUsers.active') : t('adminUsers.inactive')
        }","${new Date(u.createdAt).toLocaleDateString(dateLocale)}"`,
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
    enqueueSnackbar(t('adminUsers.exported'), { variant: 'success' });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {t('adminUsers.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('adminUsers.subtitle')}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<Download />}
          onClick={handleExportCsv}
          disabled={users.length === 0}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {t('adminUsers.exportCsv')}
        </Button>
      </Box>

      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={7} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('adminUsers.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(0);
                  setSearch(searchInput.trim());
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('adminUsers.filterRole')}
              value={roleFilter}
              onChange={(e) => {
                setPage(0);
                setRoleFilter(e.target.value);
              }}
            >
              <MenuItem value="ALL">{t('adminUsers.allRoles')}</MenuItem>
              {ASSIGNABLE_ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {roleLabel(role)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setPage(0);
                setSearch(searchInput.trim());
              }}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              {t('common.search')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t('adminUsers.colUser')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('adminUsers.colStudentId')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('adminUsers.colFaculty')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('adminUsers.colRole')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('adminUsers.colStatus')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('adminUsers.colCreated')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {t('adminUsers.colActions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        {t('adminUsers.empty')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={u.avatarUrl}
                            sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}
                          >
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
                        <Chip
                          label={roleLabel(u.role)}
                          color={getRoleChipColor(u.role)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.isActive ? t('adminUsers.active') : t('adminUsers.inactive')}
                          color={u.isActive ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(u.createdAt).toLocaleDateString(dateLocale)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('adminUsers.changeRole')}>
                          <IconButton color="primary" disabled={saving} onClick={() => openRoleDialog(u)}>
                            <AdminPanelSettings />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            u.isActive ? t('adminUsers.deactivate') : t('adminUsers.activate')
                          }
                        >
                          <IconButton
                            color={u.isActive ? 'warning' : 'success'}
                            disabled={saving}
                            onClick={() => void handleToggleStatus(u)}
                          >
                            {u.isActive ? <Block /> : <CheckCircle />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, next) => setPage(next)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </>
        )}
      </TableContainer>

      <Dialog open={Boolean(roleDialogUser)} onClose={() => setRoleDialogUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>{t('adminUsers.changeRoleTitle')}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {roleDialogUser?.fullName} · {roleDialogUser?.email}
          </Typography>
          <TextField
            select
            fullWidth
            label={t('adminUsers.colRole')}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
          >
            {ASSIGNABLE_ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {roleLabel(role)}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            {t('adminUsers.roleHint')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRoleDialogUser(null)}>{t('common.cancel')}</Button>
          <Button variant="contained" disabled={saving} onClick={() => void handleSaveRole()}>
            {saving ? <CircularProgress size={20} color="inherit" /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagementPage;
