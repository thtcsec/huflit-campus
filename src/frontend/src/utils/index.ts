export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const d = new Date(date);
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return `${formatDate(d, 'short')} at ${formatDate(d, 'time')}`;
};

export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(past);
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const shareEvent = async (title: string, url: string): Promise<void> => {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch (error) {
      console.error('Share failed:', error);
    }
  } else {
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  }
};

export const getTimeUntil = (futureDate: string | Date): { days: number; hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const future = new Date(futureDate);
  const diffMs = future.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return { days, hours, minutes, seconds };
};
