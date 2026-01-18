import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';

// Service Account 初始化
import * as serviceAccount from './c2-test-1786d-firebase-adminsdk-fbsvc-113fffd13d.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

// Log active project id on startup to verify emulator target
const projectId =
  (serviceAccount as { project_id?: string }).project_id || admin.app().options.projectId || 'unknown';
console.log(`✅ Firebase project id: ${projectId}`);

// CORS 設定 - 開發環境允許 localhost
const corsHandler = cors({ origin: true });

// 定義請求 Body 的介面
interface NotificationPayload {
  token?: string;
  topic?: string;
  condition?: string;
  notification?: {
    title?: string;
    body?: string;
    imageUrl?: string;
  };
  data?: Record<string, string>;
  extraOptions?: {
    android?: admin.messaging.AndroidConfig;
    webpush?: admin.messaging.WebpushConfig;
    apns?: admin.messaging.ApnsConfig;
  };
}

// 輸入驗證函數
function validatePayload(body: unknown): { valid: boolean; error?: string; payload?: NotificationPayload } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object' };
  }

  const payload = body as NotificationPayload;

  // 驗證必要欄位: token/topic/condition 三擇一
  const targetFields = [
    ['token', payload.token],
    ['topic', payload.topic],
    ['condition', payload.condition],
  ] as const;
  const providedTargets = targetFields.filter(([, value]) => typeof value === 'string' && value.trim() !== '');
  if (providedTargets.length !== 1) {
    return {
      valid: false,
      error:
        'Exactly one target is required: provide a non-empty "token", "topic", or "condition" field.',
    };
  }
  for (const [key, value] of targetFields) {
    if (value !== undefined && (typeof value !== 'string' || value.trim() === '')) {
      return { valid: false, error: `"${key}" must be a non-empty string.` };
    }
  }

  // 驗證 notification 欄位（如果存在）
  if (payload.notification !== undefined) {
    if (typeof payload.notification !== 'object') {
      return { valid: false, error: '"notification" must be an object' };
    }
    if (payload.notification.title !== undefined && typeof payload.notification.title !== 'string') {
      return { valid: false, error: '"notification.title" must be a string' };
    }
    if (payload.notification.body !== undefined && typeof payload.notification.body !== 'string') {
      return { valid: false, error: '"notification.body" must be a string' };
    }
    if (payload.notification.imageUrl !== undefined && typeof payload.notification.imageUrl !== 'string') {
      return { valid: false, error: '"notification.imageUrl" must be a string' };
    }
  }

  // 驗證 data 欄位（如果存在）- 必須是 key-value 都是 string 的物件
  if (payload.data !== undefined) {
    if (typeof payload.data !== 'object' || Array.isArray(payload.data)) {
      return { valid: false, error: '"data" must be an object with string key-value pairs' };
    }
    for (const [key, value] of Object.entries(payload.data)) {
      if (typeof value !== 'string') {
        return { valid: false, error: `"data.${key}" must be a string. FCM data payload only accepts string values.` };
      }
    }
  }

  // 驗證 extraOptions 欄位（如果存在）
  if (payload.extraOptions !== undefined) {
    if (typeof payload.extraOptions !== 'object') {
      return { valid: false, error: '"extraOptions" must be an object' };
    }
  }

  return { valid: true, payload };
}

export const sendTestNotification = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // 只允許 POST 方法
    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        message: 'Method not allowed. Use POST.',
      });
      return;
    }

    // 驗證輸入
    const validation = validatePayload(req.body);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: validation.error,
      });
      return;
    }

    const payload = validation.payload!;

    // 組裝 FCM Message 物件（扣除目標欄位）
    type BaseMessage = Omit<admin.messaging.Message, 'token' | 'topic' | 'condition'>;
    const baseMessage: BaseMessage = {};

    // 加入 notification payload（如果有）
    if (payload.notification) {
      baseMessage.notification = {};
      if (payload.notification.title) {
        baseMessage.notification.title = payload.notification.title;
      }
      if (payload.notification.body) {
        baseMessage.notification.body = payload.notification.body;
      }
      if (payload.notification.imageUrl) {
        baseMessage.notification.imageUrl = payload.notification.imageUrl;
      }
    }

    // 加入 data payload（如果有）
    if (payload.data && Object.keys(payload.data).length > 0) {
      baseMessage.data = payload.data;
    }

    // 加入平台特定選項（如果有）
    if (payload.extraOptions) {
      if (payload.extraOptions.android) {
        baseMessage.android = payload.extraOptions.android;
      }
      if (payload.extraOptions.webpush) {
        baseMessage.webpush = payload.extraOptions.webpush;
      }
      if (payload.extraOptions.apns) {
        baseMessage.apns = payload.extraOptions.apns;
      }
    }

    let message: admin.messaging.Message;
    if (payload.token) {
      message = { token: payload.token.trim(), ...baseMessage };
    } else if (payload.topic) {
      message = { topic: payload.topic.trim(), ...baseMessage };
    } else {
      message = { condition: payload.condition!.trim(), ...baseMessage };
    }

    try {
      const response = await admin.messaging().send(message);
      console.log('✅ Successfully sent message:', response);
      res.status(200).json({
        success: true,
        message: 'Successfully sent message',
        messageId: response,
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: errorMessage,
      });
    }
  });
});
