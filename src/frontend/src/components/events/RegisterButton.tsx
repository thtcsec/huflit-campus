import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { registrationsApi } from '@/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';

interface RegisterButtonProps {
  eventId: string;
  isRegistered: boolean;
  remainingSeats: number;
  onUpdate: () => void;
}

const RegisterButton: React.FC<RegisterButtonProps> = ({ eventId, isRegistered, remainingSeats, onUpdate }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await registrationsApi.registerEvent(eventId);
      enqueueSnackbar('Successfully registered for event', { variant: 'success' });
      onUpdate();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Registration failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await registrationsApi.cancelRegistration(eventId);
      enqueueSnackbar('Registration cancelled', { variant: 'info' });
      onUpdate();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to cancel', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <Button
        variant="outlined"
        color="success"
        startIcon={<CheckCircle />}
        onClick={handleCancel}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Registered'}
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleRegister}
      disabled={loading || remainingSeats <= 0}
    >
      {loading ? <CircularProgress size={24} /> : remainingSeats <= 0 ? 'Sold Out' : 'Register Now'}
    </Button>
  );
};

export default RegisterButton;
