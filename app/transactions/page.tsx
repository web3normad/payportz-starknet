'use client';

import React, { useState } from 'react';
import Layout from '../components/core/Layout';
import { 
  MagnifyingGlass,
  Funnel,
  Download,
  ArrowUp,
  ArrowDown,
  Plus,
  ArrowsLeftRight,
  CheckCircle,
  Clock,
  X,
  Eye,
  Copy
} from '@phosphor-icons/react';

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, onramp, send, offramp, convert
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending, failed
  const [selectedTx, setSelectedTx] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Mock transactions
  const allTransactions = [
    {
      id: 'tx-001',
      type: 'send',
      amount: 5000,
      currency: 'USDC',
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      recipientLabel: 'Shenzhen Supplier',
      status: 'completed',
      date: '2024-01-28 14:32',
      txHash: '0xabc123def456...',
      fee: 'Gasless',
      reference: 'INV-2024-001'
    },
    {
      id: 'tx-002',
      type: 'onramp',
      amount: 8000,
      currency: 'USDC',
      from: '₦12,800,000',
      status: 'completed',
      date: '2024-01-25 10:15',
      fee: '₦192,000 (1.5%)',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'tx-003',
      type: 'offramp',
      amount: 1500,
      currency: 'USDC',
      to: '₦2,400,000',
      bankAccount: 'GTBank - 0123456789',
      status: 'completed',
      date: '2024-01-22 16:45',
      fee: '₦36,000 (1.5%)'
    },
    {
      id: 'tx-004',
      type: 'convert',
      amount: 1000,
      fromCurrency: 'USDC',
      toCurrency: 'cNGN',
      toAmount: 1600000,
      status: 'completed',
      date: '2024-01-20 09:20',
      fee: '₦8,000 (0.5%)'
    },
    {
      id: 'tx-005',
      type: 'send',
      amount: 3200,
      currency: 'USDT',
      recipient: '0x9876543210abcdef...',
      recipientLabel: 'Dubai Textile',
      status: 'pending',
      date: '2024-01-28 18:05',
      txHash: '0xdef789ghi012...',
      fee: 'Gasless'
    },
    {
      id: 'tx-006',
      type: 'onramp',
      amount: 2450,
      currency: 'USDT',
      from: '₦3,920,000',
      status: 'completed',
      date: '2024-01-18 11:30',
      fee: '₦58,800 (1.5%)',
      paymentMethod: 'Debit Card'
    }
  ];

  const filteredTransactions = allTransactions.filter(tx => {
    // Filter by type
    if (filterType !== 'all' && tx.type !== filterType) return false;
    
    // Filter by status
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tx.id.toLowerCase().includes(query) ||
        tx.currency?.toLowerCase().includes(query) ||
        tx.recipientLabel?.toLowerCase().includes(query) ||
        tx.recipient?.toLowerCase().includes(query) ||
        tx.reference?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'send':
        return <ArrowUp size={20} className="text-red-600" />;
      case 'onramp':
        return <Plus size={20} className="text-green-600" />;
      case 'offramp':
        return <ArrowDown size={20} className="text-blue-600" />;
      case 'convert':
        return <ArrowsLeftRight size={20} className="text-purple-600" />;
      default:
        return <CheckCircle size={20} className="text-gray-600" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'send':
        return 'Sent Payment';
      case 'onramp':
        return 'Added Funds';
      case 'offramp':
        return 'Withdrew to Bank';
      case 'convert':
        return 'Currency Conversion';
      default:
        return 'Transaction';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
            <CheckCircle size={14} />
            <span>Completed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
            <Clock size={14} />
            <span>Pending</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
            <X size={14} />
            <span>Failed</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleViewDetails = (tx) => {
    setSelectedTx(tx);
    setShowDetailModal(true);
  };

  const handleExportCSV = () => {
    showToast('Exporting transactions...', 'info');
    // In production, generate and download CSV
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600 mt-1">Complete history of all your activities</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
              
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <Funnel size={20} className="text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="all">All Types</option>
                  <option value="onramp">Added Funds</option>
                  <option value="send">Sent Payments</option>
                  <option value="offramp">Withdrawals</option>
                  <option value="convert">Conversions</option>
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {filteredTransactions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => handleViewDetails(tx)}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="p-3 bg-gray-100 rounded-xl">
                          {getTypeIcon(tx.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <p className="font-semibold text-gray-900">{getTypeLabel(tx.type)}</p>
                            {getStatusBadge(tx.status)}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{tx.date}</span>
                            <span>•</span>
                            <span className="font-mono">{tx.id}</span>
                            {tx.reference && (
                              <>
                                <span>•</span>
                                <span>Ref: {tx.reference}</span>
                              </>
                            )}
                          </div>
                          
                          {/* Type-specific details */}
                          {tx.type === 'send' && tx.recipientLabel && (
                            <p className="text-sm text-gray-500 mt-1">To: {tx.recipientLabel}</p>
                          )}
                          {tx.type === 'onramp' && (
                            <p className="text-sm text-gray-500 mt-1">From {tx.from} via {tx.paymentMethod}</p>
                          )}
                          {tx.type === 'offramp' && (
                            <p className="text-sm text-gray-500 mt-1">To {tx.bankAccount}</p>
                          )}
                          {tx.type === 'convert' && (
                            <p className="text-sm text-gray-500 mt-1">{tx.fromCurrency} → {tx.toCurrency}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <p className={`text-xl font-bold ${
                          tx.type === 'onramp' || tx.type === 'convert' ? 'text-green-600' :
                          tx.type === 'send' || tx.type === 'offramp' ? 'text-red-600' :
                          'text-gray-900'
                        }`}>
                          {tx.type === 'onramp' ? '+' : tx.type === 'send' || tx.type === 'offramp' ? '-' : ''}
                          {tx.type === 'convert' 
                            ? `${tx.amount} ${tx.fromCurrency}`
                            : `${tx.amount.toLocaleString()} ${tx.currency}`
                          }
                        </p>
                        {tx.fee && (
                          <p className="text-xs text-gray-500 mt-1">Fee: {tx.fee}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlass size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : 'No transactions match your filters'
                  }
                </p>
                {(filterType !== 'all' || filterStatus !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setFilterStatus('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">{filteredTransactions.length}</span> of{' '}
                <span className="font-medium">{allTransactions.length}</span> transactions
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50" disabled>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Status</span>
                  {getStatusBadge(selectedTx.status)}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Type</p>
                    <p className="font-medium text-gray-900">{getTypeLabel(selectedTx.type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                    <p className="font-medium text-gray-900">{selectedTx.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm text-gray-900">{selectedTx.id}</p>
                      <button onClick={() => copyToClipboard(selectedTx.id)}>
                        <Copy size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="font-bold text-xl text-gray-900">
                      {selectedTx.amount} {selectedTx.currency}
                    </p>
                  </div>
                </div>

                {/* Type-specific details */}
                {selectedTx.type === 'send' && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Recipient</p>
                    {selectedTx.recipientLabel && (
                      <p className="font-medium text-gray-900 mb-1">{selectedTx.recipientLabel}</p>
                    )}
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm text-gray-700 break-all">{selectedTx.recipient}</p>
                      <button onClick={() => copyToClipboard(selectedTx.recipient)}>
                        <Copy size={16} className="text-gray-500" />
                      </button>
                    </div>
                    {selectedTx.txHash && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
                        <a
                          href={`https://starkscan.co/tx/${selectedTx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                        >
                          <span>View on StarkScan</span>
                          <Eye size={16} />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {selectedTx.type === 'onramp' && (
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">From</p>
                        <p className="font-medium text-gray-900">{selectedTx.from}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                        <p className="font-medium text-gray-900">{selectedTx.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTx.type === 'offramp' && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">To NGN</p>
                        <p className="font-medium text-gray-900">{selectedTx.to}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Bank Account</p>
                        <p className="font-medium text-gray-900">{selectedTx.bankAccount}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTx.type === 'convert' && (
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">From</p>
                        <p className="font-medium text-gray-900">{selectedTx.amount} {selectedTx.fromCurrency}</p>
                      </div>
                      <ArrowsLeftRight size={24} className="text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">To</p>
                        <p className="font-medium text-gray-900">{selectedTx.toAmount?.toLocaleString()} {selectedTx.toCurrency}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fee */}
                {selectedTx.fee && (
                  <div className="flex items-center justify-between p-3 border-t border-gray-200">
                    <span className="text-gray-600">Fee</span>
                    <span className="font-medium text-gray-900">{selectedTx.fee}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      showToast('Downloading receipt...', 'info');
                      setShowDetailModal(false);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                  >
                    Download Receipt
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className={`flex items-center space-x-3 p-4 rounded-xl shadow-lg border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200' : 
            toast.type === 'error' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="text-sm font-medium text-gray-900">{toast.message}</div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Transactions;