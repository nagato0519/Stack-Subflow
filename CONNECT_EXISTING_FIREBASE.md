# Connect to Your Existing Firebase Project

This guide shows you how to connect your Next.js app to your existing Firebase project (the one you're using for your iOS app).

## 🔗 **Step 1: Get Configuration from Your Existing Project**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your existing project** (the one used for your iOS app)
3. **Click gear icon (⚙️)** → **Project settings**
4. **Scroll to "Your apps"** section
5. **Click "Add app"** → **Web app** (</>) 
6. **Name it**: "Subflow Web App" or similar
7. **Copy the configuration** - it will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## 🔧 **Step 2: Create Environment File**

Create a `.env.local` file in your project root with these values:

```env
# Replace with your actual Firebase project values
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef...

# Your existing Stripe configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
```

## ⚙️ **Step 3: Configure Firebase Services**

### **Authentication Setup**
1. In Firebase Console → **Authentication** → **Sign-in method**
2. **Enable "Email/Password"** provider
3. Your iOS app settings won't be affected

### **Firestore Database Setup**
1. In Firebase Console → **Firestore Database**
2. If not already created, **Create database**
3. Choose **"Start in test mode"** for development
4. This will be shared with your iOS app

### **Security Rules (Optional)**
Add these rules in Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎯 **Step 4: Test the Connection**

1. **Start your app**:
   ```bash
   npm run dev
   ```

2. **Test the flow**:
   - Go to `/signup` and create an account
   - Check Firebase Console → Authentication (should see new user)
   - Complete payment on `/subscribe`
   - Check Firestore Database → users collection (should see new document)

## 📱 **Benefits of Using Your Existing Project**

✅ **Shared Data**: Both iOS and web apps can access the same Firestore data
✅ **Unified Authentication**: Users can be authenticated across platforms
✅ **Consistent Billing**: All usage counts toward the same Firebase plan
✅ **Centralized Management**: Manage both apps from one Firebase project

## 🔍 **How to Identify Your Project**

If you have multiple Firebase projects, you can identify the correct one by:
- **Project ID**: Usually matches your iOS app's bundle identifier
- **Project Name**: The name you gave when creating the project
- **iOS App**: Check your iOS app's `GoogleService-Info.plist` file for the project ID

## ⚠️ **Important Notes**

- **No Impact on iOS App**: Adding a web app won't affect your existing iOS app
- **Shared Resources**: Both apps will share the same Firestore database and Auth users
- **Billing**: Usage from both apps will count toward your Firebase plan limits
- **Security**: Make sure to configure proper security rules for web access

## 🆘 **Need Help?**

If you can't find your project or need help identifying it:
1. Check your iOS app's Firebase configuration files
2. Look for `GoogleService-Info.plist` (iOS) or `google-services.json` (Android)
3. The project ID in these files should match your Firebase Console project
