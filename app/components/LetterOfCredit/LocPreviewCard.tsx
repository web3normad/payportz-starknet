"use client";
import React from 'react';
import { Star, CheckCircle, Warning, Copy, Eye } from "@phosphor-icons/react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { 
  LetterOfCreditData, 
  ApplicationStatus, 
  KYCVerificationData, 
  UserType 
} from './types';
import { FEES } from './constants';

interface LocPreviewCardProps {
  formData: LetterOfCreditData;
  applicationStatus: ApplicationStatus;
  kycData: KYCVerificationData | null;
  userType: UserType;
  createdLocId: number | null;
  hash: string;
  usdcBalance: number;
  isWriting: boolean;
  authenticated: boolean;
  kycVerified: boolean;
  onCreateLetterOfCredit: () => void;
  onFundLetterOfCredit: () => void;
  onBackToEdit: () => void;
  onCopyToClipboard: (text: string) => void;
}

const LocPreviewCard: React.FC<LocPreviewCardProps> = ({
  formData,
  applicationStatus,
  kycData,
  userType,
  createdLocId,
  hash,
  usdcBalance,
  isWriting,
  authenticated,
  kycVerified,
  onCreateLetterOfCredit,
  onFundLetterOfCredit,
  onBackToEdit,
  onCopyToClipboard
}) => {
  const { exportType, quantity, valueUSD, buyerCountry, deliveryTerms } = formData;
  
  const calculateFees = () => {
    if (valueUSD) {
      const value = parseFloat(valueUSD);
      const locFee = value * FEES.LOC_FEE_PERCENTAGE;
      const total = locFee + FEES.INSPECTION_FEE + FEES.KYC_FEE + FEES.TRACKING_FEE;
      return { total };
    }
    return { total: 0 };
  };

  const fees = calculateFees();
  const traditionalBankCost = parseFloat(valueUSD || "0") * 0.03;
  const savings = traditionalBankCost - fees.total;
  const tradeValue = parseFloat(valueUSD || "0");

  return (
    <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Star size={20} className="mr-2 text-purple-600" />
        Revolutionary Smart LoC Preview
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-purple-200">
          <span className="text-gray-600">Export Product:</span>
          <span className="font-medium">{exportType}</span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-purple-200">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium">{quantity} MT</span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-purple-200">
          <span className="text-gray-600">Trade Value:</span>
          <span className="font-medium">${tradeValue.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-purple-200">
          <span className="text-gray-600">Destination:</span>
          <span className="font-medium">{buyerCountry}</span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-purple-200">
          <span className="text-gray-600">Delivery Terms:</span>
          <span className="font-medium">{deliveryTerms}</span>
        </div>

        {/* KYC Status */}
        {kycData && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center mb-2">
              <CheckCircle size={16} className="text-green-600 mr-2" />
              <span className="font-medium text-green-900">KYC Verification Complete</span>
            </div>
            <div className="text-sm text-green-800">
              <p>Account Type: {userType === 'business' ? 'Business' : 'Individual'}</p>
              {kycData.nin && <p>✅ NIN Verified</p>}
              {kycData.bvn && <p>✅ BVN Verified</p>}
              {kycData.cacNumber && <p>✅ CAC Verified</p>}
              <p>✅ Phone Number Verified</p>
            </div>
          </div>
        )}

        {/* Smart Contract Details */}
        {createdLocId && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Smart LoC ID:</span>
              <span className="font-mono font-medium">{createdLocId}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Escrow Amount:</span>
              <span className="font-medium">${tradeValue.toLocaleString()} USDC</span>
            </div>
            {hash && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transaction Hash:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">{hash.slice(0, 10)}...</span>
                  <button onClick={() => onCopyToClipboard(hash)}>
                    <Copy size={14} />
                  </button>
                  <button onClick={() => window.open(`https://basescan.org/tx/${hash}`, '_blank')}>
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 border border-purple-300">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Revolutionary Total Cost:</span>
            <span className="text-2xl font-bold text-purple-600">${fees.total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-purple-700 mt-1">
            🎉 You save ${savings.toFixed(2)} vs traditional banks!
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {applicationStatus === "preview" && (
          <Button
            onClick={onCreateLetterOfCredit}
            className="w-full py-4 text-lg bg-[#8b61c2] hover:bg-[#7952a8]"
            disabled={!authenticated || isWriting || !kycVerified}
          >
            {isWriting ? 'Creating Revolutionary Contract...' : 'Create Smart Contract LoC'}
          </Button>
        )}

        {applicationStatus === "funding" && (
          <Button
            onClick={onFundLetterOfCredit}
            className="w-full py-4 text-lg bg-green-600 hover:bg-green-700"
            disabled={usdcBalance < tradeValue || isWriting}
          >
            {isWriting ? 'Funding Escrow...' : `Fund Escrow (${tradeValue.toLocaleString()} USDC)`}
          </Button>
        )}
        
        {applicationStatus === "preview" && (
          <Button
            onClick={onBackToEdit}
            variant="outline"
            className="w-full py-3 border-purple-500 text-purple-600 hover:bg-purple-50"
          >
            Back to Edit
          </Button>
        )}

        {/* Insufficient Balance Warning */}
        {applicationStatus === "funding" && usdcBalance < tradeValue && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Warning size={16} className="text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Insufficient USDC Balance</p>
                <p>You need ${tradeValue.toLocaleString()} USDC but only have ${usdcBalance.toFixed(2)} USDC.</p>
                <p>Please convert more NGN to USDC first.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LocPreviewCard;