"use client";
import React, { useState } from 'react';
import { 
  Fingerprint, 
  Bank, 
  Phone, 
  CheckCircle, 
  X 
} from "@phosphor-icons/react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { KYCVerificationData, UserType } from './types';

interface KYCVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: KYCVerificationData) => void;
  userType: UserType;
}

interface NINVerificationResult {
  verified: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  stateOfOrigin: string;
  phoneNumber: string;
}

interface BVNVerificationResult {
  verified: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  watchListed: boolean;
}

interface CACVerificationResult {
  verified: boolean;
  companyName: string;
  rcNumber: string;
  registrationDate: string;
  companyType: string;
  status: string;
  address: string;
  directors: string[];
  shareCapital: string;
}

interface VerificationResults {
  nin?: NINVerificationResult;
  bvn?: BVNVerificationResult;
  cac?: CACVerificationResult;
}

const KYCVerificationModal: React.FC<KYCVerificationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  userType
}) => {
  const [step, setStep] = useState(1);
  const [verificationData, setVerificationData] = useState<KYCVerificationData>({
    businessType: userType
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<VerificationResults>({});

  // Mock verification functions - replace with real API calls
  const verifyNIN = async (nin: string): Promise<NINVerificationResult> => {
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResult: NINVerificationResult = {
      verified: true,
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1985-03-15",
      gender: "Male",
      stateOfOrigin: "Lagos State",
      phoneNumber: "+2348012345678"
    };
    
    setVerificationResults((prev: VerificationResults) => ({ ...prev, nin: mockResult }));
    setIsVerifying(false);
    return mockResult;
  };

  const verifyBVN = async (bvn: string): Promise<BVNVerificationResult> => {
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResult: BVNVerificationResult = {
      verified: true,
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "15-Mar-1985",
      phoneNumber: "08012345678",
      email: "john.doe@email.com",
      watchListed: false
    };
    
    setVerificationResults((prev: VerificationResults) => ({ ...prev, bvn: mockResult }));
    setIsVerifying(false);
    return mockResult;
  };

  const verifyCAC = async (cacNumber: string): Promise<CACVerificationResult> => {
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResult: CACVerificationResult = {
      verified: true,
      companyName: "PaySlab Technologies Limited",
      rcNumber: cacNumber,
      registrationDate: "2020-05-15",
      companyType: "PRIVATE COMPANY LIMITED BY SHARES",
      status: "ACTIVE",
      address: "Victoria Island, Lagos",
      directors: ["John Doe", "Jane Smith"],
      shareCapital: "10,000,000"
    };
    
    setVerificationResults((prev: VerificationResults) => ({ ...prev, cac: mockResult }));
    setIsVerifying(false);
    return mockResult;
  };

  const handleNext = async () => {
    if (step === 1 && userType === 'individual') {
      if (verificationData.nin) {
        await verifyNIN(verificationData.nin);
      }
      setStep(2);
    } else if (step === 1 && userType === 'business') {
      if (verificationData.cacNumber) {
        await verifyCAC(verificationData.cacNumber);
      }
      setStep(2);
    } else if (step === 2) {
      if (verificationData.bvn) {
        await verifyBVN(verificationData.bvn);
      }
      setStep(3);
    } else if (step === 3) {
      onComplete(verificationData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
            <p className="text-gray-600 mt-1">
              {userType === 'business' ? 'Business Identity Verification' : 'Individual Identity Verification'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum ? 'bg-[#444444] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > stepNum ? <CheckCircle size={16} /> : stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`flex-1 h-1 mx-4 ${step > stepNum ? 'bg-[#444444]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Primary Identity */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Fingerprint size={20} className="mr-2 text-[#444444]" />
                Primary Identity Verification
              </h3>
              
              {userType === 'individual' ? (
                <div>
                  <label className="block text-gray-600 mb-2 text-sm font-medium">
                    National Identification Number (NIN)
                  </label>
                  <input
                    type="text"
                    value={verificationData.nin || ''}
                    onChange={(e) => setVerificationData({...verificationData, nin: e.target.value})}
                    placeholder="12345678901"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444]"
                    maxLength={11}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    11-digit NIN for identity verification via NIMC database
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-600 mb-2 text-sm font-medium">
                    CAC Registration Number
                  </label>
                  <input
                    type="text"
                    value={verificationData.cacNumber || ''}
                    onChange={(e) => setVerificationData({...verificationData, cacNumber: e.target.value})}
                    placeholder="RC1234567 or BN3456789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Corporate Affairs Commission registration number
                  </p>
                </div>
              )}

              {verificationResults.nin && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center mb-2">
                    <CheckCircle size={16} className="text-green-600 mr-2" />
                    <span className="font-medium text-green-900">NIN Verified Successfully</span>
                  </div>
                  <div className="text-sm text-green-800">
                    <p>Name: {verificationResults.nin.firstName} {verificationResults.nin.lastName}</p>
                    <p>State of Origin: {verificationResults.nin.stateOfOrigin}</p>
                  </div>
                </div>
              )}

              {verificationResults.cac && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center mb-2">
                    <CheckCircle size={16} className="text-green-600 mr-2" />
                    <span className="font-medium text-green-900">CAC Verified Successfully</span>
                  </div>
                  <div className="text-sm text-green-800">
                    <p>Company: {verificationResults.cac.companyName}</p>
                    <p>Status: {verificationResults.cac.status}</p>
                    <p>Registration Date: {verificationResults.cac.registrationDate}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Banking Verification */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Bank size={20} className="mr-2 text-[#444444]" />
                Banking Verification
              </h3>
              
              <div>
                <label className="block text-gray-600 mb-2 text-sm font-medium">
                  Bank Verification Number (BVN)
                </label>
                <input
                  type="text"
                  value={verificationData.bvn || ''}
                  onChange={(e) => setVerificationData({...verificationData, bvn: e.target.value})}
                  placeholder="12345678901"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444]"
                  maxLength={11}
                />
                <p className="text-xs text-gray-500 mt-1">
                  11-digit BVN for banking identity verification
                </p>
              </div>

              {verificationResults.bvn && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center mb-2">
                    <CheckCircle size={16} className="text-green-600 mr-2" />
                    <span className="font-medium text-green-900">BVN Verified Successfully</span>
                  </div>
                  <div className="text-sm text-green-800">
                    <p>Name: {verificationResults.bvn.firstName} {verificationResults.bvn.lastName}</p>
                    <p>Phone: {verificationResults.bvn.phoneNumber}</p>
                    <p>Watchlist Status: {verificationResults.bvn.watchListed ? 'Listed' : 'Clear'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Phone Verification */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Phone size={20} className="mr-2 text-[#444444]" />
                Phone Number Verification
              </h3>
              
              <div>
                <label className="block text-gray-600 mb-2 text-sm font-medium">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={verificationData.phoneNumber || ''}
                  onChange={(e) => setVerificationData({...verificationData, phoneNumber: e.target.value})}
                  placeholder="+2348012345678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Phone number linked to your bank account and NIN
                </p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">Verification Summary</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  {userType === 'individual' && verificationResults.nin && (
                    <div className="flex items-center">
                      <CheckCircle size={16} className="text-green-600 mr-2" />
                      <span>NIN Verified: {verificationResults.nin.firstName} {verificationResults.nin.lastName}</span>
                    </div>
                  )}
                  {userType === 'business' && verificationResults.cac && (
                    <div className="flex items-center">
                      <CheckCircle size={16} className="text-green-600 mr-2" />
                      <span>CAC Verified: {verificationResults.cac.companyName}</span>
                    </div>
                  )}
                  {verificationResults.bvn && (
                    <div className="flex items-center">
                      <CheckCircle size={16} className="text-green-600 mr-2" />
                      <span>BVN Verified: Banking identity confirmed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isVerifying && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#444444]"></div>
              <span className="ml-3 text-gray-600">Verifying identity...</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              disabled={isVerifying}
            >
              {step > 1 ? 'Previous' : 'Cancel'}
            </Button>
            <Button
              onClick={handleNext}
              disabled={isVerifying || 
                (step === 1 && !verificationData[userType === 'individual' ? 'nin' : 'cacNumber']) || 
                (step === 2 && !verificationData.bvn)}
            >
              {isVerifying ? 'Verifying...' : step === 3 ? 'Complete Verification' : 'Next'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KYCVerificationModal;