import React from 'react';
import { X, Copy, Link } from '@phosphor-icons/react';
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
  description?: string;
  txHash?: string;
  walletAddress?: string;
  exchangeRate?: string;
  fees?: string;
}

interface TradeDetailProps {
  trade: Trade;
  isOpen: boolean;
  onClose: () => void;
}

const TradeDetail: React.FC<TradeDetailProps> = ({ trade, isOpen, onClose }) => {
  if (!isOpen) return null;

  const statusColors: Record<Trade['status'], 'info' | 'success' | 'warning' | 'error'> = {
    'In Progress': 'info',
    'Completed': 'success',
    'Pending': 'warning',
    'Disputed': 'error'
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trade #{trade.id}</h2>
            <p className="text-gray-600">{trade.route}</p>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={statusColors[trade.status]}>{trade.status}</StatusBadge>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Progress Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
            <ProgressTracker 
              steps={['Created', 'Funded', 'Shipped', 'Completed']}
              currentStep={trade.progress}
            />
          </div>

          {/* Trade Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Amount</label>
                <p className="text-lg font-semibold text-gray-900">{trade.amount}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Trader</label>
                <p className="text-lg font-semibold text-gray-900">{trade.trader}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900">{trade.created}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Exchange Rate</label>
                <p className="text-gray-900">{trade.exchangeRate || '1 USD = 1,500 NGN'}</p>
              </div>
            </div>
          </div>

          {/* Blockchain Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-600">Transaction Hash</label>
                  <p className="font-mono text-sm text-gray-900">
                    {trade.txHash || '0x1234567890abcdef...'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => copyToClipboard(trade.txHash || '0x1234567890abcdef...')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Link size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-600">Wallet Address</label>
                  <p className="font-mono text-sm text-gray-900">
                    {trade.walletAddress || '0xabcdef1234567890...'}
                  </p>
                </div>
                <button 
                  onClick={() => copyToClipboard(trade.walletAddress || '0xabcdef1234567890...')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button variant="primary" className="flex-1">
              Update Status
            </Button>
            <Button variant="outline" className="flex-1">
              Contact Trader
            </Button>
            <Button variant="secondary">
              Export Details
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TradeDetail;