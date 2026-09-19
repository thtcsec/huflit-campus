import React, { useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, NotificationProvider } from '@/contexts';
import { ColorModeContext } from '@/theme/ColorModeContext';
import { createAppTheme } from '@/theme/theme';
import AppRouter from '@/routes';
import { SnackbarActions } from '@/components/common/SnackbarActions';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as 'light' | 'dark') || 'light';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={4}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            action={(snackbarId) => <SnackbarActions snackbarId={snackbarId} />}
          >
            <AuthProvider>
              <NotificationProvider>
                <AppRouter />
              </NotificationProvider>
            </AuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
