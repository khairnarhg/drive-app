'use server' 

import { cookies } from 'next/headers'
import { loginUser } from '@/services/authService'
import { registerUser } from '@/services/authService'
import { redirect } from 'next/navigation';

export async function loginAction(formData: any) {
  try {
    const data = await loginUser(formData);

    if (data.access_token) {
      const cookieStore = await cookies();
      cookieStore.set('auth_token', data.access_token, {
        httpOnly: true,
        // secure: true, // Only over HTTPS
        sameSite: 'strict',
        path: '/',
      });
      return { success: true };
    }
  } catch (err: any) {
    return { success: false, error: "Invalid credentials" };
  }
}


export async function registerAction(userData: any) {
  try{
    const data = await registerUser(userData);

    return { success: true, message: "Account created! Please log in." };

  }catch(err:any){ 
    return { success: false, error: "Could Not register" };
  }
}

export async function logoutAction() {
  (await cookies()).delete('auth_token');
  redirect('/auth');
}