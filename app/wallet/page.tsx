"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import Layout from "../components/core/Layout";
import { 
  Wallet,
  Copy,
  ArrowsLeftRight,
  Download,
  MagnifyingGlass,
  Funnel,
  Eye,
  EyeSlash,
  CheckCircle,
  Clock,
  X,
  ArrowUp,
  ArrowDown,
  Plus,
  QrCode,
  Shield,
  Key,
  Info
} from '@phosphor-icons/react';
import { breadApi } from '@/app/lib/breadApi';
import usdtLogo from "@/public/usdt-logo.svg";
import usdcLogo from "@/public/usdc-logo.svg";
import cngnLogo from "@/public/cngn-logo.png";

export default function WalletPage() {
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddress, setShowAddress] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletId, setWalletId] = useState('');
  const [evmAddress, setEvmAddress] = useState('');
  const [svmAddress, setSvmAddress] = useState('');
  const [toast, setToast] = useState<any>(null);

  const logoMap: Record<string, any> = {
    'USDC': usdcLogo,
    'USDT': usdtLogo,
    'CNGN': cngnLogo,
  };

  const colorMap: Record<string, string> = {
    'USDC': 'from-blue-500 to-blue-600',
    'USDT': 'from-teal-500 to-teal-600',
    'CNGN': 'from-green-500 to-green-600',
  };

  useEffect(() => {
    const breadWalletId = localStorage.getItem('payportz_bread_wallet_id');
    const breadEvmAddr = localStorage.getItem('payportz_bread_wallet_evm');
    const breadSvmAddr = localStorage.getItem('payportz_bread_wallet_svm');
    
    if (breadWalletId) setWalletId(breadWalletId);
    if (breadEvmAddr) setEvmAddress(breadEvmAddr);
    if (breadSvmAddr) setSvmAddress(breadSvmAddr);
    
    if (breadWalletId) {
      fetchWalletData(breadWalletId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchWalletData = async (id: string) => {
    setIsLoading(true);
    try {
      const balances = await breadApi.getBalances(id);
      const transformedWallets = balances.map((balance: any) => ({
        id: balance.id,
        symbol: balance.code,
        name: balance.name,
        blockchain: balance.blockchain.name,
        balance: balance.available,
        available: balance.available,
        debt: balance.debt,
        color: colorMap[balance.code] || 'from-gray-500 to-gray-600',
        logo: logoMap[balance.code] || null,
      }));
      setWallets(transformedWallets);
    } catch (error: any) {
      showToast('Failed to load wallet data', 'error');
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const exportTransactions = () => {
    showToast('Export feature coming soon!', 'info');
  };

  // Mock transactions - would come from API
  const transactions = [
    {
      id: 'tx1',
      type: 'receive',
      asset: 'USDC',
      amount: 1000,
      from: 'Deposit',
      to: evmAddress,
      date: '2024-01-28 14:32',
      status: 'completed',
      hash: '0xabc123...'
    },
    {
      id: 'tx2',
      type: 'send',
      asset: 'USDC',
      amount: 500,
      from: evmAddress,
      to: '0x742d35Cc...',
      date: '2024-01-27 10:15',
      status: 'completed',
      hash: '0xdef456...'
    },
  ];

  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (selectedWallet !== 'all' && !tx.asset.includes(selectedWallet)) return false;
    if (searchQuery && !tx.hash.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-black mx-auto"></div>
            <p className="text-gray-900 mt-6 text-lg font-medium">Loading wallet...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Wallet Details</h1>
              <p className="text-gray-600 mt-1">Manage your addresses and transaction history</p>
            </div>
            <button
              onClick={exportTransactions}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>

          {/* Wallet Addresses Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Wallet Addresses</h2>
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showAddress ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="space-y-4">
              {/* EVM Address */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Wallet size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">EVM Address</p>
                      <p className="text-xs text-gray-600">Base, Polygon, BSC, Ethereum, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(evmAddress)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                    <button className="p-2 hover:bg-white rounded-lg transition-colors">
                      <QrCode size={16} />
                    </button>
                  </div>
                </div>
                {showAddress ? (
                  <p className="font-mono text-sm text-gray-700 bg-white p-3 rounded-lg break-all">
                    {evmAddress}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">••••••••••••••••••••••••••••</p>
                )}
              </div>

              {/* Solana Address */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <Wallet size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Solana Address</p>
                      <p className="text-xs text-gray-600">Solana Network</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(svmAddress)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                    <button className="p-2 hover:bg-white rounded-lg transition-colors">
                      <QrCode size={16} />
                    </button>
                  </div>
                </div>
                {showAddress ? (
                  <p className="font-mono text-sm text-gray-700 bg-white p-3 rounded-lg break-all">
                    {svmAddress}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">••••••••••••••••••••••••••••</p>
                )}
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Security Notice</p>
                  <p>Only share these addresses when you want to receive funds. Never share your private keys or recovery phrase.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Asset Breakdown</h2>
            
            {wallets.length === 0 ? (
              <div className="text-center py-8">
                <Wallet size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No assets in wallet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${wallet.color} flex items-center justify-center p-2`}>
                        {wallet.logo ? (
                          <Image src={wallet.logo} alt={wallet.name} width={40} height={40} className="object-contain" />
                        ) : (
                          <span className="text-xl">💰</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{wallet.name}</p>
                        <p className="text-sm text-gray-500">{wallet.blockchain}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {wallet.balance.toLocaleString()} {wallet.symbol}
                      </p>
                      <p className="text-sm text-gray-500">Available: {wallet.available.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
              
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by hash..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center space-x-2">
                  <Funnel size={20} className="text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="send">Sent</option>
                    <option value="receive">Received</option>
                  </select>
                </div>

                {/* Asset Filter */}
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                >
                  <option value="all">All Assets</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.symbol}>{w.symbol}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'}`}>
                        {tx.type === 'send' ? (
                          <ArrowUp size={20} className="text-red-600" />
                        ) : (
                          <ArrowDown size={20} className="text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {tx.type === 'send' ? 'Sent' : 'Received'} {tx.asset}
                        </p>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span>{tx.date}</span>
                          <span className="font-mono">{tx.hash}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.asset}
                      </p>
                      <div className="flex items-center justify-end space-x-1 text-xs">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-gray-500">Completed</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MagnifyingGlass size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No transactions found</p>
                </div>
              )}
            </div>
          </div>

          {/* Wallet Settings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Settings</h2>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <Key size={20} className="text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Backup Wallet</p>
                    <p className="text-sm text-gray-600">Export your wallet backup</p>
                  </div>
                </div>
                <ArrowsLeftRight size={20} className="text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <Shield size={20} className="text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Security Settings</p>
                    <p className="text-sm text-gray-600">Manage wallet security</p>
                  </div>
                </div>
                <ArrowsLeftRight size={20} className="text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <Info size={20} className="text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Wallet Information</p>
                    <p className="text-sm text-gray-600">View wallet details</p>
                  </div>
                </div>
                <ArrowsLeftRight size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
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
}