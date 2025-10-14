'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Layout from '../components/core/Layout';
import { 
  Wallet,
  TrendUp,
  ArrowUp,
  ArrowDown,
  Plus,
  Eye,
  EyeSlash,
  ArrowsLeftRight,
  Spinner,
  Copy
} from '@phosphor-icons/react';
import { breadApi } from '@/app/lib/breadApi';
import usdtLogo from "@/public/usdt-logo.svg";
import usdcLogo from "@/public/usdc-logo.svg";
import cngnLogo from "@/public/cngn-logo.png";

const Dashboard = () => {
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletId, setWalletId] = useState('');
  const [evmAddress, setEvmAddress] = useState('');
  const [svmAddress, setSvmAddress] = useState('');

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

  const [exchangeRates, setExchangeRates] = useState<any[]>([]);

  useEffect(() => {
    const breadWalletId = localStorage.getItem('payportz_bread_wallet_id');
    const breadWalletEvm = localStorage.getItem('payportz_bread_wallet_evm');
    const breadWalletSvm = localStorage.getItem('payportz_bread_wallet_svm');
    
    if (breadWalletId) {
      setWalletId(breadWalletId);
      fetchBalances(breadWalletId);
      fetchExchangeRates();
    } else {
      setIsLoading(false);
    }
    
    if (breadWalletEvm) setEvmAddress(breadWalletEvm);
    if (breadWalletSvm) setSvmAddress(breadWalletSvm);
  }, []);

  const fetchExchangeRates = async () => {
    try {
      const [onrampRateData, offrampRateData] = await Promise.all([
        breadApi.getOnrampRate('NGN'),
        breadApi.getOfframpRate('NGN')
      ]);

      setExchangeRates([
        { 
          from: 'NGN', 
          to: 'USDC', 
          rate: onrampRateData.rate, 
          trend: 'up',
          label: 'Buy Rate'
        },
        { 
          from: 'USDC', 
          to: 'NGN', 
          rate: offrampRateData.rate, 
          trend: 'up',
          label: 'Sell Rate'
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    }
  };

  const fetchBalances = async (id: string) => {
    setIsLoading(true);
    try {
      const balances = await breadApi.getBalances(id);
      
      const transformedWallets = balances.map((balance: any) => ({
        id: balance.id,
        symbol: balance.code,
        name: balance.name,
        blockchain: balance.blockchain.name,
        balance: balance.available,
        usdValue: balance.code === 'CNGN' ? balance.available / 1600 : balance.available,
        change24h: 0,
        color: colorMap[balance.code] || 'from-gray-500 to-gray-600',
        logo: logoMap[balance.code] || null,
      }));

      setWallets(transformedWallets);
    } catch (error: any) {
      console.error('Failed to fetch balances:', error);
      showToast('Failed to load balances', 'error');
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const recentTransactions = [
    {
      id: 'tx1',
      type: 'send',
      amount: 5000,
      currency: 'USDC',
      supplierName: 'Shenzhen Textile Co.',
      country: '🇨🇳 China',
      date: '2 hours ago',
      status: 'completed'
    },
    {
      id: 'tx2',
      type: 'onramp',
      amount: 8000,
      currency: 'USDC',
      from: '₦12,800,000',
      date: '1 day ago',
      status: 'completed'
    },
    {
      id: 'tx3',
      type: 'offramp',
      amount: 1500,
      currency: 'USDC',
      to: '₦2,400,000',
      date: '3 days ago',
      status: 'completed'
    }
  ];

  const totalUsdValue = wallets.reduce((sum, wallet) => sum + wallet.usdValue, 0);

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUp size={20} className="text-red-600" />;
      case 'onramp':
        return <Plus size={20} className="text-green-600" />;
      case 'offramp':
        return <ArrowDown size={20} className="text-blue-600" />;
      default:
        return <ArrowsLeftRight size={20} className="text-gray-600" />;
    }
  };

  const getTransactionLabel = (tx: any) => {
    switch (tx.type) {
      case 'send':
        return `Sent to ${tx.supplierName || tx.recipient} · ${tx.country || ''}`;
      case 'onramp':
        return `Added funds (${tx.from})`;
      case 'offramp':
        return `Withdrew to bank (${tx.to})`;
      default:
        return 'Transaction';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-black mx-auto"></div>
            <p className="text-gray-900 mt-6 text-lg font-medium">Loading your balances...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your multi-currency balances</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchBalances(walletId)}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                title="Refresh balances"
              >
                <ArrowsLeftRight size={20} />
              </button>
              <button
                onClick={() => setBalancesHidden(!balancesHidden)}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {balancesHidden ? <Eye size={20} /> : <EyeSlash size={20} />}
              </button>
            </div>
          </div>

          {/* Total Balance Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-300 text-sm mb-2">Total Balance (USD)</p>
                <div className="flex items-baseline space-x-3">
                  {balancesHidden ? (
                    <span className="text-5xl font-bold">••••••</span>
                  ) : (
                    <>
                      <span className="text-5xl font-bold">${totalUsdValue.toLocaleString()}</span>
                      <span className="text-xl text-gray-400">.{(totalUsdValue % 1).toFixed(2).slice(2)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white bg-opacity-10 px-4 py-2 rounded-xl">
                <Wallet size={20} className="text-blue-400" />
                <span className="text-blue-400 font-medium">{wallets.length} Assets</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => window.location.href = '/add-funds'}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-xl p-4 transition-all text-left"
              >
                <Plus size={24} className="mb-2" />
                <div className="font-medium">Add Money</div>
                <div className="text-sm text-gray-300">Deposit Naira</div>
              </button>
              
              <button
                onClick={() => window.location.href = '/send'}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-xl p-4 transition-all text-left"
              >
                <ArrowUp size={24} className="mb-2" />
                <div className="font-medium">Send Payment</div>
                <div className="text-sm text-gray-300">Pay suppliers</div>
              </button>
              
              <button
                onClick={() => window.location.href = '/withdraw'}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-xl p-4 transition-all text-left"
              >
                <ArrowDown size={24} className="mb-2" />
                <div className="font-medium">Withdraw</div>
                <div className="text-sm text-gray-300">Cash out to bank</div>
              </button>
              
              <button
                onClick={() => {
                  const address = evmAddress || svmAddress;
                  if (address) {
                    copyToClipboard(address, 'Wallet address');
                  } else {
                    showToast('No wallet address found', 'error');
                  }
                }}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-xl p-4 transition-all text-left"
              >
                <Wallet size={24} className="mb-2" />
                <div className="font-medium">Receive Crypto</div>
                <div className="text-sm text-gray-300">Copy address</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Wallet Balances */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Wallets</h2>
              
              {wallets.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center">
                  <Wallet size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No balances yet</h3>
                  <p className="text-gray-600 mb-6">Add money to your wallet to get started</p>
                  <button
                    onClick={() => window.location.href = '/add-funds'}
                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 font-medium"
                  >
                    Add Money Now
                  </button>
                </div>
              ) : (
                wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center p-2`}>
                          {wallet.logo ? (
                            <Image src={wallet.logo} alt={wallet.name} width={40} height={40} className="object-contain" />
                          ) : (
                            <span className="text-2xl">💰</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{wallet.symbol}</h3>
                          <p className="text-sm text-gray-500">{wallet.name} · {wallet.blockchain}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {balancesHidden ? (
                          <p className="text-2xl font-bold text-gray-900">••••••</p>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-gray-900">
                              {wallet.symbol === 'CNGN' 
                                ? `₦${wallet.balance.toLocaleString()}`
                                : `${wallet.balance.toLocaleString()} ${wallet.symbol}`
                              }
                            </p>
                            {wallet.symbol !== 'USDC' && wallet.symbol !== 'USDT' && (
                              <p className="text-sm text-gray-500">≈ ${wallet.usdValue.toLocaleString()}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => window.location.href = `/send?currency=${wallet.id}`}
                        disabled={wallet.balance === 0}
                        className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => window.location.href = `/withdraw?currency=${wallet.id}`}
                        disabled={wallet.balance === 0}
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Exchange Rates */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Live Exchange Rates</h3>
                {exchangeRates.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Loading rates...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exchangeRates.map((rate, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <ArrowsLeftRight size={16} className="text-gray-400" />
                          <div>
                            <span className="text-sm font-medium text-gray-700 block">
                              {rate.from} → {rate.to}
                            </span>
                            <span className="text-xs text-gray-500">{rate.label}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">₦{rate.rate.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Crypto Deposit Card */}
              {(evmAddress || svmAddress) && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <Wallet size={24} className="text-gray-900" />
                    <h3 className="font-semibold text-lg text-gray-900">Receive Crypto</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Send crypto from any wallet or exchange to your PayPortz addresses</p>
                  
                  <div className="space-y-3">
                    {evmAddress && (
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-700">EVM NETWORKS</p>
                          <span className="text-xs text-gray-500">Base • Polygon • BSC</span>
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                          <p className="font-mono text-xs text-gray-900 truncate flex-1">{evmAddress}</p>
                          <button
                            onClick={() => copyToClipboard(evmAddress, 'EVM address')}
                            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-medium flex-shrink-0 flex items-center space-x-1"
                          >
                            <Copy size={14} />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {svmAddress && (
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-700">SOLANA NETWORK</p>
                          <span className="text-xs text-gray-500">SPL Tokens</span>
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                          <p className="font-mono text-xs text-gray-900 truncate flex-1">{svmAddress}</p>
                          <button
                            onClick={() => copyToClipboard(svmAddress, 'Solana address')}
                            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-medium flex-shrink-0 flex items-center space-x-1"
                          >
                            <Copy size={14} />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => window.location.href = '/add-funds?method=crypto'}
                    className="w-full mt-4 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    View Full Address Details
                  </button>
                </div>
              )}

              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-900">Recent Activity</h3>
                  <button
                    onClick={() => window.location.href = '/transactions'}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.currency}
                          </p>
                          <p className="text-xs text-gray-500">{getTransactionLabel(tx)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">💡 Did you know?</h3>
                <p className="text-sm text-gray-700">
                  You save up to 95% on fees compared to traditional bank transfers!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className={`flex items-center space-x-3 p-4 rounded-xl shadow-lg border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="text-sm font-medium text-gray-900">{toast.message}</div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;