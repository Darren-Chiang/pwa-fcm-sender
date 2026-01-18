import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface AdvancedOptionsProps {
  dataPayload: string;
  extraOptions: string;
  onDataPayloadChange: (value: string) => void;
  onExtraOptionsChange: (value: string) => void;
}

function validateJson(value: string): string | null {
  if (!value.trim()) return null;
  try {
    JSON.parse(value);
    return null;
  } catch {
    return 'Invalid JSON format';
  }
}

export default function AdvancedOptions({
  dataPayload,
  extraOptions,
  onDataPayloadChange,
  onExtraOptionsChange,
}: AdvancedOptionsProps) {
  const [dataError, setDataError] = useState<string | null>(null);
  const [extraError, setExtraError] = useState<string | null>(null);

  const handleDataChange = (value: string) => {
    onDataPayloadChange(value);
    setDataError(validateJson(value));
  };

  const handleExtraChange = (value: string) => {
    onExtraOptionsChange(value);
    setExtraError(validateJson(value));
  };

  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Advanced Options</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Data Payload */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Data Payload (JSON)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Custom key-value data. All values must be strings.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={`{\n  "key1": "value1",\n  "key2": "value2"\n}`}
              value={dataPayload}
              onChange={(e) => handleDataChange(e.target.value)}
              error={!!dataError}
              helperText={dataError}
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>

          {/* Extra Options */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Extra FCM Options (JSON)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Platform-specific options (android, webpush, apns).
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder={`{\n  "android": {\n    "priority": "high"\n  },\n  "webpush": {\n    "headers": {\n      "Urgency": "high"\n    }\n  }\n}`}
              value={extraOptions}
              onChange={(e) => handleExtraChange(e.target.value)}
              error={!!extraError}
              helperText={extraError}
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>

          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="caption">
              Refer to{' '}
              <a
                href="https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages"
                target="_blank"
                rel="noopener noreferrer"
              >
                FCM Documentation
              </a>{' '}
              for available options.
            </Typography>
          </Alert>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
