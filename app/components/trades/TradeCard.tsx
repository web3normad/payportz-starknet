import React from 'react';
import { Eye, DotsThree } from '@phosphor-icons/react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import ProgressTracker from '../ui/ProgressTracker';

interface Trade {
  id: string;
  route: string;
  amount: string;
  trader: string;
  status: 'In Progress' | 'Completed' | 'Pending' | 'Disputed';
  created: string;
  progress: number;
}

interface TradeCardProps {
  trade: Trade;
  onView?: (tradeId: string) => void;
  onMenu?: (tradeId: string) => void;
}

const TradeCard: React.FC<TradeCardProps> = ({ trade, onView, onMenu }) => {
  const statusColors: Record<Trade['status'], 'info' | 'success' | 'warning' | 'error'> = {
    'In Progress': 'info',
    'Completed': 'success',
    'Pending': 'warning',
    'Disputed': 'error'
  };
  
  return (
    <Card hover className="cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Trade #{trade.id}</h3>
          <p className="text-sm text-gray-600">{trade.route}</p>
        </div>
        <StatusBadge status={statusColors[trade.status]}>{trade.status}</StatusBadge>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Amount:</span>
          <span className="font-medium">{trade.amount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Trader:</span>
          <span className="font-medium">{trade.trader}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Created:</span>
          <span className="text-gray-500">{trade.created}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <ProgressTracker 
          steps={['Created', 'Funded', 'Shipped', 'Completed']}
          currentStep={trade.progress}
        />
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button 
          variant="outline" 
          size="small" 
          className="flex-1"
          onClick={() => onView?.(trade.id)}
        >
          <Eye size={16} className="mr-1" />
          View
        </Button>
        <Button 
          variant="ghost" 
          size="small"
          onClick={() => onMenu?.(trade.id)}
        >
          <DotsThree size={16} />
        </Button>
      </div>
    </Card>
  );
};

export default TradeCard;