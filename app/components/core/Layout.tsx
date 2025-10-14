'use client';

import React, { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
// import ProtectedRoute from './ProtectedRoute';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Extract current tab from pathname
  const getCurrentTab = () => {
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/add-funds')) return 'add-funds';
    if (pathname.startsWith('/send')) return 'send';
    if (pathname.startsWith('/withdraw')) return 'withdraw';
    if (pathname.startsWith('/transactions')) return 'transactions';
    // if (pathname.startsWith('/convert')) return 'convert';
    // if (pathname.startsWith('/trades')) return 'trades';
    // if (pathname.startsWith('/compliance')) return 'compliance';
    // if (pathname.startsWith('/credit-score')) return 'credit-score';
    if (pathname.startsWith('/wallet')) return 'wallet';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'dashboard'; // default tab
  };

  const setActiveTab = (tab: string) => {
    router.push(`/${tab}`);
  };

  return (
  
      <div className="min-h-screen bg-gray-50">
        <Sidebar activeTab={getCurrentTab()} setActiveTab={setActiveTab} />
        <Navbar />
        
        <main className="ml-64 pt-16 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

  );
};

export default Layout;