import React from 'react';
import { Chip } from '@mui/material';
import { EventStatus } from '@/types';

const statusConfig: Record<EventStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
  [EventStatus.Draft]: { label: 'Draft', color: 'default' },
  [EventStatus.PendingApproval]: { label: 'Pending', color: 'warning' },
  [EventStatus.Approved]: { label: 'Approved', color: 'info' },
  [EventStatus.Rejected]: { label: 'Rejected', color: 'error' },
  [EventStatus.Published]: { label: 'Published', color: 'success' },
  [EventStatus.Cancelled]: { label: 'Cancelled', color: 'error' },
  [EventStatus.RegistrationClosed]: { label: 'Registration Closed', color: 'warning' },
  [EventStatus.Completed]: { label: 'Completed', color: 'default' },
};

interface StatusChipProps {
  status: EventStatus;
  size?: 'small' | 'medium';
}

const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  const config = statusConfig[status];
  return <Chip label={config.label} color={config.color} size={size} />;
};

export default StatusChip;
