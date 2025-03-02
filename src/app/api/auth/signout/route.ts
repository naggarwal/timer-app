import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  // Sign out on the server
  await supabase.auth.signOut();
  
  // Clear all cookies related to authentication
  const response = NextResponse.json({ success: true });
  
  // Explicitly clear auth cookies
  response.cookies.delete('sb-access-token');
  response.cookies.delete('sb-refresh-token');
  
  return response;
}

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  // Sign out on the server
  await supabase.auth.signOut();
  
  // Redirect to home page with cleared cookies
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  
  // Explicitly clear auth cookies
  response.cookies.delete('sb-access-token');
  response.cookies.delete('sb-refresh-token');
  
  return response;
} 