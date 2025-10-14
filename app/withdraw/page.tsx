"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Layout from '../components/core/Layout';
import {
  ArrowDown,
  Bank,
  Plus,
  Warning,
  CheckCircle,
  Clock,
  Trash,
  Info
} from '@phosphor-icons/react';
import { breadApi, type Asset } from '@/app/lib/breadApi';
import usdtLogo from "@/public/usdt-logo.svg";
import usdcLogo from "@/public/usdc-logo.svg";
import cngnLogo from "@/public/cngn-logo.png";

const Withdraw = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Asset>('base:usdc');
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [showAddBank, setShowAddBank] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [walletId, setWalletId] = useState('');

  const wallets = [
    { symbol: 'base:usdc', name: 'USD Coin (Base)', balance: 8450.00, icon: '💵', color: 'from-blue-500 to-blue-600' },
    { symbol: 'polygon:usdt', name: 'Tether (Polygon)', balance: 2450.00, icon: '₮', color: 'from-purple-500 to-purple-600' },
    { symbol: 'bsc:usdt', name: 'Tether (BSC)', balance: 1200.00, icon: '₮', color: 'from-teal-500 to-teal-600' },
    { symbol: 'base:cngn', name: 'Canza NGN (Base)', balance: 3200000, icon: '🇳🇬', color: 'from-green-500 to-green-600' }
  ];

  const [bankAccounts, setBankAccounts] = useState([
    {
      id: '1',
      bankName: 'GTBank',
      accountNumber: '0123456789',
      accountName: 'John Doe',
      isPrimary: true
    },
    {
      id: '2',
      bankName: 'First Bank',
      accountNumber: '9876543210',
      accountName: 'John Doe',
      isPrimary: false
    }
  ]);

  const [newBank, setNewBank] = useState({
    bankName: '',
    accountNumber: '',
    accountName: ''
  });

  useEffect(() => {
    const breadWalletId = localStorage.getItem('payportz_bread_wallet_id');
    if (breadWalletId) {
      setWalletId(breadWalletId);
    }
    fetchRate();
  }, []);

  const fetchRate = async () => {
    try {
      const rateData = await breadApi.getOfframpRate('NGN');
      setRate(rateData.rate);
    } catch (error) {
      console.error('Failed to fetch rate:', error);
    }
  };

  const fetchQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoadingQuote(true);
    try {
      const quoteData = await breadApi.getOfframpQuote(
        parseFloat(amount),
        'NGN',
        selectedCurrency as Asset,
        false
      );
      setQuote(quoteData);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch quote', 'error');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (amount && parseFloat(amount) > 0) {
        fetchQuote();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [amount, selectedCurrency]);

  const selectedWallet = wallets.find(w => w.symbol === selectedCurrency);
  const amountValue = parseFloat(amount) || 0;
  const insufficientBalance = amountValue > (selectedWallet?.balance || 0);

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddBank = () => {
    if (!newBank.bankName || !newBank.accountNumber || !newBank.accountName) {
      showToast('Please fill all bank details', 'error');
      return;
    }

    const newBankAccount = {
      id: Date.now().toString(),
      ...newBank,
      isPrimary: bankAccounts.length === 0
    };

    setBankAccounts([...bankAccounts, newBankAccount]);
    setNewBank({ bankName: '', accountNumber: '', accountName: '' });
    setShowAddBank(false);
    showToast('Bank account added successfully!');
  };

  const handleRemoveBank = (id: string) => {
    if (window.confirm('Are you sure you want to remove this bank account?')) {
      setBankAccounts(bankAccounts.filter(bank => bank.id !== id));
      showToast('Bank account removed');
    }
  };

  const handleWithdraw = async () => {
    if (!selectedBank) {
      showToast('Please select a bank account', 'error');
      return;
    }
    if (!amount || amountValue <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (insufficientBalance) {
      showToast('Insufficient balance', 'error');
      return;
    }
    if (!walletId) {
      showToast('Wallet not found. Please reconnect your wallet.', 'error');
      return;
    }

    // In production, you would create a beneficiary first via Bread API
    // then execute the offramp
    showToast('Offramp integration coming soon! Contact support to add beneficiary.', 'info');
    
    // Example of how to execute offramp (once beneficiary is created):
    // const beneficiaryId = '...'; // Get from Bread API after creating beneficiary
    // const result = await breadApi.executeOfframp(walletId, amountValue, beneficiaryId, selectedCurrency);
    // console.log('Offramp reference:', result.reference);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
            <p className="text-gray-600 mt-1">Convert crypto to NGN via Bread Offramp</p>
          </div>

          {!isSignedIn && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <Warning size={24} className="text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">Sign in required</p>
                  <p className="text-sm text-yellow-700">Please sign in to withdraw funds</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Select Currency to Withdraw</h2>
                <div className="grid grid-cols-2 gap-4">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.symbol}
                      onClick={() => setSelectedCurrency(wallet.symbol as Asset)}
                      disabled={wallet.balance === 0}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedCurrency === wallet.symbol
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${wallet.balance === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${wallet.color} flex items-center justify-center text-xl mb-2 mx-auto`}>
                        {wallet.icon}
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{wallet.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {wallet.balance.toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Enter Amount</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Withdraw
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-4 pr-20 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-2xl font-semibold"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      {selectedCurrency.split(':')[1].toUpperCase()}
                    </span>
                  </div>
                  
                  {selectedWallet && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600">
                        Available: {selectedWallet.balance.toLocaleString()} {selectedCurrency.split(':')[1].toUpperCase()}
                      </p>
                      <button
                        onClick={() => setAmount(selectedWallet.balance.toString())}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Max
                      </button>
                    </div>
                  )}
                  
                  {insufficientBalance && amountValue > 0 && (
                    <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                      <Warning size={16} />
                      <span>Insufficient balance</span>
                    </p>
                  )}
                </div>

                {isLoadingQuote && (
                  <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                    <span className="text-sm text-blue-700">Fetching quote...</span>
                  </div>
                )}

                {quote && amountValue > 0 && !insufficientBalance && !isLoadingQuote && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{quote.input_amount} {selectedCurrency.split(':')[1].toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exchange rate:</span>
                        <span className="font-medium">₦{quote.rate.toLocaleString()} per token</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">NGN equivalent:</span>
                        <span className="font-medium">₦{quote.output_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Offramp fee:</span>
                        <span className="font-medium text-green-600">
                          {quote.fee === 0 ? 'FREE' : `₦${quote.fee.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-green-200">
                        <span className="text-gray-900 font-semibold">You'll receive:</span>
                        <span className="text-gray-900 font-bold">₦{quote.output_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">Quote expires:</span>
                        <span className="text-xs text-gray-600">{new Date(quote.expiry).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {rate && !quote && (
                  <p className="text-sm text-gray-600 mt-2">
                    Current rate: ₦{rate.toLocaleString()} per token
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">3. Select Bank Account</h2>
                  <button
                    onClick={() => setShowAddBank(!showAddBank)}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus size={16} />
                    <span>Add Bank</span>
                  </button>
                </div>

                {showAddBank && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <select
                        value={newBank.bankName}
                        onChange={(e) => setNewBank({...newBank, bankName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="">Select Bank</option>
                        <option value="GTBank">GTBank</option>
                        <option value="First Bank">First Bank</option>
                        <option value="Access Bank">Access Bank</option>
                        <option value="Zenith Bank">Zenith Bank</option>
                        <option value="UBA">UBA</option>
                        <option value="Stanbic IBTC">Stanbic IBTC</option>
                        <option value="Opay">Opay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={newBank.accountNumber}
                        onChange={(e) => setNewBank({...newBank, accountNumber: e.target.value})}
                        placeholder="0123456789"
                        maxLength={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                      <input
                        type="text"
                        value={newBank.accountName}
                        onChange={(e) => setNewBank({...newBank, accountName: e.target.value})}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddBank}
                        className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                      >
                        Save Bank Account
                      </button>
                      <button
                        onClick={() => {
                          setShowAddBank(false);
                          setNewBank({ bankName: '', accountNumber: '', accountName: '' });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {bankAccounts.length > 0 ? (
                  <div className="space-y-3">
                    {bankAccounts.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          selectedBank === bank.id
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Bank size={24} className="text-gray-700" />
                            <div>
                              <p className="font-semibold text-gray-900">{bank.bankName}</p>
                              <p className="text-sm text-gray-600">{bank.accountNumber}</p>
                              <p className="text-sm text-gray-500">{bank.accountName}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBank(bank.id);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash size={18} className="text-red-600" />
                          </button>
                        </div>
                        {bank.isPrimary && (
                          <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bank size={48} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3">No bank accounts added</p>
                    <button
                      onClick={() => setShowAddBank(true)}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                    >
                      Add Your First Bank Account
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleWithdraw}
                disabled={!isSignedIn || !amount || !selectedBank || insufficientBalance}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowDown size={20} />
                <span>Withdraw to Bank Account</span>
              </button>
            </div>

            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock size={24} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Arrival Time</h3>
                </div>
                <p className="text-gray-700">Your NGN will arrive in your bank account within:</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">15 mins - 2 hours</p>
                <p className="text-sm text-gray-500 mt-2">Typically arrives in under 30 minutes</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-3">Why Withdraw via Bread?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Fast bank transfers (under 2 hours)</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Competitive exchange rates</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Low fees (typically under 1.5%)</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Secure & compliant</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Support for multiple chains</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">🔒 Security</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>Bank accounts are verified using your BVN.</p>
                  <p>All withdrawals are encrypted and monitored.</p>
                  <p>Withdrawal receipts emailed automatically.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-start space-x-2">
                  <Info size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-600">
                    <p className="font-medium text-gray-900 mb-1">Daily Limits</p>
                    <p>Maximum withdrawal: ₦10,000,000 per day for verified accounts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50">
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

export default Withdraw;