import { Container, Typography, Paper, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationForm from './components/NotificationForm';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF9800',
    },
    secondary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <NotificationsActiveIcon color="primary" fontSize="large" />
            <Typography variant="h5" component="h1">
              FCM Notification Sender
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Send test notifications by device token, topic, or condition using Firebase Cloud Messaging.
          </Typography>

          {/* Form */}
          <NotificationForm />
        </Paper>

        {/* Footer */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
          FCM Test Tool - Development Use Only
        </Typography>
      </Container>
    </ThemeProvider>
  );
}

export default App;
