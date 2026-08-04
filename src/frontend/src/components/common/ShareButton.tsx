import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Share as ShareIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { shareEvent } from '@/utils';

interface ShareButtonProps {
  title: string;
  url: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, url }) => {
  const { t } = useTranslation();
  const handleShare = async () => {
    await shareEvent(title, url);
  };

  return (
    <Tooltip title={t('events.share')}>
      <IconButton onClick={handleShare} color="primary">
        <ShareIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ShareButton;
