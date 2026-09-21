import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Clear cookies via next/headers
  cookieStore.delete('access_token');
  cookieStore.delete({ name: 'refresh_token', path: '/' });
  cookieStore.delete({ name: 'refresh_token', path: '/auth/refresh' });

  const response = NextResponse.json({ success: true });
  
  // As a fallback, explicitly set headers to expire cookies just in case
  response.headers.append('Set-Cookie', 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
  response.headers.append('Set-Cookie', 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
  response.headers.append('Set-Cookie', 'refresh_token=; Path=/auth/refresh; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
  
  return response;
}
