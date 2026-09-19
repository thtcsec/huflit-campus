import React, { useEffect, useRef } from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { AskSource } from '@/api';
import { confidenceLabel, formatSourceTitle } from '@/utils/citations';

interface SourceCardsProps {
  messageId: string;
  sources: AskSource[];
  highlightedIndex: number | null;
  unknownSourceLabel: string;
  confidenceLabels: { high: string; medium: string; low: string };
}

export const SourceCards: React.FC<SourceCardsProps> = ({
  messageId,
  sources,
  highlightedIndex,
  unknownSourceLabel,
  confidenceLabels,
}) => {
  const refs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (highlightedIndex == null) return;
    const el = refs.current[highlightedIndex];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [highlightedIndex]);

  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      {sources.map((src, idx) => {
        const n = idx + 1;
        const active = highlightedIndex === n;
        const conf = confidenceLabel(src.score ?? 0);
        const title = formatSourceTitle(src.source, unknownSourceLabel);

        return (
          <Paper
            key={`${messageId}-src-${n}`}
            ref={(node) => {
              refs.current[n] = node;
            }}
            variant="outlined"
            id={`${messageId}-src-${n}`}
            sx={{
              p: 1.25,
              borderWidth: 1.5,
              borderColor: active ? 'primary.main' : 'divider',
              bgcolor: active ? 'action.selected' : 'background.paper',
              boxShadow: active ? 3 : 0,
              transition: 'border-color 0.25s, background-color 0.25s, box-shadow 0.25s',
              animation: active ? 'askCitePulse 1.2s ease-out 1' : 'none',
              '@keyframes askCitePulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.45)' },
                '70%': { boxShadow: '0 0 0 8px rgba(25, 118, 210, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' },
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
              sx={{ mb: 0.5 }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                [{n}] {title}
              </Typography>
              <Chip
                size="small"
                label={confidenceLabels[conf.key]}
                color={conf.key === 'high' ? 'success' : conf.key === 'medium' ? 'warning' : 'default'}
                variant="outlined"
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
            </Stack>
            {src.source && src.source !== title && (
              <Typography
                variant="caption"
                color="text.disabled"
                display="block"
                sx={{ mb: 0.5, wordBreak: 'break-all' }}
              >
                {src.source}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {src.text.length > 320 ? `${src.text.slice(0, 320)}…` : src.text}
            </Typography>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default SourceCards;
