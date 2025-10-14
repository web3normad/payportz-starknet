// components/LetterOfCredit/LocApplicationForm.tsx
"use client";
import React from 'react';
import { FileText, User, Building } from "@phosphor-icons/react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import CustomDropdown from './CustomDropdown';
import CostBredownCard from './CostBredownCard';
import { 
  LetterOfCreditData, 
  ApplicationStatus, 
  UserType 
} from './types';
import { 
  EXPORT_TYPES, 
  COUNTRIES, 
  DELIVERY_OPTIONS 
} from './constants';

interface LocApplicationFormProps {
  formData: LetterOfCreditData;
  setFormData: React.Dispatch<React.SetStateAction<LetterOfCreditData>>;
  userType: UserType;
  setUserType: (type: UserType) => void;
  applicationStatus: ApplicationStatus;
  kycVerified: boolean;
  authenticated: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const LocApplicationForm: React.FC<LocApplicationFormProps> = ({
  formData,
  setFormData,
  userType,
  setUserType,
  applicationStatus,
  kycVerified,
  authenticated,
  onSubmit
}) => {
  const { exportType, quantity, valueUSD, buyerCountry, buyerAddress, deliveryTerms } = formData;
  
  const isFormDisabled = applicationStatus === "creating" || 
                        applicationStatus === "funding" || 
                        applicationStatus === "active";

  const isFormComplete = exportType && quantity && valueUSD && 
                        buyerCountry && deliveryTerms && buyerAddress;

  return (
    <Card>
      <div className="flex items-center space-x-2 text-gray-800 mb-6">
        <FileText size={24} className="text-[#444444]" />
        <h2 className="text-lg font-semibold">Revolutionary LoC Application</h2>
        {kycVerified && (
          <div className="ml-auto flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            <span>✅ KYC Verified</span>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* User Type Selection */}
        {!kycVerified && (
          <div>
            <label className="block text-gray-600 mb-2 text-sm font-medium">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUserType('individual')}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  userType === 'individual' 
                    ? 'border-[#444444] bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User size={24} className="mx-auto mb-2 text-[#444444]" />
                <p className="font-medium">Individual</p>
                <p className="text-xs text-gray-500">Personal trading account</p>
              </button>
              <button
                type="button"
                onClick={() => setUserType('business')}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  userType === 'business' 
                    ? 'border-[#444444] bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building size={24} className="mx-auto mb-2 text-[#444444]" />
                <p className="font-medium">Business</p>
                <p className="text-xs text-gray-500">Company trading account</p>
              </button>
            </div>
          </div>
        )}

        {/* Export Type */}
        <div>
          <label className="block text-gray-600 mb-2 text-sm font-medium">
            Export Product
          </label>
          <CustomDropdown
            options={EXPORT_TYPES}
            value={exportType}
            onChange={(value) => setFormData(prev => ({ ...prev, exportType: value }))}
            placeholder="Select Export Product"
            disabled={isFormDisabled}
          />
        </div>

        {/* Quantity and Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 mb-2 text-sm font-medium">
              Quantity (MT)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="0"
              className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent transition-colors"
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2 text-sm font-medium">
              Value (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={valueUSD}
                onChange={(e) => setFormData(prev => ({ ...prev, valueUSD: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-gray-50 text-gray-800 rounded-xl px-8 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent transition-colors"
                disabled={isFormDisabled}
              />
            </div>
          </div>
        </div>

        {/* Buyer Country */}
        <div>
          <label className="block text-gray-600 mb-2 text-sm font-medium">
            Buyer Country
          </label>
          <CustomDropdown
            options={COUNTRIES}
            value={buyerCountry}
            onChange={(value) => setFormData(prev => ({ ...prev, buyerCountry: value }))}
            placeholder="Select Destination Country"
            disabled={isFormDisabled}
          />
        </div>

        {/* Buyer Address */}
        <div>
          <label className="block text-gray-600 mb-2 text-sm font-medium">
            Buyer Wallet Address
          </label>
          <input
            type="text"
            value={buyerAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, buyerAddress: e.target.value }))}
            placeholder="0x742F4d8B1a5e4A4F6B8B5C8F2A6E4E8B6A5B4C8F"
            className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent transition-colors font-mono text-sm"
            disabled={isFormDisabled}
          />
          <p className="text-xs text-gray-500 mt-1">
            Buyer's Base network wallet address for receiving goods confirmation
          </p>
        </div>

        {/* Delivery Terms */}
        <div>
          <label className="block text-gray-600 mb-2 text-sm font-medium">
            Delivery Terms
          </label>
          <CustomDropdown
            options={DELIVERY_OPTIONS}
            value={deliveryTerms}
            onChange={(value) => setFormData(prev => ({ ...prev, deliveryTerms: value }))}
            placeholder="Select Delivery Terms"
            disabled={isFormDisabled}
          />
        </div>

        {/* Cost Breakdown */}
        <CostBredownCard valueUSD={valueUSD} />

        {/* Submit Button */}
        {applicationStatus === "initial" && (
          <Button
            type="submit"
            className="w-full py-4 text-lg bg-[#8b61c2] hover:bg-[#7952a8]"
            disabled={!isFormComplete || !authenticated}
          >
            {kycVerified ? 'Create Revolutionary LoC' : 'Start KYC Verification'}
          </Button>
        )}
      </form>
    </Card>
  );
};

export default LocApplicationForm;