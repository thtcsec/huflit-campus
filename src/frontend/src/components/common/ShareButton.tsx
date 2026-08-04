import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Share as ShareIcon } from '@mui/icons-material';
import { shareEvent } from '@/utils';

interface ShareButtonProps {
  title: string;
  url: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, url }) => {
  const handleShare = async () => {
    await shareEvent(title, url);
  };

  return (
    <Tooltip title="Share">
      <IconButton onClick={handleShare} color="primary">
        <ShareIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ShareButton;
