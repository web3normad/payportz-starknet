// components/LetterOfCredit/hooks/useLetterOfCreditForm.ts
import { useState } from 'react';
import { 
  LetterOfCreditData, 
  ApplicationStatus, 
  UserType, 
  KYCVerificationData 
} from '../components/LetterOfCredit/types';

export const useLetterOfCreditForm = () => {
  const [formData, setFormData] = useState<LetterOfCreditData>({
    exportType: "",
    quantity: "",
    valueUSD: "",
    buyerCountry: "",
    buyerAddress: "",
    deliveryTerms: ""
  });

  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('initial');
  const [userType, setUserType] = useState<UserType>('individual');
  const [kycVerified, setKycVerified] = useState(false);
  const [kycData, setKycData] = useState<KYCVerificationData | null>(null);
  const [createdLocId, setCreatedLocId] = useState<number | null>(null);

  const resetForm = () => {
    setFormData({
      exportType: "",
      quantity: "",
      valueUSD: "",
      buyerCountry: "",
      buyerAddress: "",
      deliveryTerms: ""
    });
    setApplicationStatus('initial');
    setCreatedLocId(null);
    setKycVerified(false);
    setKycData(null);
  };

  return {
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
    setCreatedLocId,
    resetForm
  };
};
