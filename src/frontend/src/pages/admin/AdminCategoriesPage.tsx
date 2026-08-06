import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { Category, LocationOn, Add } from '@mui/icons-material';

export const AdminCategoriesPage: React.FC = () => {
  const categories = [
    { name: 'Academic (Học thuật)', count: 12, color: 'primary' },
    { name: 'Workshop & Skill', count: 18, color: 'secondary' },
    { name: 'Competition (Cuộc thi)', count: 8, color: 'success' },
    { name: 'Volunteer (Tình nguyện)', count: 6, color: 'info' },
    { name: 'Club Activities (CLB)', count: 15, color: 'warning' },
    { name: 'Sports & Arts (Thể thao - Nghệ thuật)', count: 9, color: 'error' },
  ];

  const campuses = [
    { name: 'Cơ sở 10 Cao Thắng', address: '828 Sư Vạn Hạnh, Phường 13, Quận 10, TP.HCM', capacity: '1,500 sinh viên' },
    { name: 'Cơ sở Hóc Môn', address: 'Tân Hiệp, Hóc Môn, TP.HCM', capacity: '3,000 sinh viên' },
    { name: 'Trực tuyến (Online / Teams)', address: 'Microsoft Teams / Zoom Meeting', capacity: 'Không giới hạn' },
  ];

  return (
    <Container maxWidth="xl" disableGutters>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          Danh mục & Cơ sở Trực thuộc (Categories & Campuses)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý các danh mục phân loại sự kiện và danh sách các cơ sở trường Đại học HUFLIT.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Categories Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Category color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Danh mục Sự kiện (Categories)
                </Typography>
              </Box>
              <Button size="small" startIcon={<Add />}>
                Thêm danh mục
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {categories.map((cat) => (
                <Grid item xs={12} sm={6} key={cat.name}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        {cat.name}
                      </Typography>
                      <Chip label={`${cat.count} sự kiện`} size="small" color={cat.color as any} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Campuses Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="secondary" />
                <Typography variant="h6" fontWeight={700}>
                  Cơ sở Trường (HUFLIT Campuses)
                </Typography>
              </Box>
              <Button size="small" startIcon={<Add />}>
                Thêm cơ sở
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <List disablePadding>
              {campuses.map((cp) => (
                <ListItem key={cp.name} sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon>
                    <LocationOn color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={700}>
                        {cp.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {cp.address} — Sức chứa: <strong>{cp.capacity}</strong>
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminCategoriesPage;
