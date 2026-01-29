import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-accent text-white hover:bg-blue-600 focus:ring-blue-500",
    secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500",
    danger: "bg-danger text-white hover:bg-red-600 focus:ring-red-500",
    success: "bg-success text-white hover:bg-emerald-600 focus:ring-emerald-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-500"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};