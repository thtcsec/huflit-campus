import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { askApi, type AskLlmCatalog, type AskLlmSettings } from '@/api';

export interface AskRoutingState {
  provider: string;
  model: string;
  failover: boolean;
}

interface AskLlmAdminPanelProps {
  value: AskRoutingState;
  onChange: (next: AskRoutingState) => void;
}

export const AskLlmAdminPanel: React.FC<AskLlmAdminPanelProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AskLlmSettings | null>(null);
  const [catalog, setCatalog] = useState<AskLlmCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: s } = await askApi.llmSettings();
        if (cancelled) return;
        setSettings(s);
        if (!s.canConfigure) {
          setLoading(false);
          return;
        }
        onChange({
          provider: s.defaultProvider || 'auto',
          model: s.defaultModel || 'auto',
          failover: s.defaultFailover,
        });
        const { data: c } = await askApi.llmCatalog();
        if (cancelled) return;
        setCatalog(c);
        setError(null);
      } catch (err: unknown) {
        if (cancelled) return;
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          t('ask.llm.loadError');
        setError(detail);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per mount for admin panel
  }, [t]);

  const providers = catalog?.providers?.filter((p) => p.enabled) ?? [];
  const models = useMemo(() => {
    const p = providers.find((x) => x.slug === value.provider);
    return (p?.models ?? []).filter((m) => m.enabled);
  }, [providers, value.provider]);

  if (loading) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        {t('ask.llm.loading')}
      </Alert>
    );
  }

  if (!settings?.canConfigure) {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'warning.main',
        bgcolor: 'action.hover',
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        {t('ask.llm.title')}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
        {settings.hint}
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}

      <Collapse in={!!catalog}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="ask-provider-label">{t('ask.llm.provider')}</InputLabel>
            <Select
              labelId="ask-provider-label"
              label={t('ask.llm.provider')}
              value={value.provider}
              onChange={(e) => {
                const provider = e.target.value;
                const p = providers.find((x) => x.slug === provider);
                const firstModel =
                  p?.models?.find((m) => m.isDefault)?.modelId ||
                  p?.models?.[0]?.modelId ||
                  'auto';
                onChange({ ...value, provider, model: firstModel });
              }}
            >
              {providers.map((p) => (
                <MenuItem key={p.slug} value={p.slug} disabled={!p.configured && p.slug !== 'auto'}>
                  {p.displayName || p.slug}
                  {!p.configured && p.slug !== 'auto' ? ' (no key)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="ask-model-label">{t('ask.llm.model')}</InputLabel>
            <Select
              labelId="ask-model-label"
              label={t('ask.llm.model')}
              value={models.some((m) => m.modelId === value.model) ? value.model : models[0]?.modelId || 'auto'}
              onChange={(e) => onChange({ ...value, model: e.target.value })}
            >
              {models.map((m) => (
                <MenuItem key={m.modelId} value={m.modelId}>
                  {m.displayName || m.modelId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={value.failover}
                onChange={(e) => onChange({ ...value, failover: e.target.checked })}
                size="small"
              />
            }
            label={t('ask.llm.failover')}
          />
        </Stack>
        {catalog?.source && (
          <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 1 }}>
            {t('ask.llm.catalogSource', { source: catalog.source })}
          </Typography>
        )}
      </Collapse>
    </Box>
  );
};

export default AskLlmAdminPanel;
