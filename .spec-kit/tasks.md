# Tasks: FCM 通知發送器 GUI

此任務列表基於 `spec.md` 和 `plan.md` 的規劃，並將其分解為可執行的開發步驟。

## 階段 1: 環境設定 (Setup)

- [ ] 在專案根目錄下建立 `/frontend` 資料夾 (`./`)
- [ ] 使用 Vite 在 `/frontend` 中初始化一個新的 React + TypeScript 專案 (`frontend/`)
- [ ] 安裝 `material-ui` (MUI) 及其相關依賴 (`frontend/package.json`)
- [ ] 安裝 `axios` 用於 API 請求 (`frontend/package.json`)

## 階段 2: 後端開發 (Backend Development)

- [ ] 安裝 `cors` 套件及其類型定義 (`functions/package.json`)
- [ ] 更新 `sendTestNotification` 函數以支援 `plan.md` 中定義的靈活 Payload (`functions/src/index.ts`)
- [ ] 在 `sendTestNotification` 中加入 `cors` 中介層，並為開發環境允-許 `localhost` (`functions/src/index.ts`)
- [ ] 在 `sendTestNotification` 中為傳入的 Body 加上嚴格的輸入驗證邏輯 (`functions/src/index.ts`)
- [ ] **[測試]** 針對 `sendTestNotification` 的成功和失敗情境編寫單元測試 (`functions/src/index.test.ts` 或類似檔案)

## 階段 3: 前端開發 (Frontend Development)

- [ ] 建立主要的 GUI 佈局，包含標題和區塊劃分 (`frontend/src/App.tsx`)
- [ ] 建立 `NotificationForm` 元件，包含 Token、Title、Body 的輸入框和發送按鈕 (`frontend/src/components/NotificationForm.tsx`)
- [ ] 建立 `AdvancedOptions` 元件，使用一個 `textarea` 或 JSON 編輯器來輸入額外的 FCM 參數 (`frontend/src/components/AdvancedOptions.tsx`)
- [ ] 建立 `StatusDisplay` 元件，用於顯示 API 回應的成功或失敗訊息 (`frontend/src/components/StatusDisplay.tsx`)
- [ ] 在 `App.tsx` 中整合所有元件，並管理整體表單狀態 (`frontend/src/App.tsx`)
- [ ] 建立一個 API 服務模組，封裝呼叫後端 Cloud Function 的 `axios` 請求 (`frontend/src/services/api.ts`)
- [ ] **[測試]** 為 `NotificationForm` 元件編寫一個簡單的輸入和提交行為的元件測試 (`frontend/src/components/NotificationForm.test.tsx`)

## 階段 4: 整合與部署 (Integration & Deployment)

- [ ] 在本地端同時運行前端 Vite 服務和 Firebase emulators，進行端對端測試 (`./`)
- [ ] 設定 `firebase.json` 以將 `/frontend` 的 build 結果部署到 Firebase Hosting (`firebase.json`)
- [ ] (可選) 建立一個部署腳本，用於一鍵部署 Hosting 和 Functions (`package.json`)