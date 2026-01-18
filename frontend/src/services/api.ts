import axios from 'axios';

// Replace with your Firebase Function URL for local emulator or deployed function
// Example for local emulator: http://localhost:5001/YOUR_PROJECT_ID/us-central1/sendTestNotification
// Example for deployed: https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/sendTestNotification
// For now, use an environment variable that needs to be set.
const FIREBASE_FUNCTION_BASE_URL =
  import.meta.env.VITE_FCM_FUNCTION_URL || 'http://localhost:5001/c2-test-1786d/us-central1';

export const sendFCMNotification = async (payload: any) => {
  try {
    const response = await axios.post(`${FIREBASE_FUNCTION_BASE_URL}/sendTestNotification`, payload);
    return response.data;
  } catch (error: any) {
    console.error('API call failed:', error.response?.data || error.message);
    throw error;
  }
};
