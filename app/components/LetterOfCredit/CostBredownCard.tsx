// components/LetterOfCredit/CostBredownCard.tsx
"use client";
import React from 'react';
import { Calculator } from "@phosphor-icons/react";
import { CostBreakdown } from './types';
import { FEES } from './constants';

interface CostBredownCardProps {
  valueUSD: string;
}

const CostBredownCard: React.FC<CostBredownCardProps> = ({ valueUSD }) => {
  const calculateFees = (): CostBreakdown => {
    if (valueUSD) {
      const value = parseFloat(valueUSD);
      const locFee = value * FEES.LOC_FEE_PERCENTAGE;
      const inspectionFee = FEES.INSPECTION_FEE;
      const kycFee = FEES.KYC_FEE;
      const trackingFee = FEES.TRACKING_FEE;
      return { 
        locFee, 
        inspectionFee, 
        kycFee, 
        trackingFee, 
        total: locFee + inspectionFee + kycFee + trackingFee 
      };
    }
    return { locFee: 0, inspectionFee: 0, kycFee: 0, trackingFee: 0, total: 0 };
  };

  const fees = calculateFees();
  const traditionalBankCost = parseFloat(valueUSD || "0") * 0.03; // 3% average bank fee
  const savings = traditionalBankCost - fees.total;

  if (!valueUSD) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 space-y-3 border border-green-200">
      <h4 className="font-semibold text-gray-900 flex items-center">
        <Calculator size={16} className="mr-2" />
        Revolutionary Pricing (95% cheaper than banks!)
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Trade Value:</span>
            <span className="font-medium">${parseFloat(valueUSD).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Smart LoC Fee (0.5%):</span>
            <span className="font-medium text-green-600">${fees.locFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SGS Inspection:</span>
            <span className="font-medium">${fees.inspectionFee}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">KYC Verification:</span>
            <span className="font-medium">${fees.kycFee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">DHL Tracking API:</span>
            <span className="font-medium">${fees.trackingFee}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-900 font-medium">Total Cost:</span>
            <span className="font-bold text-[#444444] text-lg">${fees.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="bg-white bg-opacity-70 rounded-lg p-3 mt-3">
        <p className="text-xs text-gray-700">
          💡 <strong>Traditional Bank LoC would cost:</strong> ${traditionalBankCost.toFixed(2)}
          <span className="text-green-600 font-semibold ml-2">
            You save: ${savings.toFixed(2)}!
          </span>
        </p>
      </div>
    </div>
  );
};

export default CostBredownCard;