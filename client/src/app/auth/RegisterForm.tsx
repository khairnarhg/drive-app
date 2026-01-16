'use client';

import Button from '../../components/common/Button';

export default function RegisterForm({ onToggle }: { onToggle: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold dark:text-white">Create Account</h2>
        <p className="text-sm text-gray-500 mt-1">Start organizing your drive today</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 px-1">First Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-mac-selection outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 px-1">Last Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-mac-selection outline-none transition-all text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 px-1">Email</label>
          <input 
            type="email" 
            placeholder="name@example.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-mac-selection outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 px-1">Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-mac-selection outline-none transition-all text-sm"
          />
        </div>
        <Button className="w-full py-3 mt-2 shadow-lg shadow-blue-500/20">Sign Up</Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <button onClick={onToggle} className="text-mac-selection font-semibold hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}