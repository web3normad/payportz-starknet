// components/TransferModal.tsx - SIMPLIFIED VERSION
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useTransfer } from '@chipi-stack/nextjs';
import { 
  X, 
  Wallet, 
  CheckCircle, 
  CurrencyDollar, 
  Warning, 
  LockKey, 
  ArrowUp,
  Copy
} from '@phosphor-icons/react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (txHash: string) => void;
}

interface WalletData {
  publicKey: string;
  encryptedPrivateKey: string;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    pin: '',
    recipient: '',
    amount: ''
  });
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletError, setWalletError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState<string>('');
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [userFriendlyError, setUserFriendlyError] = useState<string>('');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState('');
  
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const { transferAsync, isLoading: isTransferring, error: transferError } = useTransfer();

  // Load wallet data from localStorage when modal opens
  useEffect(() => {
    if (!isOpen || !isSignedIn || !user?.id) return;

    setIsLoadingWallet(true);
    setWalletError('');
    setShowSuccess(false);
    setSuccessTxHash('');

    // Small delay to show loading state
    setTimeout(() => {
      try {
        console.log('🔍 Loading wallet for user:', user.id);

        // Get wallet from localStorage
        const localAddress = localStorage.getItem('payportz_chipiwallet_address');
        const localEncryptedKey = localStorage.getItem('payportz_chipiwallet_encryptedKey');
        const localUserId = localStorage.getItem('payportz_chipiwallet_externalUserId');

        if (localAddress && localEncryptedKey && localUserId === user.id) {
          console.log('✅ Wallet loaded from localStorage:', {
            address: localAddress.slice(0, 10) + '...',
            hasEncryptedKey: !!localEncryptedKey
          });

          setWalletData({
            publicKey: localAddress,
            encryptedPrivateKey: localEncryptedKey
          });
        } else {
          console.error('❌ Wallet not found in localStorage');
          setWalletError('Wallet not found. Please create a wallet first.');
        }
      } catch (error: any) {
        console.error('❌ Error loading wallet:', error);
        setWalletError('Failed to load wallet. Please try again.');
      } finally {
        setIsLoadingWallet(false);
      }
    }, 500);
  }, [isOpen, isSignedIn, user?.id]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setForm({ pin: '', recipient: '', amount: '' });
      setShowSuccess(false);
      setSuccessTxHash('');
    }
  }, [isOpen]);

  // Helper function to extract transaction hash from result
  const extractTxHash = (result: any): string => {
    if (typeof result === 'string') {
      return result;
    }
    if (result && typeof result === 'object') {
      return result.transactionHash || result.hash || result.txHash || 'success';
    }
    return 'success';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setUserFriendlyError('');
    
    if (!form.pin || !form.recipient || !form.amount) {
      alert('Please fill all fields');
      return;
    }

    if (!walletData?.publicKey || !walletData?.encryptedPrivateKey) {
      alert('Wallet not loaded. Please close and reopen this modal.');
      return;
    }

    // Validate recipient address format
    if (!form.recipient.startsWith('0x')) {
      alert('Recipient address must start with 0x');
      return;
    }

    // StarkNet addresses are typically 63-66 characters (0x + 61-64 hex chars)
    if (form.recipient.length < 63 || form.recipient.length > 66) {
      alert('Please enter a valid StarkNet address (0x followed by 61-64 hex characters)');
      return;
    }

    // Validate it contains only hex characters
    const hexPattern = /^0x[0-9a-fA-F]+$/;
    if (!hexPattern.test(form.recipient)) {
      alert('Recipient address contains invalid characters. Only hexadecimal characters (0-9, a-f) are allowed.');
      return;
    }

    // Validate amount
    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    try {
      const bearerToken = await getToken();

      if (!bearerToken) {
        alert('Authentication error. Please sign in again.');
        return;
      }

      console.log('🚀 Starting transfer...', {
        amount: form.amount,
        recipient: form.recipient.slice(0, 10) + '...',
        wallet: walletData.publicKey.slice(0, 10) + '...'
      });

      const transferResult = await transferAsync({
        params: {
          amount: form.amount,
          encryptKey: form.pin,
          wallet: {
            publicKey: walletData.publicKey,
            encryptedPrivateKey: walletData.encryptedPrivateKey
          },
          recipient: form.recipient,
          token: "USDC" as any,
        },
        bearerToken: bearerToken,
      });

      console.log('✅ Transfer completed:', transferResult);

      // Extract transaction hash
      const txHash = extractTxHash(transferResult);
      setSuccessTxHash(txHash);
      setShowSuccess(true);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(txHash);
      }

      // Reset form after delay
      setTimeout(() => {
        setForm({ pin: '', recipient: '', amount: '' });
        setShowSuccess(false);
        setSuccessTxHash('');
        onClose();
      }, 3000);
      
    } catch (err: any) {
      console.error('❌ Transfer failed:', err);
      
      const errorMessage = err.message || err.toString();
      
      // Parse and set user-friendly error messages
      if (errorMessage.includes('u256_sub Overflow') || 
          errorMessage.includes('insufficient') ||
          errorMessage.includes('Overflow')) {
        setUserFriendlyError('Insufficient USDC balance. You don\'t have enough USDC to complete this transfer. Please check your balance and try again with a smaller amount.');
      } else if (errorMessage.includes('encryptKey') || 
                 errorMessage.includes('PIN') || 
                 errorMessage.includes('decrypt') ||
                 errorMessage.includes('Invalid password')) {
        setUserFriendlyError('Incorrect PIN. Please check your PIN and try again. Make sure you\'re using the same PIN you set during wallet creation.');
      } else if (errorMessage.includes('multicall-failed')) {
        setUserFriendlyError('Transaction failed on the blockchain. This could be due to insufficient balance, invalid recipient address, or network congestion. Please verify your balance and try again.');
      } else if (errorMessage.includes('address') || 
                 errorMessage.includes('recipient') ||
                 errorMessage.includes('Invalid address')) {
        setUserFriendlyError('Invalid recipient address. Please verify the StarkNet address is correct and try again.');
      } else if (errorMessage.includes('network') || 
                 errorMessage.includes('timeout') ||
                 errorMessage.includes('connection')) {
        setUserFriendlyError('Network error. Please check your internet connection and try again.');
      } else if (errorMessage.includes('ENTRYPOINT_FAILED')) {
        setUserFriendlyError('Transaction execution failed. Common causes: insufficient balance, contract error, or invalid parameters. Please check your balance and transaction details.');
      } else {
        setUserFriendlyError('Transfer failed. Please verify you have sufficient USDC balance, the recipient address is correct, and your PIN is correct.');
      }
    }
  };

  const handleReset = () => {
    setForm({ pin: '', recipient: '', amount: '' });
    setWalletData(null);
    setWalletError('');
    setShowSuccess(false);
    setSuccessTxHash('');
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <ArrowUp size={24} className="text-gray-900" />
              <h2 className="text-xl font-bold text-gray-900">Transfer USDC</h2>
            </div>
            <button 
              onClick={handleReset} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              disabled={isTransferring}
            >
              <X size={20} />
            </button>
          </div>

          {/* Loading State */}
          {isLoadingWallet && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading wallet...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
            </div>
          )}

          {/* Wallet Error State */}
          {!isLoadingWallet && walletError && (
            <div className="text-center py-8">
              <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Wallet size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Not Found</h3>
              <p className="text-gray-600 mb-6">{walletError}</p>
              <button
                onClick={() => window.location.href = '/sign-in'}
                className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                Create Wallet
              </button>
            </div>
          )}

          {/* Transfer Form */}
          {!isLoadingWallet && !walletError && walletData && !showSuccess && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Wallet Status */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-800">Wallet Ready</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(walletData.publicKey)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-xs text-green-700 font-mono break-all">
                  {walletData.publicKey}
                </p>
                
                {/* Toast notification */}
                {showCopied && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-fade-in flex items-center space-x-1">
                    <CheckCircle size={14} weight="fill" />
                    <span>Copied!</span>
                  </div>
                )}
              </div>

              {/* PIN Input */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <LockKey size={16} className="mr-1" />
                  Security PIN
                </label>
                <input
                  type="password"
                  value={form.pin}
                  onChange={(e) => setForm({...form, pin: e.target.value})}
                  placeholder="Enter your 4-6 digit PIN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                  minLength={4}
                  maxLength={6}
                  autoFocus
                  disabled={isTransferring}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Use the same PIN you set during wallet creation
                </p>
              </div>

              {/* Recipient Address Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={form.recipient}
                  onChange={(e) => setForm({...form, recipient: e.target.value})}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                  required
                  disabled={isTransferring}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  StarkNet address (0x + 61-64 hex characters)
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({...form, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-lg font-medium"
                    required
                    min="0.01"
                    disabled={isTransferring}
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    USDC
                  </span>
                </div>
              </div>

              {/* Gasless Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <CurrencyDollar size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Gasless Transfer</p>
                    <p>Gas fees are sponsored by Chipi Pay. No network fees required.</p>
                  </div>
                </div>
              </div>

              {/* User-Friendly Error Display */}
              {userFriendlyError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Warning size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-semibold mb-1">Transfer Error</p>
                      <p>{userFriendlyError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Error (for debugging) */}
              {transferError && !userFriendlyError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Warning size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-semibold mb-1">Transfer Error</p>
                      <p>{transferError.toString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  disabled={isTransferring}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={!form.pin || !form.recipient || !form.amount || isTransferring}
                >
                  {isTransferring ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUp size={18} className="mr-2" />
                      Transfer
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Success State */}
          {showSuccess && successTxHash && (
            <div className="text-center py-8">
              <div className="bg-green-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" weight="fill" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Transfer Successful!</h3>
              <p className="text-gray-600 mb-4">Your USDC has been sent</p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6 relative">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                <p className="font-mono text-xs text-gray-900 break-all">
                  {successTxHash}
                </p>
                <button
                  onClick={() => copyToClipboard(successTxHash)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                >
                  <Copy size={14} />
                  <span>Copy Transaction Hash</span>
                </button>
                
                {/* Toast notification */}
                {showCopied && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-fade-in flex items-center space-x-1">
                    <CheckCircle size={14} weight="fill" />
                    <span>Copied!</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500">
                Closing in a moment...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferModal;