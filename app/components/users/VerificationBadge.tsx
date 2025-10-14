import React from 'react';
import { CheckCircle, Clock, XCircle } from '@phosphor-icons/react';

interface VerificationBadgeProps {
  verified: boolean;
  status?: 'verified' | 'pending' | 'rejected';
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  verified, 
  status = verified ? 'verified' : 'pending',
  size = 'small',
  showText = true
}) => {
  const getConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-100 border-green-200',
          text: 'Verified'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600 bg-red-100 border-red-200',
          text: 'Rejected'
        };
      default:
        return {
          icon: Clock,
          color: 'text-yellow-600 bg-yellow-100 border-yellow-200',
          text: 'Pending'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-sm'
  };

  const iconSizes = {
    small: 12,
    medium: 14,
    large: 16
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}>
      <Icon size={iconSizes[size]} className="mr-1" weight="fill" />
      {showText && config.text}
    </span>
  );
};

export default VerificationBadge;