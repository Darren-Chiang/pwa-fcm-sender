# Plan: FCM 通知發送器 GUI

## 1. 技術架構 (Technical Architecture)

### 1.1. 技術棧 (Tech Stack)

- **前端 (Frontend)**: React (with Vite) + TypeScript。採用 Material-UI 作為 UI 元件庫以加速開發並確保介面品質。
- **後端 (Backend)**: 維持現有的 Firebase Functions (Node.js + TypeScript)。
- **託管 (Hosting)**:
    - 前端 GUI 部署於 Firebase Hosting。
    - 後端邏輯由 Firebase Functions 提供服務。

### 1.2. 系統流程

1.  **用戶操作**: 使用者在瀏覽器中打開部署於 Firebase Hosting 上的 GUI 網站。
2.  **資料輸入**: 在 React App 中輸入 Token、Title、Body 以及選填的進階 JSON Payload。
3.  **API 請求**: 點擊「發送」後，前端 App 向後端的 `sendTestNotification` Cloud Function 發起一個 `POST` HTTP 請求。
4.  **後端處理**:
    - Cloud Function 透過 `cors` 模組驗證請求來源。
    - 驗證請求 Body 中的參數是否合法。
    - 使用 `firebase-admin` SDK，根據收到的參數組裝 FCM Message 物件。
    - 呼叫 `admin.messaging().send()` 方法將訊息發送出去。
5.  **結果回傳**: Cloud Function 將 FCM 的執行結果（成功或失敗）回傳給前端。
6.  **顯示結果**: 前端 App 接收後端的回應，並在介面上顯示成功或失敗的提示。

## 2. API 設計 (API Design)

後端 `sendTestNotification` 函數將被修改以接收更靈活的 payload。

- **Endpoint**: `POST /sendTestNotification`
- **Request Body**:
  ```json
  {
    "token": "string", // 必要, 設備 Token
    "notification": {  // 可選, 標準通知 payload
      "title": "string",
      "body": "string"
    },
    "data": {          // 可選, 自定義數據 payload
      "key1": "value1",
      "key2": "value2"
    },
    "extraOptions": { // 可選, 用於存放其他 FCM 頂層參數，如 android, webpush, apns
        "android": {
            "priority": "high"
        },
        "apns": {
            "payload": {
                "aps": {
                    "badge": 1
                }
            }
        }
    }
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Successfully sent message",
    "messageId": "projects/your-project/messages/12345"
  }
  ```
- **Error Response (4xx/5xx)**:
  ```json
  {
    "success": false,
    "message": "Failed to send notification",
    "error": "詳細錯誤資訊..."
  }
  ```

## 3. 資料庫 Schema 變動 (Database Schema Changes)

根據目前的需求，**無需任何資料庫變動**。

若未來要實現 `spec.md` 中提到的「Token 管理」功能，則可能需要新增一個 Firestore Collection，例如 `device_tokens`，用於儲存使用者常用的 Token 資訊。

## 4. 安全性考量與風險評估 (Security & Risks)

- **風險 1: 未經授權的存取 (高)**
  - **描述**: Cloud Function URL 如果外洩，任何人都可以呼叫此 API，可能導致服務被濫用（發送垃圾訊息）或產生非預期費用。
  - **緩解措施**:
    1.  **CORS 精確設定**: 在生產環境中，CORS 策略應設定為僅允許來自 Firebase Hosting 的特定網域的請求，而非 `*`。
    2.  **(建議) 導入身份驗證**: 建議在下一階段為此工具整合 Firebase Authentication。只有通過驗證的授權使用者才能呼叫此 API。或者，使用 Firebase App Check 來確保請求來自您自己的應用。

- **風險 2: 輸入驗證不足 (中)**
  - **描述**: 如果後端未對傳入的參數進行嚴格驗證，惡意或格式錯誤的輸入可能導致函數崩潰或行為異常。
  - **緩解措施**: 後端必須對所有傳入的欄位（特別是 `token` 和 `extraOptions`）進行嚴格的型別和格式檢查。絕不直接相信來自客戶端的任何數據。

- **風險 3: 金鑰管理**
  - **描述**: 雖然目前專案已使用 service account，但需確保這些金鑰檔案不會被意外提交到公開的程式碼庫中。
  - **緩解措施**: `.gitignore` 檔案已正確設定忽略了 `*.json` 金鑰檔案，此為良好實踐。在 Firebase Functions 環境中，建議利用環境變數或 Google Secret Manager 來管理敏感金鑰，而不是將檔案直接打包。