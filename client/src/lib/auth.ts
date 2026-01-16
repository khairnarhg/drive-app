import { cookies } from 'next/headers';

export async function login(email: string) {
  // In real life: fetch('api/login')...
  const mockJwt = "header.payload.signature"; 

  // Store in HTTP-only cookie
  (await cookies()).set('auth_token', mockJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
}

export async function logout() {
  (await cookies()).delete('auth_token');
}