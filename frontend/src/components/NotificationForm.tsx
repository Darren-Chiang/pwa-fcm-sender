import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { sendFCMNotification } from '../services/api'; // Assuming this service will be created later

interface NotificationFormState {
  targetType: 'token' | 'topic' | 'condition';
  token: string;
  topic: string;
  condition: string;
  title: string;
  body: string;
  imageUrl: string;
  balanceUpdateType: 'NONE' | 'BALANCE_UPDATE';
  balance: string;
  totalMainProviderBalance: string;
  mainWallet: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING' | 'PENDING' | 'INFO';
  data: string; // JSON string for data payload
  extraOptions: string; // JSON string for platform specific options
}

const NotificationForm: React.FC = () => {
  const [formData, setFormData] = useState<NotificationFormState>({
    targetType: 'token',
    token: '',
    topic: '',
    condition: '',
    title: '',
    body: '',
    imageUrl: '',
    balanceUpdateType: 'NONE',
    balance: '',
    totalMainProviderBalance: '',
    mainWallet: '',
    status: 'SUCCESS',
    data: '{}',
    extraOptions: '{}',
  });
  const [responseMessage, setResponseMessage] = useState<{ success: boolean; message: string; messageId?: string; error?: any } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('fcmSender.token');
    if (savedToken) {
      setFormData((prev) => ({ ...prev, token: savedToken }));
    }
    const savedTargetType = localStorage.getItem('fcmSender.targetType');
    if (savedTargetType === 'token' || savedTargetType === 'topic' || savedTargetType === 'condition') {
      setFormData((prev) => ({ ...prev, targetType: savedTargetType }));
    }
    const savedTopic = localStorage.getItem('fcmSender.topic');
    if (savedTopic) {
      setFormData((prev) => ({ ...prev, topic: savedTopic }));
    }
    const savedCondition = localStorage.getItem('fcmSender.condition');
    if (savedCondition) {
      setFormData((prev) => ({ ...prev, condition: savedCondition }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'token') {
      localStorage.setItem('fcmSender.token', value);
    }
    if (name === 'topic') {
      localStorage.setItem('fcmSender.topic', value);
    }
    if (name === 'condition') {
      localStorage.setItem('fcmSender.condition', value);
    }
  };

  const handleTargetTypeChange = (value: 'token' | 'topic' | 'condition') => {
    setFormData((prev) => ({ ...prev, targetType: value }));
    localStorage.setItem('fcmSender.targetType', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage(null);

    try {
      const payload: any = {};

      if (formData.targetType === 'token') {
        payload.token = formData.token;
      }
      if (formData.targetType === 'topic') {
        payload.topic = formData.topic;
      }
      if (formData.targetType === 'condition') {
        payload.condition = formData.condition;
      }

      const hasNotificationFields = Boolean(formData.title || formData.body || formData.imageUrl);
      if (hasNotificationFields) {
        payload.notification = {};
        if (formData.title) payload.notification.title = formData.title;
        if (formData.body) payload.notification.body = formData.body;
        if (formData.imageUrl) payload.notification.imageUrl = formData.imageUrl;
      }

      // Parse data payload
      const dataPayload: Record<string, string> = {};
      if (formData.data && formData.data.trim() !== '{}') {
        try {
          const parsedData = JSON.parse(formData.data);
          if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
            for (const key in parsedData) {
              dataPayload[key] = typeof parsedData[key] === 'string' ? parsedData[key] : String(parsedData[key]);
            }
          }
        } catch (jsonError) {
          setResponseMessage({ success: false, message: 'Invalid JSON for Data Payload', error: jsonError });
          setLoading(false);
          return;
        }
      }

      dataPayload.status = formData.status;
      if (formData.balanceUpdateType === 'BALANCE_UPDATE') {
        dataPayload.type = 'BALANCE_UPDATE';
        if (formData.balance) dataPayload.balance = formData.balance;
        if (formData.totalMainProviderBalance) {
          dataPayload.totalMainProviderBalance = formData.totalMainProviderBalance;
        }
        if (formData.mainWallet) dataPayload.mainWallet = formData.mainWallet;
      }
      if (Object.keys(dataPayload).length > 0) {
        payload.data = dataPayload;
      }

      // Parse extraOptions payload
      if (formData.extraOptions && formData.extraOptions.trim() !== '{}') {
        try {
          payload.extraOptions = JSON.parse(formData.extraOptions);
        } catch (jsonError) {
          setResponseMessage({ success: false, message: 'Invalid JSON for Extra Options', error: jsonError });
          setLoading(false);
          return;
        }
      }
      
      const result = await sendFCMNotification(payload);
      setResponseMessage({ success: true, message: 'Notification sent successfully!', messageId: result.messageId });
    } catch (err: any) {
      console.error('Failed to send notification:', err);
      setResponseMessage({
        success: false,
        message: 'Failed to send notification.',
        error: err.response?.data?.error || err.message || 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <FormControl fullWidth margin="normal">
        <InputLabel id="target-type-label">Target Type</InputLabel>
        <Select
          labelId="target-type-label"
          label="Target Type"
          value={formData.targetType}
          onChange={(e) => handleTargetTypeChange(e.target.value as NotificationFormState['targetType'])}
        >
          <MenuItem value="token">Device Token</MenuItem>
          <MenuItem value="topic">Topic</MenuItem>
          <MenuItem value="condition">Condition</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Device Token"
        name="token"
        value={formData.token}
        onChange={handleChange}
        margin="normal"
        required={formData.targetType === 'token'}
        helperText="The Firebase device token of the target device."
        disabled={formData.targetType !== 'token'}
      />
      <TextField
        fullWidth
        label="Topic"
        name="topic"
        value={formData.topic}
        onChange={handleChange}
        margin="normal"
        required={formData.targetType === 'topic'}
        helperText='Topic name without "/topics/". Example: "news"'
        disabled={formData.targetType !== 'topic'}
      />
      <TextField
        fullWidth
        label="Condition"
        name="condition"
        value={formData.condition}
        onChange={handleChange}
        margin="normal"
        required={formData.targetType === 'condition'}
        helperText='Condition expression. Example: "news" in topics && "sports" in topics'
        disabled={formData.targetType !== 'condition'}
      />
      <TextField
        fullWidth
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        margin="normal"
        helperText="The title of the notification."
      />
      <TextField
        fullWidth
        label="Body"
        name="body"
        value={formData.body}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={3}
        helperText="The main content of the notification."
      />
      <TextField
        fullWidth
        label="Image URL (Optional)"
        name="imageUrl"
        value={formData.imageUrl}
        onChange={handleChange}
        margin="normal"
        helperText="URL of an image to be displayed in the notification (e.g., for webpush)."
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="status-label">Status</InputLabel>
        <Select
          labelId="status-label"
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as NotificationFormState['status'] }))}
        >
          <MenuItem value="SUCCESS">SUCCESS</MenuItem>
          <MenuItem value="FAILURE">FAILURE</MenuItem>
          <MenuItem value="WARNING">WARNING</MenuItem>
          <MenuItem value="PENDING">PENDING</MenuItem>
          <MenuItem value="INFO">INFO</MenuItem>
        </Select>
        <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
          Stored in data.status for receiver UI styling. Default is SUCCESS.
        </Typography>
      </FormControl>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Advanced Options (JSON)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth margin="normal">
            <InputLabel id="balance-update-label">Balance Update Type</InputLabel>
            <Select
              labelId="balance-update-label"
              label="Balance Update Type"
              value={formData.balanceUpdateType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  balanceUpdateType: e.target.value as NotificationFormState['balanceUpdateType'],
                }))
              }
            >
              <MenuItem value="NONE">NONE</MenuItem>
              <MenuItem value="BALANCE_UPDATE">BALANCE_UPDATE</MenuItem>
            </Select>
            <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
              Adds data.type and balance fields for frontend wallet updates.
            </Typography>
          </FormControl>

          <TextField
            fullWidth
            label="Balance"
            name="balance"
            value={formData.balance}
            onChange={handleChange}
            margin="normal"
            helperText='Main balance (string). Example: "1000.50".'
            disabled={formData.balanceUpdateType !== 'BALANCE_UPDATE'}
          />
          <TextField
            fullWidth
            label="Total Main Provider Balance"
            name="totalMainProviderBalance"
            value={formData.totalMainProviderBalance}
            onChange={handleChange}
            margin="normal"
            helperText='Provider balance (string). Example: "200.00".'
            disabled={formData.balanceUpdateType !== 'BALANCE_UPDATE'}
          />
          <TextField
            fullWidth
            label="Main Wallet"
            name="mainWallet"
            value={formData.mainWallet}
            onChange={handleChange}
            margin="normal"
            helperText='Total wallet (string). Example: "1200.50".'
            disabled={formData.balanceUpdateType !== 'BALANCE_UPDATE'}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Data Payload (JSON)"
            name="data"
            value={formData.data}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={5}
            helperText='Custom key-value pairs. All values must be strings. Example: {"key":"value","status":"SUCCESS"}.'
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Platform Specific Options (JSON)"
            name="extraOptions"
            value={formData.extraOptions}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={5}
            helperText='JSON for "android", "webpush", "apns" configurations. Example: {"android":{"priority":"high"}}.'
          />
        </AccordionDetails>
      </Accordion>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {loading ? 'Sending...' : 'Send Notification'}
      </Button>

      {responseMessage && (
        <Alert severity={responseMessage.success ? 'success' : 'error'} sx={{ mt: 2 }}>
          <Typography variant="body2">{responseMessage.message}</Typography>
          {responseMessage.messageId && (
            <Typography variant="caption">Message ID: {responseMessage.messageId}</Typography>
          )}
          {responseMessage.error && typeof responseMessage.error === 'string' && (
            <Typography variant="caption">Error Details: {responseMessage.error}</Typography>
          )}
          {responseMessage.error && typeof responseMessage.error === 'object' && (
            <Typography variant="caption">Error Details: {JSON.stringify(responseMessage.error)}</Typography>
          )}
        </Alert>
      )}
    </Box>
  );
};

export default NotificationForm;
