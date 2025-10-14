"use client";
import React, { useState } from "react";
import { useAuth, useUser } from '@clerk/nextjs';
import Layout from "../components/core/Layout";
import { 
  CheckCircle,
  Clock,
  CurrencyDollar,
  Wallet,
  Truck,
  Eye,
  User
} from "@phosphor-icons/react";

// Import refactored components
import {
  LocApplicationForm,
  LocPreviewCard,
  KYCVerificationModal,
  DHLTrackingModal,
  FeaturesBanner,
  ToastNotification,
  useLetterOfCreditForm,
  useToastNotification
} from "../components/LetterOfCredit";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function RevolutionaryLetterOfCredit() {
  // Authentication with Clerk
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  // Get wallet address from localStorage (ChipiPay wallet)
  const getWalletAddress = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('payportz_chipiwallet_address');
    }
    return null;
  };
  
  const address = getWalletAddress();
  const authenticated = isSignedIn && isLoaded;
  
  // Mock wallet data - replace with actual wallet hook when available
  const usdcBalance = 5000; // Mock balance
  const refreshBalances = () => {
    console.log('Refreshing balances...');
  };
  
  // Mock smart contract functions
  const createAgriculturalLoC = async (data: any): Promise<void> => {
    console.log('Creating LoC:', data);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };
  
  const fundLetterOfCredit = async (locId: number): Promise<void> => {
    console.log('Funding LoC:', locId);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };
  
  const isWriting = false;
  const isConfirming = false;
  const isSuccess = false;
  const hash = '';
  
  // Mock exporter data
  const locIds: number[] = [];
  
  // Mock SGS Inspection
  const requestInspection = async (): Promise<void> => {
    console.log('Requesting inspection...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  };
  const isRequestingInspection = false;

  // Use custom hooks
  const {
    formData,
    setFormData,
    applicationStatus,
    setApplicationStatus,
    userType,
    setUserType,
    kycVerified,
    setKycVerified,
    kycData,
    setKycData,
    createdLocId,
    setCreatedLocId
  } = useLetterOfCreditForm();

  const { toast, showToast, hideToast } = useToastNotification();

  // Modal states
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedTrackingNumber, setSelectedTrackingNumber] = useState<string>();

  // Handlers
  const handleConnectWallet = () => {
    if (!authenticated) {
      window.location.href = '/sign-in';
    }
  };

  const handleKycComplete = (data: any) => {
    setKycData(data);
    setKycVerified(true);
    setApplicationStatus('preview');
    showToast('KYC verification completed successfully!', 'success');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!authenticated) {
      showToast('Please sign in to continue', 'error');
      return;
    }
    
    const { exportType, quantity, valueUSD, buyerCountry, deliveryTerms, buyerAddress } = formData;
    
    if (exportType && quantity && valueUSD && buyerCountry && deliveryTerms && buyerAddress) {
      if (!kycVerified) {
        setApplicationStatus('kyc');
        setKycModalOpen(true);
      } else {
        setApplicationStatus("preview");
      }
    }
  };

  const handleCreateLetterOfCredit = async () => {
    if (!formData.valueUSD || !authenticated || !kycVerified) {
      showToast('Please complete KYC verification first', 'error');
      return;
    }

    setApplicationStatus("creating");
    
    try {
      await createAgriculturalLoC({
        exportType: formData.exportType,
        quantity: parseFloat(formData.quantity),
        valueUSD: parseFloat(formData.valueUSD),
        buyerCountry: formData.buyerCountry,
        buyerAddress: formData.buyerAddress,
        deliveryTerms: formData.deliveryTerms
      });

      const mockLocId = Math.floor(Math.random() * 1000) + 1;
      setCreatedLocId(mockLocId);
      setApplicationStatus("funding");
      showToast('Revolutionary Smart LoC created! Ready for funding.', 'success');
    } catch (error) {
      showToast('Failed to create Letter of Credit', 'error');
      setApplicationStatus("preview");
    }
  };

  const handleFundLetterOfCredit = async () => {
    if (!createdLocId || !formData.valueUSD) return;

    try {
      await fundLetterOfCredit(createdLocId);
      setApplicationStatus("active");
      refreshBalances();
      showToast('Smart LoC funded! Escrow active with integrated tracking.', 'success');
    } catch (error) {
      showToast('Failed to fund Letter of Credit', 'error');
    }
  };

  const handleRequestInspection = async () => {
    if (!createdLocId) return;

    try {
      await requestInspection();
      showToast('SGS inspection completed successfully!', 'success');
    } catch (error) {
      showToast('SGS inspection failed', 'error');
    }
  };

  const handleNewApplication = () => {
    setApplicationStatus("initial");
    setFormData({
      exportType: "",
      quantity: "",
      valueUSD: "",
      buyerCountry: "",
      buyerAddress: "",
      deliveryTerms: ""
    });
    setCreatedLocId(null);
    setKycVerified(false);
    setKycData(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  // Show loading if Clerk is not ready
  if (!isLoaded) {
    return (
      <Layout>
        <div className="p-6 w-full">
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#444444]"></div>
              <span className="ml-3 text-gray-600">Loading revolutionary LoC platform...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 w-full">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Revolutionary Smart Letter of Credit</h1>
              <p className="text-gray-600 mt-1">
                🚀 Blockchain + KYC + Real-time Tracking - Better than traditional banks
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Our Advantage</p>
              <p className="text-2xl font-bold text-green-600">95% Cheaper</p>
              <p className="text-sm text-green-600 font-medium">vs Traditional Banks</p>
            </div>
          </div>

          {/* Features Banner */}
          <FeaturesBanner />

          {/* Authentication Status */}
          {!authenticated ? (
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet size={24} className="text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Authentication Required</p>
                    <p className="text-sm text-yellow-700">Sign in to access revolutionary LoC features</p>
                  </div>
                </div>
                <Button onClick={handleConnectWallet} className="bg-yellow-600 hover:bg-yellow-700">
                  Sign In
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle size={24} className="text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">
                      {kycVerified ? 'Fully Verified & Ready' : 'Authenticated - KYC Pending'}
                    </p>
                    <div className="text-sm text-green-700">
                      <p>User: {user?.emailAddresses[0]?.emailAddress || 'Authenticated User'}</p>
                      {address && <p>Wallet: {address.slice(0, 10)}...{address.slice(-8)}</p>}
                      <p>USDC Balance: ${usdcBalance.toFixed(2)}</p>
                      {kycVerified && kycData && (
                        <p>✅ KYC Verified ({userType === 'business' ? 'Business' : 'Individual'})</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">Active LoCs</p>
                  <p className="text-xl font-bold text-green-900">{locIds.length}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Application Status */}
          <div className="flex justify-center">
            {applicationStatus === "kyc" ? (
              <div className="bg-purple-100 text-purple-800 px-6 py-2 rounded-full text-sm flex items-center gap-2">
                <User size={20} />
                Complete KYC Verification
              </div>
            ) : applicationStatus === "creating" ? (
              <div className="bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full text-sm flex items-center gap-2">
                <Clock size={20} />
                {isWriting ? 'Creating Smart Contract...' : isConfirming ? 'Confirming Transaction...' : 'Processing...'}
              </div>
            ) : applicationStatus === "funding" ? (
              <div className="bg-blue-100 text-blue-800 px-6 py-2 rounded-full text-sm flex items-center gap-2">
                <CurrencyDollar size={20} />
                Fund Revolutionary Escrow
              </div>
            ) : applicationStatus === "active" ? (
              <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full text-sm flex items-center gap-2">
                <CheckCircle size={20} />
                Revolutionary LoC Active 🚀
              </div>
            ) : (
              <div className="bg-blue-100 text-blue-800 px-6 py-2 rounded-full text-sm">
                Create your revolutionary LoC in <span className="font-semibold">under 3 minutes</span>
              </div>
            )}
          </div>

          <div className={`grid ${applicationStatus === "preview" || applicationStatus === "funding" || applicationStatus === "active" ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-8`}>
            
            {/* Application Form Section */}
            <div className="space-y-6">
              <LocApplicationForm
                formData={formData}
                setFormData={setFormData}
                userType={userType}
                setUserType={setUserType}
                applicationStatus={applicationStatus}
                kycVerified={kycVerified}
                authenticated={authenticated}
                onSubmit={handleSubmit}
              />

              {/* Active LoC Controls */}
              {applicationStatus === "active" && (
                <Card>
                  <div className="space-y-3">
                    <Button
                      onClick={handleRequestInspection}
                      className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700"
                      disabled={isRequestingInspection}
                    >
                      {isRequestingInspection ? 'Requesting SGS Inspection...' : 'Request SGS Quality Inspection'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setSelectedTrackingNumber('DHL' + Date.now());
                        setTrackingModalOpen(true);
                      }}
                      variant="outline"
                      className="w-full py-4 text-lg border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Truck size={20} className="mr-2" />
                      Track via DHL API
                    </Button>
                    
                    <Button
                      onClick={handleNewApplication}
                      variant="outline"
                      className="w-full py-4 text-lg border-[#444444] text-[#444444] hover:bg-gray-50"
                    >
                      Create New Revolutionary LoC
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Preview Card */}
            {(applicationStatus === "preview" || applicationStatus === "funding" || applicationStatus === "active") && (
              <div className="space-y-4">
                <LocPreviewCard
                  formData={formData}
                  applicationStatus={applicationStatus}
                  kycData={kycData}
                  userType={userType}
                  createdLocId={createdLocId}
                  hash={hash}
                  usdcBalance={usdcBalance}
                  isWriting={isWriting}
                  authenticated={authenticated}
                  kycVerified={kycVerified}
                  onCreateLetterOfCredit={handleCreateLetterOfCredit}
                  onFundLetterOfCredit={handleFundLetterOfCredit}
                  onBackToEdit={() => setApplicationStatus("initial")}
                  onCopyToClipboard={copyToClipboard}
                />

                {/* Additional Info Cards */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-start space-x-3">
                    <CheckCircle size={24} className="text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Revolutionary Security Features</h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <p>🔐 <strong>Multi-layer KYC:</strong> NIN + BVN + CAC verification</p>
                        <p>📦 <strong>Real-time Tracking:</strong> DHL API integration</p>
                        <p>🏆 <strong>SGS Quality Assurance:</strong> Professional inspection</p>
                        <p>⚡ <strong>Smart Contract Automation:</strong> Objective payment triggers</p>
                        <p>🌍 <strong>Blockchain Transparency:</strong> All actions recorded on Starknet</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Active LoC Status */}
            {applicationStatus === "active" && (
              <div className="col-span-full max-w-2xl mx-auto">
                <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="py-8">
                    <div className="text-6xl mb-4">⚡</div>
                    <h3 className="text-xl font-semibold text-green-900 mb-2">Revolutionary LoC is LIVE!</h3>
                    <p className="text-green-700 mb-4">
                      Your blockchain-powered, KYC-verified, real-time tracked LoC is now active
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Smart Contract ID:</span>
                        <span className="font-mono text-sm">{createdLocId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Escrow Status:</span>
                        <span className="text-sm font-medium text-green-600">Funded & Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">KYC Status:</span>
                        <span className="text-sm font-medium text-green-600">✅ Verified</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tracking:</span>
                        <span className="text-sm font-medium text-blue-600">DHL API Ready</span>
                      </div>
                    </div>
                    <div className="flex space-x-3 justify-center">
                      <Button 
                        onClick={() => window.open('https://starkscan.co', '_blank')}
                        variant="outline"
                        className="text-green-700 border-green-300"
                      >
                        <Eye size={16} className="mr-2" />
                        View on StarkScan
                      </Button>
                      <Button 
                        onClick={() => {
                          setSelectedTrackingNumber('DHL' + Date.now());
                          setTrackingModalOpen(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Truck size={16} className="mr-2" />
                        Track Shipment
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Revolutionary Advantages */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              Why Our Revolutionary LoC Beats Traditional Banks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="space-y-2">
                <p>💰 <strong>95% Cost Reduction:</strong> 0.5% vs banks' 2-5% fees</p>
                <p>⚡ <strong>Instant Processing:</strong> 3 minutes vs banks' 6-8 weeks</p>
                <p>🔍 <strong>Real KYC Integration:</strong> NIN, BVN, CAC verification</p>
              </div>
              <div className="space-y-2">
                <p>📦 <strong>Live Tracking:</strong> DHL API for real-time updates</p>
                <p>🏆 <strong>Professional QC:</strong> SGS inspection integration</p>
                <p>🌍 <strong>Global Access:</strong> No banking relationships needed</p>
              </div>
              <div className="space-y-2">
                <p>🤖 <strong>Smart Automation:</strong> Objective payment triggers</p>
                <p>🔒 <strong>Blockchain Security:</strong> Immutable transaction records</p>
                <p>📱 <strong>Mobile First:</strong> Complete process on your phone</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <KYCVerificationModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        onComplete={handleKycComplete}
        userType={userType}
      />

      <DHLTrackingModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        trackingNumber={selectedTrackingNumber}
      />

      {/* Toast Notification */}
      <ToastNotification
        toast={toast}
        onClose={hideToast}
      />
    </Layout>
  );
}