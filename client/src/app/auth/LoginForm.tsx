'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth';
import Button from '../../components/common/Button';

export default function LoginForm({ onToggle }: { onToggle: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Using FormData is the modern, clean way to get values in Next.js/React
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const credentials = { email, password };

    try {
      // Calling the Server Action
      const result = await loginAction(credentials);

      if (result?.success) {
        // Successful login
        router.push('/'); 
        router.refresh(); 
      } else {
        // Logic error (e.g., wrong password)
        setError(result?.error || "Invalid credentials");
        setLoading(false);
      }
    } catch {
      // Network/Unexpected error
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-mac-selection rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold dark:text-white">Sign In</h2>
        <p className="text-sm text-gray-500 mt-1">Access your Finder files</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-2 text-xs text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase mb-1 px-1">
            Email
          </label>
          <input 
            id="email"
            name="email" // <--- CRITICAL: Added this
            type="email" 
            required
            placeholder="name@example.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-mac-selection outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase mb-1 px-1">
            Password
          </label>
          <input 
            id="password"
            name="password" // <--- CRITICAL: Added this
            type="password" 
            required
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-mac-selection outline-none transition-all text-sm"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 mt-2 shadow-lg shadow-blue-500/20 flex justify-center items-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing In...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Haven&apos;t registered yet?{' '}
          <button 
            type="button" 
            onClick={onToggle} 
            className="text-mac-selection font-semibold hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}