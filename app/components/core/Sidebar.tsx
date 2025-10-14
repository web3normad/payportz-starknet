'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Logo from '@/public/Payslab-logo.svg'; 
import {
  House,
  Plus,
  ArrowUp,
  ArrowDown,
  FileText,
  Wallet,
  Gear
} from '@phosphor-icons/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    // Set initial date/time
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );

    setCurrentTime(
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );

    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }, 60000);

    // Mock total balance (in production, fetch from wallet)
    setWalletBalance(12900); // $12,900 total across all currencies

    return () => {
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: House, isNew: false },
    { id: 'add-funds', label: 'Add Funds', icon: Plus, isNew: true },
    { id: 'send', label: 'Send Payment', icon: ArrowUp, isNew: false },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowDown, isNew: true },
    { id: 'transactions', label: 'Transactions', icon: FileText, isNew: false },
    { id: 'wallet', label: 'Wallet', icon: Wallet, isNew: false },
    { id: 'settings', label: 'Settings', icon: Gear, isNew: false }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      <div className="mb-8">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image src={Logo} alt="PaySlab Logo" layout="fill" objectFit="contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#373941]" style={{ fontFamily: 'ClashDisplay-Bold, sans-serif' }}>
            PayPortz
          </h1>
        </div>
        {/* Date and Time */}
        <div className="text-sm text-gray-400 mt-1">
          {currentDate} | {currentTime}
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-[#444444] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon size={20} />
                <span className="font-medium" style={{ fontFamily: 'ClashDisplay-Bold, sans-serif' }}>
                  {item.label}
                </span>
              </div>
              {item.isNew && (
                <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Balance Card at Bottom */}
      <div className="mt-auto">
        <div className="bg-[linear-gradient(135deg,rgb(131,131,131)_-35%,rgba(41,41,41,0.34)_-20%,rgba(51,51,51,0.55)_-15%,rgb(47,47,47)_100%)] text-white border-0 p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-sm font-medium opacity-90">Total Balance</p>
              <p className="text-lg font-bold" style={{ fontFamily: 'ClashDisplay-Bold, sans-serif' }}>
                ${walletBalance.toLocaleString()}
              </p>
              <p className="text-xs opacity-75">Across all currencies</p>
            </div>
          </div>
        </div>

        {/* Quick Tip */}
        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-900 font-medium mb-1">💡 Quick Tip</p>
          <p className="text-xs text-blue-700">
            Add funds now to lock in today's rates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;