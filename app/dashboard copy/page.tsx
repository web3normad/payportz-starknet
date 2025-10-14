'use client';

import React from 'react';
import { 
  ArrowsLeftRight, 
  ShoppingBag, 
  TrendUp, 
  Clock,
  CurrencyDollar,
  FileText,
  Truck,
  CheckCircle
} from '@phosphor-icons/react';
import Layout from '../components/core/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useRouter } from 'next/navigation';

// Quick Action Card Component
type QuickActionColor = 'purple' | 'green' | 'blue' | 'orange';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: QuickActionColor;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon: Icon, color, onClick }) => {
  const colorClasses: Record<QuickActionColor, string> = {
    purple: 'bg-purple-50 text-[#8b61c2] border-purple-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };
  
  return (
    <Card hover onClick={onClick} className="cursor-pointer">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  );
};

// Balance Card Component
type BalanceCardColor = 'purple' | 'green' | 'blue';

interface BalanceCardProps {
  title: string;
  amount: string;
  currency: string;
  trend?: string;
  icon: React.ElementType;
  color: BalanceCardColor;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ title, amount, currency, trend, icon: Icon, color }) => {
  const colorClasses: Record<BalanceCardColor, string> = {
    purple: 'text-[#8b61c2] bg-purple-50',
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50'
  };
  
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{currency}{amount}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{trend}</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};

// Recent Trade Card
interface Trade {
  id: string;
  supplier: string;
  amount: string;
  product: string;
  status: 'In Transit' | 'Delivered' | 'Processing' | 'Pending Payment';
  expectedDelivery: string;
  progress: number;
}

const RecentTradeCard: React.FC<{ trade: Trade }> = ({ trade }) => {
  const statusIcons = {
    'In Transit': Truck,
    'Delivered': CheckCircle,
    'Processing': Clock,
    'Pending Payment': CurrencyDollar
  };
  
  const StatusIcon = statusIcons[trade.status];
  
  return (
    <Card hover className="cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">Trade #{trade.id}</h3>
          <p className="text-sm text-gray-600">{trade.supplier}</p>
        </div>
        <div className="flex items-center space-x-2">
          <StatusIcon size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">{trade.status}</span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Amount:</span>
          <span className="font-medium">{trade.amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Product:</span>
          <span className="font-medium">{trade.product}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Expected:</span>
          <span className="text-gray-500">{trade.expectedDelivery}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[linear-gradient(135deg,rgb(131,131,131)_-35%,rgba(41,41,41,0.34)_-20%,rgba(51,51,51,0.55)_-15%,rgb(47,47,47)_100%)] h-2 rounded-full transition-all duration-300" 
            style={{ width: `${trade.progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{trade.progress}% Complete</p>
      </div>
    </Card>
  );
};

const UserDashboard: React.FC = () => {
  const router = useRouter();
  
  // Sample data
  const recentTrades = [
    {
      id: 'TRD-001',
      supplier: 'Shanghai Electronics Co.',
      amount: '$12,500',
      product: 'Smartphone Components',
      status: 'In Transit',
      expectedDelivery: 'Dec 28, 2024',
      progress: 65
    },
    {
      id: 'TRD-002',
      supplier: 'Dubai Textile Mills',
      amount: '$8,200',
      product: 'Cotton Fabric',
      status: 'Delivered',
      expectedDelivery: 'Dec 15, 2024',
      progress: 100
    },
    {
      id: 'TRD-003',
      supplier: 'German Machinery Ltd',
      amount: '$25,000',
      product: 'Industrial Equipment',
      status: 'Processing',
      expectedDelivery: 'Jan 15, 2025',
      progress: 25
    }
  ];

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    
    // Navigate to respective pages
    switch (action) {
      case 'convert':
        router.push('/convert');
        break;
      case 'trade':
        router.push('/trades');
        break;
      case 'credit':
        router.push('/credit');
        break;
      case 'track':
        router.push('/track');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
            <p className="text-gray-600 mt-1">Manage your international trades and conversions</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Exchange Rate (NGN/USD)</p>
            <p className="text-2xl font-bold text-gray-900">₦1,580</p>
            <p className="text-sm text-green-600">+2.3% vs bank rate</p>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BalanceCard
            title="USDC Balance"
            amount="2,450.00"
            currency="$"
            trend="+15.2%"
            icon={CurrencyDollar}
            color="purple"
          />
          <BalanceCard
            title="NGN Wallet"
            amount="450,000"
            currency="₦"
            trend="+8.5%"
            icon={CurrencyDollar}
            color="green"
          />
          <BalanceCard
            title="Total Trade Volume"
            amount="125,500"
            currency="$"
            trend="+23.1%"
            icon={TrendUp}
            color="blue"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Convert NGN to USDC"
              description="Get USD liquidity in minutes"
              icon={ArrowsLeftRight}
              color="purple"
              onClick={() => handleQuickAction('convert')}
            />
            <QuickActionCard
              title="Create New Trade"
              description="Start a protected trade with escrow"
              icon={ShoppingBag}
              color="green"
              onClick={() => handleQuickAction('trade')}
            />
            <QuickActionCard
              title="Request Letter of Credit"
              description="Get LoC for agricultural exports"
              icon={FileText}
              color="blue"
              onClick={() => handleQuickAction('credit')}
            />
            <QuickActionCard
              title="Track Shipment"
              description="Monitor delivery status"
              icon={Truck}
              color="orange"
              onClick={() => handleQuickAction('track')}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Trades</h3>
              <Button variant="outline" size="small">View All</Button>
            </div>
            <div className="space-y-4">
              {recentTrades.map(trade => (
                <RecentTradeCard key={trade.id} trade={trade} />
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Conversions</h3>
              <Button variant="outline" size="small">View All</Button>
            </div>
            <div className="space-y-4">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">₦1,580,000 → $1,000</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Success</p>
                    <p className="text-xs text-gray-500">Fee: ₦23,700</p>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">₦790,000 → $500</p>
                    <p className="text-sm text-gray-600">1 day ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Success</p>
                    <p className="text-xs text-gray-500">Fee: ₦11,850</p>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">₦3,160,000 → $2,000</p>
                    <p className="text-sm text-gray-600">3 days ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Success</p>
                    <p className="text-xs text-gray-500">Fee: ₦47,400</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Market Insights */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Insights</h3>
              <p className="text-gray-600">Nigerian trade volume up 23% this month. Best rates available for electronics imports from China.</p>
            </div>
            <Button variant="outline">View Details</Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default UserDashboard;