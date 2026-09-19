import React from 'react';
import { IconButton, Stack, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { closeSnackbar, type SnackbarKey } from 'notistack';
import { useTranslation } from 'react-i18next';

/** Close one snackbar (X) + optional dismiss-all for stacked toasts. */
export const SnackbarActions: React.FC<{ snackbarId: SnackbarKey }> = ({ snackbarId }) => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ pr: 0.5 }}>
      <Button
        size="small"
        color="inherit"
        onClick={() => closeSnackbar()}
        sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 0, px: 1 }}
      >
        {t('common.dismissAll')}
      </Button>
      <IconButton
        size="small"
        aria-label={t('common.close')}
        color="inherit"
        onClick={() => closeSnackbar(snackbarId)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
};

export default SnackbarActions;
