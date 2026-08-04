import React from 'react';
import { Chip } from '@mui/material';
import { EventCategory } from '@/types';

const categoryColors: Record<EventCategory, string> = {
  [EventCategory.Academic]: '#1E5AA8',
  [EventCategory.Workshop]: '#C8102E',
  [EventCategory.Competition]: '#9D0C24',
  [EventCategory.Volunteer]: '#1B7A4E',
  [EventCategory.Seminar]: '#6B7280',
  [EventCategory.Career]: '#F5C518',
  [EventCategory.Sports]: '#1B7A4E',
  [EventCategory.Arts]: '#9D4EDD',
  [EventCategory.Entertainment]: '#4B7DBA',
  [EventCategory.ClubActivities]: '#FF6B35',
};

interface CategoryChipProps {
  category: EventCategory;
  size?: 'small' | 'medium';
}

const CategoryChip: React.FC<CategoryChipProps> = ({ category, size = 'small' }) => {
  return (
    <Chip
      label={category}
      size={size}
      sx={{
        bgcolor: categoryColors[category],
        color: '#fff',
        fontWeight: 600,
      }}
    />
  );
};

export default CategoryChip;
