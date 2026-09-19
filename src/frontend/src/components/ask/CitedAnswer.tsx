import React from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { parseCitedAnswer } from '@/utils/citations';

interface CitedAnswerProps {
  text: string;
  sourceCount: number;
  activeIndex?: number | null;
  onCiteClick?: (index: number) => void;
}

/**
 * Renders assistant text with clickable [n] citation badges (Perplexity / enterprise-rag style).
 */
export const CitedAnswer: React.FC<CitedAnswerProps> = ({
  text,
  sourceCount,
  activeIndex = null,
  onCiteClick,
}) => {
  const parts = parseCitedAnswer(text);

  return (
    <Typography
      component="div"
      variant="body1"
      sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, wordBreak: 'break-word' }}
    >
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return <React.Fragment key={`t-${i}`}>{part.value}</React.Fragment>;
        }

        const valid = part.index >= 1 && part.index <= sourceCount;
        const active = activeIndex === part.index;

        if (!valid || !onCiteClick) {
          return (
            <Box
              key={`c-${i}`}
              component="span"
              sx={{
                display: 'inline',
                mx: 0.25,
                color: 'text.secondary',
                fontSize: '0.8em',
                fontWeight: 600,
              }}
            >
              [{part.index}]
            </Box>
          );
        }

        return (
          <ButtonBase
            key={`c-${i}`}
            component="span"
            onClick={() => onCiteClick(part.index)}
            aria-label={`Citation ${part.index}`}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              verticalAlign: 'baseline',
              mx: 0.35,
              px: 0.6,
              py: 0.1,
              minWidth: 22,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 700,
              lineHeight: 1.4,
              border: '1px solid',
              borderColor: active ? 'primary.main' : 'primary.light',
              bgcolor: active ? 'primary.main' : 'action.hover',
              color: active ? 'primary.contrastText' : 'primary.main',
              transition: 'background-color 0.2s, color 0.2s, box-shadow 0.2s',
              boxShadow: active ? 2 : 0,
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              },
            }}
          >
            {part.index}
          </ButtonBase>
        );
      })}
    </Typography>
  );
};

export default CitedAnswer;
