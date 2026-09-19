import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  ExpandLess,
  ExpandMore,
  Send as SendIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { askApi, type AskSource } from '@/api';
import { PageHeader } from '@/components/common';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  sources?: AskSource[];
  abstained?: boolean;
  notice?: string | null;
}

const SUGGESTION_KEYS = [
  'ask.suggestions.registration',
  'ask.suggestions.tuition',
  'ask.suggestions.campus',
  'ask.suggestions.documents',
] as const;

export const AskPage: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [ragOk, setRagOk] = useState<boolean | null>(null);
  const [healthMessage, setHealthMessage] = useState('');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await askApi.health();
        if (cancelled) return;
        setRagOk(data.enabled && data.ragReachable);
        setHealthMessage(data.message);
      } catch {
        if (cancelled) return;
        setRagOk(false);
        setHealthMessage(t('ask.healthUnavailable'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  // Scroll only inside the chat panel — never the whole page.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const suggestions = useMemo(
    () => SUGGESTION_KEYS.map((key) => t(key)),
    [t]
  );

  const sendQuery = async (raw: string) => {
    const query = raw.trim();
    if (!query || sending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const { data } = await askApi.query({ query, sessionId });
      const assistant: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer || data.message || t('ask.emptyAnswer'),
        sources: data.sources ?? [],
        abstained: data.abstained,
        notice: data.message,
      };
      setMessages((prev) => [...prev, assistant]);
      setRagOk(true);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        t('ask.errorQuery');
      enqueueSnackbar(detail, { variant: 'error' });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: detail,
          abstained: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const toggleSources = (id: string) => {
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <PageHeader
        title={t('ask.title')}
        subtitle={t('ask.subtitle')}
        breadcrumbs={[
          { label: t('common.home'), path: '/' },
          { label: t('ask.title') },
        ]}
      />

      {ragOk === false && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {healthMessage || t('ask.healthUnavailable')}
        </Alert>
      )}

      <Alert
        icon={<VerifiedIcon fontSize="inherit" />}
        severity="info"
        sx={{ mb: 2 }}
      >
        {t('ask.trustNotice')}
      </Alert>

      {messages.length === 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          {suggestions.map((text) => (
            <Chip
              key={text}
              label={text}
              clickable
              onClick={() => sendQuery(text)}
              icon={<AutoAwesomeIcon />}
              variant="outlined"
            />
          ))}
        </Stack>
      )}

      <Paper
        ref={listRef}
        variant="outlined"
        sx={{
          p: 2,
          minHeight: 360,
          maxHeight: '55vh',
          overflowY: 'auto',
          mb: 2,
          bgcolor: 'background.default',
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <AutoAwesomeIcon sx={{ fontSize: 40, mb: 1, opacity: 0.6 }} />
            <Typography>{t('ask.emptyState')}</Typography>
          </Box>
        )}

        <Stack spacing={2} sx={{ display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '92%',
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                  color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  border: msg.role === 'assistant' ? 1 : 0,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>

                {msg.role === 'assistant' && msg.abstained && msg.notice && (
                  <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                    {msg.notice}
                  </Typography>
                )}

                {msg.role === 'assistant' && !!msg.sources?.length && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      color="inherit"
                      endIcon={expandedSources[msg.id] ? <ExpandLess /> : <ExpandMore />}
                      onClick={() => toggleSources(msg.id)}
                      sx={{ px: 0 }}
                    >
                      {t('ask.sources', { count: msg.sources.length })}
                    </Button>
                    <Collapse in={!!expandedSources[msg.id]}>
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        {msg.sources.map((src, idx) => (
                          <Paper key={`${msg.id}-${idx}`} variant="outlined" sx={{ p: 1.25 }}>
                            <Typography variant="caption" color="text.secondary">
                              [{idx + 1}] {src.source || t('ask.unknownSource')} · score{' '}
                              {src.score.toFixed(3)}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {src.text.length > 280 ? `${src.text.slice(0, 280)}…` : src.text}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Collapse>
                  </Box>
                )}
              </Paper>
            </Box>
          ))}
          {sending && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
              <CircularProgress size={16} />
              <Typography variant="body2">{t('ask.thinking')}</Typography>
            </Stack>
          )}
        </Stack>
      </Paper>

      <Stack direction="row" spacing={1} alignItems="flex-end">
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={t('ask.placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void sendQuery(input);
            }
          }}
          disabled={sending}
        />
        <IconButton
          color="primary"
          onClick={() => void sendQuery(input)}
          disabled={sending || !input.trim()}
          aria-label={t('ask.send')}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { bgcolor: 'primary.dark' },
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
          }}
        >
          {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Stack>
    </Container>
  );
};

export default AskPage;
