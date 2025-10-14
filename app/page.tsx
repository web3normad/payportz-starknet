'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function Home() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn !== undefined) {
      const savedBusinessName = localStorage.getItem('payportz_business_name');
      const savedWalletAddress = localStorage.getItem('payportz_chipiwallet_address');
      
      if (isSignedIn && savedBusinessName && savedWalletAddress) {
        // User is signed in and has completed setup, redirect to dashboard
        window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || '/dashboard';
      } else {
        // User needs to sign in or complete setup
        window.location.href = '/sign-in';
      }
    }
  }, [isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Welcome to PayPortz</p>
        <p className="text-sm text-gray-500 mt-2">
          {isSignedIn === undefined 
            ? 'Checking authentication...' 
            : (isSignedIn ? 'Taking you to dashboard...' : 'Redirecting to sign-in...')
          }
        </p>
      </div>
    </div>
  );
}