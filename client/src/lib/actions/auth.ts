'use server'

import { cookies } from 'next/headers'
import { loginUser } from '@/services/authService'
import { registerUser } from '@/services/authService'
import { redirect } from 'next/navigation'

interface LoginFormData {
  email: string
  password: string
}

interface RegisterFormData {
  first_name: string
  last_name: string
  email: string
  password: string
}

export async function loginAction(formData: LoginFormData) {
  try {
    const result = await loginUser(formData)

    if (result.access_token) {
      const cookieStore = await cookies()
      cookieStore.set('auth_token', result.access_token, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
      })
      return { success: true }
    }
  } catch {
    return { success: false, error: 'Invalid credentials' }
  }
  return { success: false, error: 'Invalid credentials' }
}

export async function registerAction(userData: RegisterFormData) {
  try {
    await registerUser(userData)
    return { success: true, message: 'Account created! Please log in.' }
  } catch {
    return { success: false, error: 'Could Not register' }
  }
}

export async function logoutAction() {
  (await cookies()).delete('auth_token');
  redirect('/auth');
}