import { createTheme, ThemeOptions, PaletteMode } from '@mui/material/styles';

const huflitColors = {
  red: '#C8102E',
  green: '#1B7A4E',
  yellow: '#F5C518',
  blue: '#1E5AA8',
};

export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: huflitColors.red,
      light: '#E63E58',
      dark: '#9D0C24',
      contrastText: '#fff',
    },
    secondary: {
      main: huflitColors.green,
      light: '#3FA371',
      dark: '#155F3D',
      contrastText: '#fff',
    },
    warning: {
      main: huflitColors.yellow,
      light: '#F7D150',
      dark: '#C49D13',
    },
    info: {
      main: huflitColors.blue,
      light: '#4B7DBA',
      dark: '#174686',
    },
    background: {
      default: mode === 'light' ? '#F8F9FA' : '#121212',
      paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
    },
    text: {
      primary: mode === 'light' ? '#1A1A1A' : '#FFFFFF',
      secondary: mode === 'light' ? '#6B7280' : '#A0A0A0',
    },
  },
  typography: {
    fontFamily: '"Be Vietnam Pro", "Manrope", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: 'Manrope, sans-serif',
      fontWeight: 800,
      fontSize: '3rem',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: 'Manrope, sans-serif',
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: 'Manrope, sans-serif',
      fontWeight: 700,
      fontSize: '1.875rem',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: 'Manrope, sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: 'Manrope, sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: 'Manrope, sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.08)',
    '0px 8px 16px rgba(0,0,0,0.1)',
    '0px 12px 24px rgba(0,0,0,0.12)',
    '0px 16px 32px rgba(0,0,0,0.14)',
    '0px 20px 40px rgba(0,0,0,0.16)',
    ...Array(18).fill('none'),
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '1rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light' 
            ? '0px 2px 8px rgba(0,0,0,0.08)' 
            : '0px 2px 8px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light'
            ? '0px 1px 3px rgba(0,0,0,0.08)'
            : '0px 1px 3px rgba(0,0,0,0.4)',
        },
      },
    },
  },
});

export const createAppTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));
