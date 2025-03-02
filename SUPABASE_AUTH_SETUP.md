# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your application.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project

## Setup Steps

### 1. Install Required Packages

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env.local` and update the Supabase configuration:

```bash
cp .env.example .env.local
```

Then update the following variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project dashboard under Project Settings > API.

### 3. Configure Supabase Authentication

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Email provider
4. Configure additional providers as needed (Google, GitHub, etc.)

### 4. Configure Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the email templates for:
   - Confirmation email
   - Invitation email
   - Magic link email
   - Reset password email

### 5. Configure Redirect URLs

1. Go to Authentication > URL Configuration
2. Add your site URLs to the allowed redirect URLs:
   - `http://localhost:3000/reset-password` (for development)
   - `https://your-production-domain.com/reset-password` (for production)

## Authentication Features

The authentication system includes the following features:

1. **Login**: Users can log in with email/password
2. **Registration**: New users can create an account
3. **Forgot Password**: Users can request a password reset link
4. **Reset Password**: Users can set a new password after clicking the reset link
5. **Change Password**: Authenticated users can change their password
6. **Protected Routes**: Routes can be protected with the AuthGuard component

## Usage

### Protecting Routes

To protect a route, wrap the component with the AuthGuard:

```tsx
import AuthGuard from '@/components/auth/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>This content is only visible to authenticated users</div>
    </AuthGuard>
  );
}
```

### Accessing Auth Context

You can access the authentication context in any component:

```tsx
import { useAuth } from '@/lib/auth-context';

export default function MyComponent() {
  const { user, signOut } = useAuth();
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

## Troubleshooting

- **Email Not Received**: Check your spam folder and verify the email templates in Supabase
- **Redirect Issues**: Ensure your redirect URLs are properly configured in Supabase
- **Authentication Errors**: Check the browser console for detailed error messages 