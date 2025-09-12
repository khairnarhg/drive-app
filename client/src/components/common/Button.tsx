import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Button = ({ className, variant = 'primary', ...props }: ButtonProps) => {
  const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
  
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'bg-gray-200/70 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-gray-300/70 dark:hover:bg-gray-600/50 focus:ring-gray-400',
  };

  return (
    <button className={cn(baseClasses, variants[variant], className)} {...props} />
  );
};

export default Button;