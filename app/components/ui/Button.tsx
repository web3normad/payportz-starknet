import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className = '', 
  onClick,
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2  disabled:opacity-50 disabled:cursor-not-allowed ';
  
  const variants = {
    primary: 'bg-[linear-gradient(135deg,rgb(131,131,131)_-35%,rgba(41,41,41,0.34)_-20%,rgba(51,51,51,0.55)_-15%,rgb(47,47,47)_100%)] text-white hover:bg-[#7952a8] focus:ring-[#444444] shadow-sm hover:shadow-md',
    secondary: 'bg-[#373941] text-white hover:bg-[#2a2c33] focus:ring-[#373941] shadow-sm hover:shadow-md',
    outline: 'border-2 border-[#444444]   text-[#444444] hover:bg-[#444444] hover:text-white focus:ring-0',
    ghost: 'bg-transparent text-[#373941] hover:bg-gray-100 focus:ring-gray-300'
  };
  
  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-sm',
    large: 'px-6 py-4 text-base'
  };
  
  return (
    <button 
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;