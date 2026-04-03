# Weight Loss Competition — Setup Guide

## Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project**, name it (e.g. "weight-tracker"), skip Google Analytics
3. In the left sidebar, click **Firestore Database** → **Create database**
   - Start in **production mode** (or test mode for dev)
   - Choose a region (e.g. `us-central`)
4. Go to **Project Settings** (gear icon) → **Your apps** → click **</>** (web)
   - Register the app, copy the `firebaseConfig` object

## Step 2: Configure Firestore Security Rules

In Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /weightLogs/{doc} {
      allow read, write: if true;  // Open access — fine for 3 known users
    }
  }
}
```

## Step 3: Add Your Firebase Config

1. Copy `.env.example` → `.env`
2. Fill in the values from your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123...
   ```

## Step 4: Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

**First time only:** Click **Import Starting Data** on the dashboard to seed the 3 days already in the Excel file.

## Step 5: Deploy to Netlify

1. Push this folder to a GitHub repo
2. Go to https://netlify.com → **Add new site** → **Import from Git**
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add your environment variables under **Site settings → Environment variables**
6. Deploy!

Share the Netlify URL with Javin, Paul, and Dan — each picks their name and logs daily.

---

## Changing Participants or Goal %

Edit `src/utils/calculations.js` — the `PARTICIPANTS` array at the top.
