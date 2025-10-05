# Firebase Setup Instructions

This guide will help you integrate Firebase Authentication and Firestore with your Next.js app.

## 1. Environment Variables

Create a `.env.local` file in your project root and add the following Firebase configuration variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration (existing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## 2. Getting Firebase Configuration Values

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project (the one used for your iOS app)
3. Click on the gear icon (⚙️) → Project settings
4. Scroll down to "Your apps" section
5. Click "Add app" → Web app (</>) → give it a name
6. Copy the configuration values to your `.env.local` file

## 3. Firebase Authentication Setup

1. In Firebase Console, go to Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Optionally configure other sign-in methods as needed

## 4. Firestore Database Setup

1. In Firebase Console, go to Firestore Database
2. Create database (if not already created)
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database

## 5. Firestore Security Rules

For development, you can use these basic rules in Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow read access to other collections if needed
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. Features Implemented

### Authentication
- ✅ User registration with email/password
- ✅ Firebase Auth account creation during signup
- ✅ Authentication context provider
- ✅ Custom hooks for auth operations

### User Management
- ✅ User data stored in Firestore `/users` collection with the following fields:
  - `uid`: Firebase Auth user ID (document ID)
  - `email`: User's email address
  - `password`: User's password (stored for reference)
  - `createdAt`: Document creation timestamp
  - `subscriptionStatus`: 'active', 'inactive', or 'trial'
  - `subscriptionPlan`: Selected subscription plan
  - `stripeCustomerId`: Stripe customer ID (if available)
  - `tenant`: Tenant identifier (defaults to 'ai-english')

### Integration Points
- ✅ Signup page creates Firebase Auth account only
- ✅ Subscribe page creates Firestore document after successful payment
- ✅ Authentication state management throughout the app

## 7. Usage

The authentication system is now integrated into your app:

1. **Signup Flow**: Users create Firebase Auth accounts via `/signup` page
2. **Payment Flow**: Users select a plan and complete payment via `/subscribe` page
3. **Document Creation**: After successful payment, user document is created in Firestore `/users` collection
4. **Authentication State**: Available throughout the app via `useAuth()` hook

## 8. Next Steps

Consider implementing:
- Email verification
- Password reset functionality
- Social authentication (Google, Apple, etc.)
- User profile management
- Subscription management dashboard
- Admin panel for user management
- User login functionality (if needed later)

## 9. Testing

To test the integration:
1. Start your development server: `npm run dev`
2. Navigate to `/signup` and create an account
3. Check Firebase Console → Authentication to see the new user (Firestore document should NOT exist yet)
4. Complete the subscription flow on `/subscribe` page
5. After successful payment, check Firestore Database → users collection to see the user document with email, password, and uid
