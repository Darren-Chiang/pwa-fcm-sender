# Spec: FCM 通知發送器 GUI

## 1. 目標 (Goals)

- **G1: 簡化測試流程**：建立一個簡單易用的 Web GUI，讓開發或維運人員無需編寫程式碼即可發送 Firebase Cloud Messaging (FCM) 通知。
- **G2: 提升靈活性**：支援動態輸入推送目標的設備 Token、通知的標題 (Title)、內文 (Body)，以及其他進階的 FCM 欄位。
- **G3: 提供即時反饋**：在發送後，介面能清楚地顯示成功或失敗的結果，幫助快速診斷問題。

## 2. 用戶故事 (User Stories)

- **US1**: 作為一名開發人員，我希望能有一個表單介面，可以輸入設備 Token、通知標題和內容，以便快速發送一則自定義的測試通知。
- **US2**: 作為一名 App 維運人員，我希望在發送通知後，能立即看到一個成功或失敗的提示訊息，以便我確認推送操作是否成功，如果失敗也能知道原因。
- **US3**: 作為一名資深開發人員，我希望能有一個進階區塊（例如：JSON 編輯器），可以讓我自由新增 `data`、`android`、`webpush` 等自定義的 FCM 參數，以便我測試更複雜的通知情境。

## 3. 驗收標準 (Acceptance Criteria)

- **AC1**: 必須存在一個 Web 頁面，其中包含給 `token`、`title` 和 `body` 的輸入欄位。
- **AC2**: 頁面上必須有一個「發送」按鈕，點擊後會使用表單資料呼叫後端的 `sendTestNotification` 函數。
- **AC3**: 當通知成功發送後，GUI 必須顯示一個成功的訊息，並附上 Firebase 回傳的 `messageId`。
- **AC4**: 當通知發送失敗時，GUI 必須顯示一個錯誤提示，並包含從後端收到的錯誤原因。
- **AC5**: 必須提供一個可選的進階功能，允許用戶以 key-value 或 JSON 格式輸入額外的 FCM 推播參數。

---

## 關鍵問題 (Key Questions)

為了確保最終交付的方案能完全滿足您的需求，請您思考以下幾個問題：

1.  **身份驗證 (Authentication)**: 誰有權限使用這個 GUI？它應該是任何人都能存取的公開頁面，還是需要透過某種登入機制（例如 Firebase Authentication 的 Google 登入）來保護，以防止未經授權的使用和潛在的濫用？
2.  **Token 管理 (Token Management)**: 這個介面是否需要提供一個方式來儲存和管理常用的設備 Token？或者每次測試都手動輸入即可？
3.  **Payload 靈活性 (Payload Flexibility)**: 對於「任何其他 FCM 欄位」的需求，提供一個通用的 JSON 編輯器來客製化 `data` 或其他進-階參數是否足夠？還是您期望一個結構化的表單來引導使用者填寫所有可能的 FCM 選項？
4.  **託管與部署 (Hosting)**: 這個 GUI 最終將部署在哪裡？是作為一個靜態網站部署在 Firebase Hosting 上，還是僅在本地端運行？這將影響到 CORS 的設定策略。
5.  **發送目標 (Targeting Strategy)**: 目前的需求是發送到單一 Token。未來是否可能需要擴展到發送給多個 Token、訂閱的主題 (Topics) 或用戶群組 (Segments)？