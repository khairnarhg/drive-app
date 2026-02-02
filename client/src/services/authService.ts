const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) throw new Error('Invalid login');
  
  const data = await response.json(); 
  // data.access_token is your JWT from Python
  return data;
};


export const registerUser = async (credentials: RegisterCredentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    // Try to get the specific error message from your Python backend
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Registration failed');
  }
  
};

export const getUserProfile = async (token: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store' // Ensure we get fresh data
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
};
