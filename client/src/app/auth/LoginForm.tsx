'use client';

import Button from '../../components/common/Button';

export default function LoginForm({ onToggle }: { onToggle: () => void }) {
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

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
        <Button className="w-full py-3 mt-2 shadow-lg shadow-blue-500/20">Sign In</Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Haven't registered yet?{' '}
          <button onClick={onToggle} className="text-mac-selection font-semibold hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}