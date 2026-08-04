import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Translate, Check } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, type AppLanguage } from '@/i18n';

interface LanguageSwitcherProps {
  compact?: boolean;
  color?: 'inherit' | 'primary' | 'default';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false, color = 'inherit' }) => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const normalized = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase();
  const current =
    SUPPORTED_LANGS.find((l) => normalized === l.code || normalized.startsWith(`${l.code}-`)) ??
    SUPPORTED_LANGS[0];

  const changeLanguage = async (code: AppLanguage) => {
    await i18n.changeLanguage(code);
    localStorage.setItem('huflit.lang', code);
    document.documentElement.lang = code;
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
        aria-haspopup="menu"
        sx={{
          textTransform: 'none',
          minWidth: compact ? 64 : 96,
          fontWeight: 700,
          color: color === 'inherit' ? 'inherit' : undefined,
        }}
      >
        {current.flag} {current.short}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled dense>
          <Typography variant="caption" color="text.secondary">
            {t('common.language')} — EN / VI / 中文 / 日本語
          </Typography>
        </MenuItem>
        {SUPPORTED_LANGS.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={lang.code === current.code}
            onClick={() => void changeLanguage(lang.code)}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {lang.code === current.code ? <Check fontSize="small" color="primary" /> : <span>{lang.flag}</span>}
            </ListItemIcon>
            <ListItemText primary={lang.label} secondary={lang.short} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
