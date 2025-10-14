import React from 'react';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import VerificationBadge from './VerificationBadge';

interface User {
  id?: string;
  name: string;
  email: string;
  verified: boolean;
  trades: number;
  rating: number;
  joined: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

interface UserCardProps {
  user: User;
  onClick?: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'info';
    }
  };

  return (
    <Card hover className="cursor-pointer" onClick={() => onClick?.(user)}>
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-[#8b61c2] to-[#7952a8] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(user.name)
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
            <div className="flex items-center space-x-2">
              <VerificationBadge verified={user.verified} />
              {user.status && (
                <StatusBadge status={getStatusColor(user.status)}>
                  {user.status}
                </StatusBadge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 truncate mb-2">{user.email}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Trades: <span className="font-medium text-gray-700">{user.trades}</span></span>
              <span>Rating: <span className="font-medium text-gray-700">{user.rating}/5</span></span>
            </div>
            <span className="text-xs">Joined {user.joined}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;