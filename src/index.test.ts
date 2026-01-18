import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions'; // Re-adding the import for type assertions
const fft = require('firebase-functions-test');
import { sendTestNotification } from './index'; // Adjust path if needed

// Initialize firebase-functions-test
const ftest = fft(); // Corrected call

// Mock admin.initializeApp to prevent actual Firebase initialization during tests
const mockInitializeApp = jest.spyOn(admin, 'initializeApp').mockImplementation(() => admin.app());

// Mock admin.messaging().send()
const mockSend = jest.fn();
// Mock admin.messaging() to return our mockSend function
jest.spyOn(admin, 'messaging').mockImplementation(() => ({
  send: mockSend,
}) as any); // Type assertion to bypass strict typing for mock

describe('sendTestNotification', () => {
  // Helper to create mock request
  const getMockReq = (method: string, body: any, headers?: Record<string, string>): functions.https.Request => ({
    method,
    body,
    headers: { origin: 'http://localhost:3000', ...headers } as any, // Default origin for CORS
    // Add other properties that might be accessed by functions if needed
  }) as functions.https.Request;

  // Helper to create mock response
  const getMockRes = () => {
    const res: any = {
      statusCode: 200, // Default status code
      status: jest.fn(function(code) {
        this.statusCode = code;
        return this;
      }).mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      setHeader: jest.fn(),
      getHeader: jest.fn(),
      removeHeader: jest.fn(),
      end: jest.fn(function() { /* Mock end behavior */ }),
      writeHead: jest.fn(function(code, headers) { // Mock writeHead
        this.statusCode = code;
        if (headers) {
          Object.keys(headers).forEach(key => this.setHeader(key, headers[key]));
        }
      }),
    };
    return res as any;
  };

  afterAll(() => {
    // Clean up
    ftest.cleanup();
    mockInitializeApp.mockRestore();
    mockSend.mockRestore();
  });

  beforeEach(() => {
    // Reset mock before each test
    mockSend.mockClear();
    mockSend.mockResolvedValue('projects/test-project/messages/test-message-id'); // Default successful send
  });

  // Test Case 1: Successful notification with minimal payload
  test('should send a notification with token, title, and body successfully', async () => {
    const req = getMockReq('POST', {
      token: 'test_device_token',
      notification: {
        title: 'Test Title',
        body: 'Test Body',
      },
    });
    const res = getMockRes();

    await sendTestNotification(req, res);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      token: 'test_device_token',
      notification: {
        title: 'Test Title',
        body: 'Test Body',
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Successfully sent message',
      messageId: 'projects/test-project/messages/test-message-id',
    });
  });

  // Test Case 2: Successful notification with data payload
  test('should send a notification with data payload successfully', async () => {
    const req = getMockReq('POST', {
      token: 'test_device_token_data',
      data: {
        key1: 'value1',
        key2: 'value2',
      },
    });
    const res = getMockRes();

    await sendTestNotification(req, res);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      token: 'test_device_token_data',
      data: {
        key1: 'value1',
        key2: 'value2',
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Successfully sent message',
      messageId: 'projects/test-project/messages/test-message-id',
    });
  });

  // Test Case 3: Successful notification with extraOptions (android)
  test('should send a notification with extraOptions for android successfully', async () => {
    const req = getMockReq('POST', {
      token: 'test_device_token_android',
      notification: {
        title: 'Android Title',
        body: 'Android Body',
      },
      extraOptions: {
        android: {
          priority: 'high',
          ttl: '3600s',
        },
      },
    });
    const res = getMockRes();

    await sendTestNotification(req, res);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      token: 'test_device_token_android',
      notification: {
        title: 'Android Title',
        body: 'Android Body',
      },
      android: {
        priority: 'high',
        ttl: '3600s',
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Successfully sent message',
      messageId: 'projects/test-project/messages/test-message-id',
    });
  });

  // Test Case 4: Missing target
  test('should return 400 if target is missing', async () => {
    const req = getMockReq('POST', {
      notification: {
        title: 'Test Title',
        body: 'Test Body',
      },
    });
    const res = getMockRes();

    await sendTestNotification(req, res);

    expect(mockSend).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Validation failed',
      error: 'Exactly one target is required: provide a non-empty "token", "topic", or "condition" field.',
    }));
  });

  // Test Case 5: Invalid token type
  test('should return 400 if token is not a string', async () => {
    const req = getMockReq('POST', {
      token: 12345, // Invalid type
      notification: {
        title: 'Test Title',
        body: 'Test Body',
      },
    });
    const res = getMockRes();

    await sendTestNotification(req, res);

    expect(mockSend).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Validation failed',
      error: 'Exactly one target is required: provide a non-empty "token", "topic", or "condition" field.',
    }));
  });

  // Test Case 6: Invalid data payload value type (not string)
  test('should return 400 if data payload value is not a string', async () => {
    const req = getMockReq('POST', {
      token: 'test_token',
      data: {
        key1: 'value1',
        key2: 123, // Invalid type
      },
    });
    const res = getMockRes();

    await sendTestNotification(req, res);

    expect(mockSend).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Validation failed',
      error: '"data.key2" must be a string. FCM data payload only accepts string values.',
    }));
  });

  // Test Case 7: Method not allowed (GET request)
  test('should return 405 for GET requests', async () => {
    const req = getMockReq('GET', {
      token: 'any_token',
    });
    const res = getMockRes();

    await sendTestNotification(req, res);

    expect(mockSend).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Method not allowed. Use POST.',
    });
  });

  // Test Case 8: Successful notification with topic
  test('should send a notification with topic successfully', async () => {
    const req = getMockReq('POST', {
      topic: 'news',
      notification: {
        title: 'Topic Title',
        body: 'Topic Body',
      },
    });
    const res = getMockRes();

    await sendTestNotification(req, res);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      topic: 'news',
      notification: {
        title: 'Topic Title',
        body: 'Topic Body',
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Successfully sent message',
      messageId: 'projects/test-project/messages/test-message-id',
    });
  });

  // Test Case 9: FCM send failure
  test('should return 500 if FCM send fails', async () => {
    mockSend.mockRejectedValue(new Error('FCM send error')); // Simulate FCM error

    const req = getMockReq('POST', {
      token: 'test_device_token_error',
      notification: {
        title: 'Error Test',
        body: 'This should fail',
      },
    });
    const res = getMockRes();

    await sendTestNotification(req, res);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Failed to send notification',
      error: 'FCM send error',
    }));
  });

  // Test Case 10: OPTIONS preflight request
  test('should handle OPTIONS preflight request with 204 status', async () => {
    const req = getMockReq('OPTIONS', {}, { // Empty body for OPTIONS
        origin: 'http://localhost:3000',
        'access-control-request-method': 'POST',
    });
    const res = getMockRes();

    await sendTestNotification(req, res);

    // For OPTIONS requests, cors handles the response directly.
    // expect(res.status).toHaveBeenCalledWith(204); // cors might not call res.status directly for 204
    expect(res.statusCode).toBe(204); // Check statusCode directly
    expect(res.send).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
  });
});
