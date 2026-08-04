import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import { Translate } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, type AppLanguage } from '@/i18n';

interface LanguageSwitcherProps {
  compact?: boolean;
  color?: 'inherit' | 'primary' | 'default';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false, color = 'inherit' }) => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const current =
    SUPPORTED_LANGS.find((l) => i18n.language?.toLowerCase().startsWith(l.code)) ?? SUPPORTED_LANGS[0];

  const changeLanguage = async (code: AppLanguage) => {
    await i18n.changeLanguage(code);
    localStorage.setItem('huflit.lang', code);
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        color={color === 'default' ? 'inherit' : color}
        size="small"
        startIcon={<Translate fontSize="small" />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label={t('common.language')}
        sx={{
          textTransform: 'none',
          minWidth: compact ? 0 : undefined,
          fontWeight: 700,
          color: color === 'inherit' ? 'inherit' : undefined,
        }}
      >
        {compact ? current.short : `${current.flag} ${current.short}`}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem disabled>
          <Typography variant="caption" color="text.secondary">
            {t('common.language')}
          </Typography>
        </MenuItem>
        {SUPPORTED_LANGS.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={lang.code === current.code}
            onClick={() => void changeLanguage(lang.code)}
          >
            <ListItemText
              primary={`${lang.flag}  ${lang.label}`}
              secondary={lang.short}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
