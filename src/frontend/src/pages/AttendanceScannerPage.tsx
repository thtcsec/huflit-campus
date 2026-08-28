import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import {
  QrCodeScanner,
  CheckCircle,
  Videocam,
  VideocamOff,
  Cameraswitch,
  FlashOn,
  FlashOff,
  History,
  Keyboard,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { attendanceApi } from '@/api';
import { PageHeader } from '@/components/common';
import type { Attendance } from '@/types';

const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    if ('vibrate' in navigator) navigator.vibrate(100);
  } catch (e) {
    // Ignore audio errors
  }
};

const playErrorSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
  } catch (e) {
    // Ignore audio errors
  }
};

export const AttendanceScannerPage: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastAttendance, setLastAttendance] = useState<Attendance | null>(null);
  const [recentScans, setRecentScans] = useState<Attendance[]>([]);

  // Camera stream states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isScanningRef = useRef(false);

  // Process check-in with raw QR string
  const processQrCode = async (rawCode: string) => {
    if (loading || isScanningRef.current) return;
    isScanningRef.current = true;
    setLoading(true);

    try {
      let eventId = '';
      let token = '';

      if (rawCode.startsWith('{')) {
        const parsed = JSON.parse(rawCode);
        eventId = parsed.eventId;
        token = parsed.token;
      } else if (rawCode.includes(':')) {
        const parts = rawCode.split(':');
        eventId = parts[0];
        token = parts[1];
      }

      if (!eventId || !token) {
        throw new Error('Định dạng mã QR không hợp lệ.');
      }

      const { data } = await attendanceApi.checkIn({
        eventId,
        qrToken: token,
        deviceInfo: navigator.userAgent,
      });

      setLastAttendance(data);
      setRecentScans((prev) => [data, ...prev.slice(0, 9)]);
      playSuccessSound();
      enqueueSnackbar(`Điểm danh thành công: ${data.userFullName || 'Sinh viên'}!`, { variant: 'success' });
      setQrData('');
    } catch (error: any) {
      playErrorSound();
      const message = error.response?.data?.detail || error.response?.data?.message || error.message || 'Điểm danh thất bại';
      enqueueSnackbar(message, { variant: 'error' });
      setLastAttendance(null);
    } finally {
      setLoading(false);
      // Debounce scanner for 2 seconds before next scan
      setTimeout(() => {
        isScanningRef.current = false;
      }, 2000);
    }
  };

  // Start / Stop camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Không thể mở Camera. Vui lòng cấp quyền truy cập Camera hoặc chuyển sang chế độ Nhập mã thủ công.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode]);

  // Native BarcodeDetector scanning loop if supported
  useEffect(() => {
    if (!isCameraActive || activeTab !== 'camera') return;

    let animFrame: number;
    const barcodeDetectorSupported = 'BarcodeDetector' in window;
    const detector = barcodeDetectorSupported
      ? new (window as any).BarcodeDetector({ formats: ['qr_code'] })
      : null;

    const scanFrame = async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && detector) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0 && !isScanningRef.current) {
            const code = barcodes[0].rawValue;
            if (code) {
              void processQrCode(code);
            }
          }
        } catch (e) {
          // Ignore detection frame errors
        }
      }
      animFrame = requestAnimationFrame(scanFrame);
    };

    if (detector) {
      animFrame = requestAnimationFrame(scanFrame);
    }

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isCameraActive, activeTab]);

  return (
    <Container maxWidth="md">
      <PageHeader
        title={t('attendance.title') || 'Điểm danh Sự kiện'}
        breadcrumbs={[{ label: t('common.home') || 'Trang chủ', path: '/' }, { label: t('attendance.title') || 'Điểm danh' }]}
      />

      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 0.5 }}
          >
            <Tab
              value="camera"
              label="Quét qua Camera"
              icon={<Videocam />}
              iconPosition="start"
              sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
            />
            <Tab
              value="manual"
              label="Nhập mã thủ công"
              icon={<Keyboard />}
              iconPosition="start"
              sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
            />
          </Tabs>
        </Box>

        {/* Camera Live View Tab */}
        {activeTab === 'camera' && (
          <Box sx={{ textAlign: 'center' }}>
            {cameraError ? (
              <Alert severity="warning" sx={{ mb: 3 }}>
                {cameraError}
              </Alert>
            ) : null}

            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 480,
                height: 360,
                mx: 'auto',
                bgcolor: 'black',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Viewfinder Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  width: 220,
                  height: 220,
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: 2,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                  pointerEvents: 'none',
                }}
              >
                {/* Laser animation */}
                <Box
                  sx={{
                    width: '100%',
                    height: '2px',
                    bgcolor: 'primary.main',
                    boxShadow: '0 0 8px #c8102e',
                    position: 'absolute',
                    animation: 'scanLaser 2s infinite ease-in-out',
                    '@keyframes scanLaser': {
                      '0%': { top: '0%' },
                      '50%': { top: '100%' },
                      '100%': { top: '0%' },
                    },
                  }}
                />
              </Box>

              {/* Top Controls Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  display: 'flex',
                  gap: 1,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  borderRadius: 2,
                  p: 0.5,
                }}
              >
                <Tooltip title="Đổi camera trước / sau">
                  <IconButton size="small" onClick={switchCamera} sx={{ color: 'white' }}>
                    <Cameraswitch />
                  </IconButton>
                </Tooltip>
              </Box>

              {loading && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Đang xử lý điểm danh...
                  </Typography>
                </Box>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Hướng camera vào mã QR động của sinh viên hoặc ban tổ chức.
            </Typography>
          </Box>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <Box sx={{ maxWidth: 480, mx: 'auto' }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('attendance.qrData') || 'Dữ liệu mã QR'}
              placeholder='{"eventId":"...","token":"..."}'
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<CheckCircle />}
              onClick={() => processQrCode(qrData)}
              disabled={loading || !qrData.trim()}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {loading ? 'Đang xử lý...' : (t('attendance.checkIn') || 'Xác nhận Điểm danh')}
            </Button>
          </Box>
        )}

        {/* Success Card Notification */}
        {lastAttendance && (
          <Card sx={{ mt: 3, bgcolor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <CheckCircle color="success" sx={{ fontSize: 36 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700} color="success.dark">
                    Điểm danh thành công!
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(lastAttendance.scannedAt).toLocaleTimeString('vi-VN')}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Người tham gia:</strong> {lastAttendance.userFullName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {lastAttendance.userEmail}
                </Typography>
                <Typography variant="body2">
                  <strong>Sự kiện:</strong> {lastAttendance.eventTitle}
                </Typography>
                <Typography variant="body2">
                  <strong>Trạng thái:</strong> {lastAttendance.status} {lastAttendance.isLate && '(Đi trễ)'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Scan History in Current Session */}
        {recentScans.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History fontSize="small" /> Lịch sử quét gần đây ({recentScans.length})
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
              <List disablePadding>
                {recentScans.map((scan, idx) => (
                  <React.Fragment key={`${scan.id}-${idx}`}>
                    {idx > 0 && <Divider />}
                    <ListItem sx={{ py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32, fontSize: '0.85rem' }}>
                          ✓
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="subtitle2" fontWeight={700}>{scan.userFullName}</Typography>}
                        secondary={`${scan.userEmail} · ${new Date(scan.scannedAt).toLocaleTimeString('vi-VN')}`}
                      />
                      <Chip label="Đã điểm danh" color="success" size="small" variant="outlined" />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AttendanceScannerPage;
