/** Split assistant text into plain segments and citation markers like [1], [2]. */
export type AnswerPart =
  | { type: 'text'; value: string }
  | { type: 'cite'; index: number };

const CITE_RE = /\[(\d+)\]/g;

export function parseCitedAnswer(text: string): AnswerPart[] {
  const parts: AnswerPart[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(CITE_RE);
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', value: text.slice(last, match.index) });
    }
    parts.push({ type: 'cite', index: Number(match[1]) });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push({ type: 'text', value: text.slice(last) });
  }
  return parts.length ? parts : [{ type: 'text', value: text }];
}

/** Collect unique citation indices that appear in the answer and exist in sources. */
export function citedIndicesInAnswer(text: string, sourceCount: number): number[] {
  const found = new Set<number>();
  const re = new RegExp(CITE_RE);
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const n = Number(match[1]);
    if (n >= 1 && n <= sourceCount) found.add(n);
  }
  return [...found].sort((a, b) => a - b);
}

export function formatSourceTitle(path: string, fallback: string): string {
  if (!path?.trim()) return fallback;
  const cleaned = path.replace(/\\/g, '/');
  const base = cleaned.split('/').pop() || cleaned;
  return base.replace(/\.(md|txt|pdf|docx|html|json|csv)$/i, '') || fallback;
}

export function confidenceLabel(score: number): { key: 'high' | 'medium' | 'low'; pct: number } {
  // Hybrid/RRF scores are not always 0–1; treat relative bands gently.
  const pct = Math.max(0, Math.min(100, Math.round(score * 100)));
  if (score >= 0.55 || pct >= 55) return { key: 'high', pct };
  if (score >= 0.25 || pct >= 25) return { key: 'medium', pct };
  return { key: 'low', pct };
}
