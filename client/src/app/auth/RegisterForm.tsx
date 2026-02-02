'use client';

import { useState } from 'react';
import Button from '../../components/common/Button';
import { registerAction } from '@/lib/actions/auth';

export default function RegisterForm({ onToggle }: { onToggle: () => void }) {
  // 1. State Management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    // 2. Extract Data using FormData
    const formData = new FormData(e.currentTarget);
    const userData = {
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    

    // 3. Call the Server Action
    const result = await registerAction(userData);

    if (result.success) {
      setSuccessMsg(result.message || "Account created! Redirecting to login...");
      // Wait 2 seconds so the user can see the success message, then flip to Login
      setTimeout(() => {
        onToggle();
      }, 2000);
    } else {
      setError(result.error || "Could not register");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold dark:text-white">Create Account</h2>
        <p className="text-sm text-gray-500 mt-1">Start organizing your drive today</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Error Feedback */}
        {error && (
          <div className="p-2 text-xs text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800 animate-in fade-in zoom-in duration-200">
            {error}
          </div>
        )}

        {/* Success Feedback */}
        {successMsg && (
          <div className="p-2 text-xs text-center text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800 animate-in fade-in zoom-in duration-200">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 px-1">First Name</label>
            <input 
              name="firstName" // Added name attribute
              type="text" 
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-mac-selection outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 px-1">Last Name</label>
            <input 
              name="lastName" // Added name attribute
              type="text" 
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-mac-selection outline-none transition-all text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 px-1">Email</label>
          <input 
            name="email" // Added name attribute
            type="email" 
            required
            placeholder="name@example.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-mac-selection outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 px-1">Password</label>
          <input 
            name="password" // Added name attribute
            type="password" 
            required
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-mac-selection outline-none transition-all text-sm"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading || !!successMsg} 
          className="w-full py-3 mt-2 shadow-lg shadow-blue-500/20 flex justify-center items-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Account...
            </span>
          ) : (
            'Sign Up'
          )}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={onToggle} 
            className="text-mac-selection font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}