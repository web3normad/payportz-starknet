"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Layout from "../components/core/Layout";
import {
  Plus,
  ArrowRight,
  CheckCircle,
  Warning,
  Info,
  Bank,
  CurrencyDollar,
  ArrowsLeftRight,
  Wallet,
  Copy,
} from "@phosphor-icons/react";
import { breadApi, type Asset } from "@/app/lib/breadApi";
import { useYellowCardRate } from "@/app/hooks/useYellowCard";
import usdtLogo from "@/public/usdt-logo.svg";
import usdcLogo from "@/public/usdc-logo.svg";
import cngnLogo from "@/public/cngn-logo.png";
import solLogo from "@/public/solana-logo.svg";
import strkLogo from "@/public/strk-logo.svg";
import ethLogo from "@/public/ethereum-logo.svg";

const AddFunds = () => {
  const [method, setMethod] = useState<"fiat" | "crypto">("fiat");
  const [step, setStep] = useState(1);
  const [ngnAmount, setNgnAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<Asset>("base:usdc");
  const [banks, setBanks] = useState<
    Array<{ name: string; code: string; icon: string }>
  >([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [evmAddress, setEvmAddress] = useState("");
  const [svmAddress, setSvmAddress] = useState("");
  const [starknetAddress, setStarknetAddress] = useState("");
  const [walletView, setWalletView] = useState<"starknet" | "evm">("evm");
  const [toast, setToast] = useState<any>(null);
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  const cryptoOptions = [
    {
      symbol: "base:usdc",
      name: "USDC",
      chain: "Base",
      logo: usdcLogo,
      color: "from-blue-500 to-blue-600",
    },
    {
      symbol: "polygon:usdc",
      name: "USDC",
      chain: "Polygon",
      logo: usdcLogo,
      color: "from-purple-500 to-purple-600",
    },
    {
      symbol: "bsc:usdt",
      name: "USDT",
      chain: "BSC",
      logo: usdtLogo,
      color: "from-teal-500 to-teal-600",
    },
    {
      symbol: "base:cngn",
      name: "cNGN",
      chain: "Base",
      logo: cngnLogo,
      color: "from-green-500 to-green-600",
    },
  ];

  useEffect(() => {
    const breadWalletId = localStorage.getItem("payportz_bread_wallet_id");
    const breadWalletEvm = localStorage.getItem("payportz_bread_wallet_evm");
    const breadWalletSvm = localStorage.getItem("payportz_bread_wallet_svm");

    if (breadWalletId) setWalletId(breadWalletId);
    if (breadWalletEvm) {
      setWalletAddress(breadWalletEvm);
      setEvmAddress(breadWalletEvm);
    }
    if (breadWalletSvm) {
      setSvmAddress(breadWalletSvm);
    }

    // If we have a wallet id but missing addresses, try to fetch from Bread API
    if (breadWalletId && (!breadWalletEvm || !breadWalletSvm)) {
      (async () => {
        try {
          const w = await breadApi.getWallet(breadWalletId);
          if (w?.address?.evm) {
            setEvmAddress(w.address.evm);
            setWalletAddress(w.address.evm);
            localStorage.setItem("payportz_bread_wallet_evm", w.address.evm);
          }
          if (w?.address?.svm) {
            setSvmAddress(w.address.svm);
            localStorage.setItem("payportz_bread_wallet_svm", w.address.svm);
          }
        } catch (err) {
          console.warn("Failed to fetch bread wallet info", err);
        }
      })();
    }

    setStarknetAddress("0x0742d13c6cABF9F5ecC9E9B0B1c4F4d2E8b5A3c1B2D3E4F5");

    const urlParams = new URLSearchParams(window.location.search);
    const methodParam = urlParams.get("method");
    if (methodParam === "crypto") {
      setMethod("crypto");
    }

    fetchBanks();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".bank-dropdown")) {
        setIsBankDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchBanks = async () => {
    try {
      const banksData = await breadApi.getBanks("NGN");
      setBanks(banksData);
    } catch (error) {
      console.error("Failed to fetch banks:", error);
    }
  };

  const verifyAccount = async () => {
    if (!selectedBank || !accountNumber || accountNumber.length !== 10) {
      showToast("Please enter a valid 10-digit account number", "error");
      return;
    }

    setIsVerifying(true);
    try {
      const details = await breadApi.lookupAccount(selectedBank, accountNumber);
      setAccountDetails(details);
      showToast("Account verified successfully!");
      setStep(3);
    } catch (error: any) {
      showToast(error.message || "Failed to verify account", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSwap = async () => {
    if (!walletId || !walletAddress) {
      showToast("Wallet not found", "error");
      return;
    }

    setIsSwapping(true);
    try {
      const result = await breadApi.swap(
        walletId,
        walletAddress,
        "base:cngn",
        selectedCurrency as Asset,
        -1,
        undefined
      );

      console.log("Swap successful:", result);
      showToast("Funds added successfully!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error: any) {
      showToast(error.message || "Swap failed", "error");
    } finally {
      setIsSwapping(false);
    }
  };

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  const ngnValue = parseFloat(ngnAmount) || 0;
  const selectedOption = cryptoOptions.find(
    (o) => o.symbol === selectedCurrency
  );

  // Use YellowCard hook to fetch an estimated conversion rate for display
  const ngnForRate = parseFloat(ngnAmount) || 1000;
  const { data: rateData, isLoading: rateLoading } = useYellowCardRate(
    ngnForRate,
    "NGN",
    (selectedCurrency.split(":")[1] || "USDC").toUpperCase()
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Money</h1>
            <p className="text-gray-600 mt-1">
              Deposit Naira or send crypto to your wallet
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: "Amount" },
                { num: 2, label: "Bank Details" },
                { num: 3, label: "Deposit" },
                { num: 4, label: "Complete" },
              ].map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step >= s.num
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step > s.num ? "✓" : s.num}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">
                      {s.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > s.num ? "bg-black" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {step === 1 && (
            <>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Choose funding method
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMethod("fiat")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      method === "fiat"
                        ? "border-black bg-gray-50 ring-2 ring-gray-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Bank size={40} className="mx-auto mb-3 text-gray-700" />
                    <p className="font-semibold text-gray-900 text-lg">
                      Bank Transfer
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Deposit Naira from your bank account
                    </p>
                  </button>

                  <button
                    onClick={() => setMethod("crypto")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      method === "crypto"
                        ? "border-black bg-gray-50 ring-2 ring-gray-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CurrencyDollar
                      size={40}
                      className="mx-auto mb-3 text-gray-700"
                    />
                    <p className="font-semibold text-gray-900 text-lg">
                      Crypto Deposit
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Send crypto from external wallet
                    </p>
                  </button>
                </div>
              </div>

              {method === "crypto" && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                  <div className="text-center pb-4 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet size={32} className="text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Deposit Crypto Directly
                    </h2>
                    <p className="text-sm text-gray-600">
                      Send crypto from any wallet or exchange to your PayPortz
                      addresses
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg text-gray-900">
                        Your Wallet Addresses
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setWalletView("evm")}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            walletView === "evm"
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          EVM Wallets
                        </button>
                        <button
                          onClick={() => setWalletView("starknet")}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            walletView === "starknet"
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          Starknet
                        </button>
                      </div>
                    </div>

                    {/* Live rate preview */}
                    <div className="mb-4">
                      {rateLoading ? (
                        <p className="text-sm text-gray-500">
                          Loading rates...
                        </p>
                      ) : rateData ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                          <p className="font-medium">Estimated</p>
                          <p className="text-xs text-gray-600">
                            ₦{ngnForRate.toLocaleString()} →{" "}
                            {rateData.cryptoAmount}{" "}
                            {(
                              selectedCurrency.split(":")[1] || "USDC"
                            ).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Rate: 1{" "}
                            {(
                              selectedCurrency.split(":")[1] || "USDC"
                            ).toUpperCase()}{" "}
                            = ₦{rateData.rate}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Rates unavailable
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {walletView === "starknet" && starknetAddress && (
                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 flex items-center justify-center">
                                <Image
                                  src={strkLogo}
                                  alt="Starknet"
                                  width={32}
                                  height={32}
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-base">
                                  Starknet
                                </p>
                                <p className="text-xs text-gray-600">
                                  STRK Network
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
                            <p className="text-xs text-gray-600 mb-2 font-medium">
                              Wallet Address
                            </p>
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-mono text-sm text-gray-900 break-all flex-1">
                                {starknetAddress}
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    starknetAddress,
                                    "Starknet address"
                                  )
                                }
                                className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium flex items-center space-x-2 flex-shrink-0"
                              >
                                <Copy size={16} />
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 flex items-start space-x-2">
                            <Info
                              size={18}
                              className="text-gray-600 flex-shrink-0 mt-0.5"
                            />
                            <p className="text-xs text-gray-700">
                              Send USDC, USDT, ETH or other tokens on Starknet
                              to this address. Deposits arrive within 1-3
                              minutes.
                            </p>
                          </div>
                        </div>
                      )}

                      {walletView === "evm" && evmAddress && (
                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 flex items-center justify-center">
                                <Image
                                  src={ethLogo}
                                  alt="Ethereum"
                                  width={20}
                                  height={20}
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-base">
                                  EVM Networks
                                </p>
                                <p className="text-xs text-gray-600">
                                  Base • Polygon • BSC • Ethereum
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
                            <p className="text-xs text-gray-600 mb-2 font-medium">
                              Wallet Address
                            </p>
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-mono text-sm text-gray-900 break-all flex-1">
                                {evmAddress}
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(evmAddress, "EVM address")
                                }
                                className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium flex items-center space-x-2 flex-shrink-0"
                              >
                                <Copy size={16} />
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 flex items-start space-x-2">
                            <Info
                              size={18}
                              className="text-gray-600 flex-shrink-0 mt-0.5"
                            />
                            <p className="text-xs text-gray-700">
                              Send USDC, USDT, or cNGN on any EVM-compatible
                              network to this address. Deposits arrive within
                              1-5 minutes.
                            </p>
                          </div>
                        </div>
                      )}

                      {walletView === "evm" && svmAddress && (
                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 flex items-center justify-center">
                                <Image
                                  src={solLogo}
                                  alt="Solana"
                                  width={25}
                                  height={25}
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-base">
                                  Solana Network
                                </p>
                                <p className="text-xs text-gray-600">
                                  SPL Tokens
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
                            <p className="text-xs text-gray-600 mb-2 font-medium">
                              Wallet Address
                            </p>
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-mono text-sm text-gray-900 break-all flex-1">
                                {svmAddress}
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(svmAddress, "Solana address")
                                }
                                className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium flex items-center space-x-2 flex-shrink-0"
                              >
                                <Copy size={16} />
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 flex items-start space-x-2">
                            <Info
                              size={18}
                              className="text-gray-600 flex-shrink-0 mt-0.5"
                            />
                            <p className="text-xs text-gray-700">
                              Send USDC or other SPL tokens on Solana to this
                              address. Deposits arrive within seconds.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                    <div className="flex items-start space-x-3">
                      <Warning
                        size={24}
                        className="text-yellow-600 flex-shrink-0 mt-0.5"
                      />
                      <div className="text-sm text-yellow-900">
                        <p className="font-bold mb-2 text-base">
                          ⚠️ Important Safety Notes:
                        </p>
                        <ul className="space-y-1.5 list-disc list-inside">
                          <li>
                            <strong>Only send supported tokens:</strong> USDC,
                            USDT, cNGN, ETH, or STRK
                          </li>
                          <li>
                            <strong>Verify the network:</strong> Make sure
                            you're sending on the correct blockchain
                          </li>
                          <li>
                            <strong>Double-check the address:</strong> Crypto
                            transactions cannot be reversed
                          </li>
                          <li>
                            <strong>Loss warning:</strong> Sending unsupported
                            tokens or using the wrong network will result in
                            permanent loss of funds
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {method === "fiat" && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      How much do you want to add?
                    </h2>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">
                        ₦
                      </span>
                      <input
                        type="number"
                        value={ngnAmount}
                        onChange={(e) => setNgnAmount(e.target.value)}
                        placeholder="10,000"
                        min="1000"
                        className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-2xl font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {[10000, 50000, 100000, 500000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setNgnAmount(amount.toString())}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          ₦{amount / 1000}K
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      What do you want to receive?
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {cryptoOptions.map((option) => (
                        <button
                          key={option.symbol}
                          onClick={() =>
                            setSelectedCurrency(option.symbol as Asset)
                          }
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedCurrency === option.symbol
                              ? "border-black bg-gray-50 ring-2 ring-gray-200"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center mb-2 mx-auto p-2`}
                          >
                            <Image
                              src={option.logo}
                              alt={option.name}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          </div>
                          <p className="font-semibold text-sm text-gray-900">
                            {option.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {option.chain}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!ngnAmount || ngnValue < 1000}
                    className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Your Bank
                </h2>
                <div className="relative bank-dropdown">
                  <button
                    onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-left flex items-center justify-between"
                  >
                    <span
                      className={
                        selectedBank ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {selectedBank
                        ? banks.find((b) => b.code === selectedBank)?.name
                        : "Choose your bank"}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isBankDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isBankDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-hidden">
                      <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                        <input
                          type="text"
                          value={bankSearchQuery}
                          onChange={(e) => setBankSearchQuery(e.target.value)}
                          placeholder="Search for your bank..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                          autoFocus
                        />
                      </div>

                      <div className="overflow-y-auto max-h-60">
                        {filteredBanks.length > 0 ? (
                          filteredBanks.map((bank) => (
                            <button
                              key={bank.code}
                              onClick={() => {
                                setSelectedBank(bank.code);
                                setIsBankDropdownOpen(false);
                                setBankSearchQuery("");
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <p className="text-sm font-medium text-gray-900">
                                {bank.name}
                              </p>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            No banks found matching "{bankSearchQuery}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Enter Account Number
                </h2>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) =>
                    setAccountNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  placeholder="0123456789"
                  maxLength={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-lg"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter your 10-digit account number
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={verifyAccount}
                  disabled={
                    !selectedBank || accountNumber.length !== 10 || isVerifying
                  }
                  className="flex-1 px-4 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center space-x-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Account</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && accountDetails && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="font-semibold text-green-900">
                    Account Verified
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  {accountDetails.account_name}
                </p>
                <p className="text-xs text-green-600 font-mono">
                  {accountDetails.bank_name} - {accountDetails.account_number}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📱 Make Your Deposit
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Transfer Details:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-gray-900">
                          ₦{ngnValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">To Account:</span>
                        <span className="font-mono text-gray-900">
                          {accountDetails.account_number}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="text-gray-900">
                          {accountDetails.bank_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="text-gray-900">
                          {accountDetails.account_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">
                      ⚡ Quick Steps:
                    </p>
                    <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                      <li>Open your banking app</li>
                      <li>
                        Transfer ₦{ngnValue.toLocaleString()} to the account
                        above
                      </li>
                      <li>Come back here and click "I've Sent the Money"</li>
                      <li>
                        We'll convert it to {selectedOption?.name} on{" "}
                        {selectedOption?.chain}
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Change Bank
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-medium"
                >
                  I've Sent the Money
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowsLeftRight size={32} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Ready to Convert
                </h2>
                <p className="text-gray-600">
                  Click below to convert your Naira to {selectedOption?.name}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-semibold">
                    ₦{ngnValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight size={24} className="text-gray-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">To:</span>
                  <div className="flex items-center space-x-2">
                    <Image
                      src={selectedOption?.logo!}
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span className="font-semibold">
                      {selectedOption?.name} on {selectedOption?.chain}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSwap}
                disabled={isSwapping}
                className="w-full px-4 py-4 bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center justify-center space-x-2"
              >
                {isSwapping ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <ArrowsLeftRight size={20} />
                    <span>Convert to {selectedOption?.name}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={isSwapping}
                className="w-full text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Back to Deposit Instructions
              </button>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Info size={24} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 mb-2">How It Works</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • <strong>Bank Transfer:</strong> Deposit Naira and we
                    auto-convert to crypto
                  </li>
                  <li>
                    • <strong>Crypto Deposit:</strong> Send directly from any
                    wallet or exchange
                  </li>
                  <li>• Receive funds instantly in your PayPortz wallet</li>
                  <li>• Start making international payments immediately</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div
            className={`flex items-center space-x-3 p-4 rounded-xl shadow-lg border ${
              toast.type === "success"
                ? "bg-green-50 border-green-200"
                : toast.type === "error"
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="text-sm font-medium text-gray-900">
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AddFunds;
