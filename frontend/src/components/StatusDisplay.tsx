import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export interface StatusResult {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

interface StatusDisplayProps {
  result: StatusResult | null;
}

export default function StatusDisplay({ result }: StatusDisplayProps) {
  if (!result) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Alert
        severity={result.success ? 'success' : 'error'}
        icon={result.success ? <CheckCircleIcon /> : <ErrorIcon />}
      >
        <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
        <Typography variant="body2">{result.message}</Typography>
        {result.success && result.messageId && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', wordBreak: 'break-all' }}>
            <strong>Message ID:</strong> {result.messageId}
          </Typography>
        )}
        {!result.success && result.error && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'error.dark' }}>
            <strong>Details:</strong> {result.error}
          </Typography>
        )}
      </Alert>
    </Box>
  );
}
