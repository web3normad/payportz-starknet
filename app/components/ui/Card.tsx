import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  ...props 
}) => {
  return (
    <div 
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-all duration-200 ${
        hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;