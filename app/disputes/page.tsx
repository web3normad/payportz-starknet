"use client";
import React, { useState } from 'react';
import { Gavel, Clock, CheckCircle, XCircle, Warning } from '@phosphor-icons/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

interface Dispute {
  id: string;
  tradeId: string;
  title: string;
  description: string;
  reporter: string;
  reported: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created: string;
  lastUpdate: string;
  amount: string;
}

const DisputesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  // Sample disputes data
  const allDisputes: Dispute[] = [
    {
      id: 'DIS-001',
      tradeId: 'TRD-001',
      title: 'Payment not received',
      description: 'Trader claims payment was sent but recipient has not received funds after 48 hours.',
      reporter: 'John Doe',
      reported: 'Alice Smith',
      status: 'open',
      priority: 'high',
      created: '2 hours ago',
      lastUpdate: '1 hour ago',
      amount: '$2,500'
    },
    {
      id: 'DIS-002',
      tradeId: 'TRD-002',
      title: 'Incorrect exchange rate applied',
      description: 'User disputes the exchange rate used in the transaction, claiming it differs from agreed rate.',
      reporter: 'Sarah Wilson',
      reported: 'Mike Johnson',
      status: 'investigating',
      priority: 'medium',
      created: '1 day ago',
      lastUpdate: '3 hours ago',
      amount: '€1,200'
    },
    {
      id: 'DIS-003',
      tradeId: 'TRD-003',
      title: 'Fraudulent transaction',
      description: 'User reports unauthorized transaction from their account with suspicious activity.',
      reporter: 'David Brown',
      reported: 'Unknown',
      status: 'resolved',
      priority: 'critical',
      created: '3 days ago',
      lastUpdate: '1 day ago',
      amount: '₦750,000'
    },
    {
      id: 'DIS-004',
      tradeId: 'TRD-004',
      title: 'Delayed shipment',
      description: 'Physical goods not shipped within agreed timeframe, causing financial loss.',
      reporter: 'Emma Davis',
      reported: 'James Taylor',
      status: 'dismissed',
      priority: 'low',
      created: '5 days ago',
      lastUpdate: '2 days ago',
      amount: '$800'
    }
  ];

  const filterDisputes = (disputes: Dispute[], filter: string) => {
    switch (filter) {
      case 'open':
        return disputes.filter(dispute => dispute.status === 'open');
      case 'investigating':
        return disputes.filter(dispute => dispute.status === 'investigating');
      case 'resolved':
        return disputes.filter(dispute => dispute.status === 'resolved');
      case 'dismissed':
        return disputes.filter(dispute => dispute.status === 'dismissed');
      case 'high-priority':
        return disputes.filter(dispute => dispute.priority === 'high' || dispute.priority === 'critical');
      default:
        return disputes;
    }
  };

  const filteredDisputes = filterDisputes(allDisputes, activeFilter);

  const filters = [
    { id: 'all', label: 'All Disputes', count: allDisputes.length },
    { id: 'open', label: 'Open', count: allDisputes.filter(d => d.status === 'open').length },
    { id: 'investigating', label: 'Investigating', count: allDisputes.filter(d => d.status === 'investigating').length },
    { id: 'resolved', label: 'Resolved', count: allDisputes.filter(d => d.status === 'resolved').length },
    { id: 'dismissed', label: 'Dismissed', count: allDisputes.filter(d => d.status === 'dismissed').length },
    { id: 'high-priority', label: 'High Priority', count: allDisputes.filter(d => d.priority === 'high' || d.priority === 'critical').length }
  ];

  const getStatusConfig = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
        return { color: 'error' as const, icon: Warning };
      case 'investigating':
        return { color: 'warning' as const, icon: Clock };
      case 'resolved':
        return { color: 'success' as const, icon: CheckCircle };
      case 'dismissed':
        return { color: 'pending' as const, icon: XCircle };
    }
  };

  const getPriorityConfig = (priority: Dispute['priority']) => {
    switch (priority) {
      case 'critical':
        return { color: 'error' as const, label: 'Critical' };
      case 'high':
        return { color: 'warning' as const, label: 'High' };
      case 'medium':
        return { color: 'info' as const, label: 'Medium' };
      case 'low':
        return { color: 'pending' as const, label: 'Low' };
    }
  };

  const DisputeCard = ({ dispute }: { dispute: Dispute }) => {
    const statusConfig = getStatusConfig(dispute.status);
    const priorityConfig = getPriorityConfig(dispute.priority);
    const StatusIcon = statusConfig.icon;

    return (
      <Card hover className="cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-xl ${
              dispute.priority === 'critical' ? 'bg-red-100 text-red-600' :
              dispute.priority === 'high' ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              <Gavel size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{dispute.title}</h3>
              <p className="text-sm text-gray-600">Dispute #{dispute.id} • Trade #{dispute.tradeId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status={priorityConfig.color}>{priorityConfig.label}</StatusBadge>
            <StatusBadge status={statusConfig.color}>
              <StatusIcon size={12} className="mr-1" />
              {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
            </StatusBadge>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{dispute.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-600">Reporter:</span>
            <p className="font-medium">{dispute.reporter}</p>
          </div>
          <div>
            <span className="text-gray-600">Amount:</span>
            <p className="font-medium">{dispute.amount}</p>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <p className="text-gray-500">{dispute.created}</p>
          </div>
          <div>
            <span className="text-gray-600">Last Update:</span>
            <p className="text-gray-500">{dispute.lastUpdate}</p>
          </div>
        </div>

        <div className="flex space-x-2 pt-4 border-t border-gray-100">
          <Button variant="primary" size="small" className="flex-1">
            Review
          </Button>
          <Button variant="outline" size="small" className="flex-1">
            Contact Parties
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dispute Management</h2>
          <p className="text-gray-600 mt-1">Review and resolve platform disputes</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            Export Reports
          </Button>
          <Button>
            Dispute Guidelines
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <Warning size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Open Disputes</p>
              <p className="text-2xl font-bold text-gray-900">
                {allDisputes.filter(d => d.status === 'open').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Investigating</p>
              <p className="text-2xl font-bold text-gray-900">
                {allDisputes.filter(d => d.status === 'investigating').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {allDisputes.filter(d => d.status === 'resolved').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Gavel size={24} className="text-[#8b61c2]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Disputes</p>
              <p className="text-2xl font-bold text-gray-900">{allDisputes.length}</p>
            </div>
          </div>
        </Card>
      </div>
      
      <Card>
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 mb-6 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeFilter === filter.id
                  ? 'bg-[#8b61c2] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filter.id
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mb-6 text-sm text-gray-600">
          Showing {filteredDisputes.length} of {allDisputes.length} disputes
        </div>
        
        {/* Disputes Grid */}
        {filteredDisputes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDisputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gavel size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No disputes found</h3>
            <p className="text-gray-600 mb-4">
              No disputes match the current filter criteria.
            </p>
            <Button variant="outline" onClick={() => setActiveFilter('all')}>
              Clear Filters
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DisputesPage;