"use client";
import React, { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Layout from "../components/core/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  ArrowsLeftRight,
  CurrencyDollar,
  Bank,
  CheckCircle,
  Clock,
  TrendUp,
  Calculator,
  Warning,
  Copy,
  Wallet,
  Globe,
  CaretDown,
  Receipt,
  Lightning,
} from "@phosphor-icons/react";

// Supported currency codes (typed for safer indexing)
type FiatCode = "NGN" | "CNY" | "TRY" | "EUR" | "GBP";
type StableSymbol = "USDC" | "USDT" | "DAI" | "EURC" | "CNHC";

const SUPPORTED_STABLECOINS: {
  symbol: StableSymbol;
  name: string;
  icon: string;
  color: string;
}[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
    color: "bg-blue-100 text-blue-800",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "💸",
    color: "bg-green-100 text-green-800",
  },
  {
    symbol: "DAI",
    name: "Dai",
    icon: "🟠",
    color: "bg-orange-100 text-orange-800",
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    icon: "💶",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    symbol: "CNHC",
    name: "CNH Coin",
    icon: "💴",
    color: "bg-red-100 text-red-800",
  },
];

const SUPPORTED_FIAT_CURRENCIES: {
  code: FiatCode;
  name: string;
  symbol: string;
  country: string;
  flag: string;
}[] = [
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    country: "Nigeria",
    flag: "🇳🇬",
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    country: "China",
    flag: "🇨🇳",
  },
  {
    code: "TRY",
    name: "Turkish Lira",
    symbol: "₺",
    country: "Turkey",
    flag: "🇹🇷",
  },
  { code: "EUR", name: "Euro", symbol: "€", country: "EU", flag: "🇪🇺" },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    country: "UK",
    flag: "🇬🇧",
  },
];

// Mock exchange rates typed with the FiatCode and StableSymbol keys
const MOCK_EXCHANGE_RATES: Record<FiatCode, Record<StableSymbol, number>> = {
  NGN: { USDC: 1580, USDT: 1575, DAI: 1582, EURC: 1720, CNHC: 215 },
  CNY: { USDC: 7.25, USDT: 7.23, DAI: 7.26, EURC: 7.85, CNHC: 1.02 },
  TRY: { USDC: 32.5, USDT: 32.4, DAI: 32.6, EURC: 35.2, CNHC: 4.5 },
  EUR: { USDC: 0.92, USDT: 0.91, DAI: 0.93, EURC: 1, CNHC: 7.65 },
  GBP: { USDC: 0.79, USDT: 0.788, DAI: 0.795, EURC: 0.86, CNHC: 6.55 },
};

export default function ConvertCurrency() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  // localStorage is only available in the browser. Read it inside useEffect
  // to avoid Next.js prerender errors (localStorage is undefined on server).
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const a = localStorage.getItem("payportz_chipiwallet_address");
        setAddress(a);
      } catch (err) {
        // ignore localStorage access errors in restrictive environments
        setAddress(null);
      }
    }
  }, []);

  const isConnected = isSignedIn && !!address;

  // State for multi-currency support
  const [selectedFiat, setSelectedFiat] = useState("NGN");
  const [selectedStablecoin, setSelectedStablecoin] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [applicationStatus, setApplicationStatus] = useState<
    "initial" | "preview" | "processing" | "payment_pending" | "completed"
  >("initial");
  const [orderData, setOrderData] = useState<any>(null);
  const [showFiatDropdown, setShowFiatDropdown] = useState(false);
  const [showStablecoinDropdown, setShowStablecoinDropdown] = useState(false);

  // Mock wallet balances
  const [walletBalances, setWalletBalances] = useState({
    USDC: 2450.0,
    USDT: 1200.0,
    DAI: 800.5,
    EURC: 350.75,
    CNHC: 1500.0,
  });

  // Toast notification state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  // Get current currency details
  const currentFiat = SUPPORTED_FIAT_CURRENCIES.find(
    (fiat) => fiat.code === selectedFiat
  );
  const currentStablecoin = SUPPORTED_STABLECOINS.find(
    (coin) => coin.symbol === selectedStablecoin
  );

  // Calculate conversion data
  const amount = parseFloat(fromAmount) || 0;
  const fiatKey = selectedFiat as FiatCode;
  const stableKey = selectedStablecoin as StableSymbol;
  const currentRate = MOCK_EXCHANGE_RATES[fiatKey]?.[stableKey] ?? 1;
  const rateData =
    amount > 0
      ? {
          rate: currentRate,
          fee: amount * 0.015, // 1.5% fee
          totalAmount: amount + amount * 0.015,
          cryptoAmount: amount / currentRate,
        }
      : null;

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "success" }),
      5000
    );
  };

  const handleCloseToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isConnected) {
      showToast("Please sign in to continue", "error");
      return;
    }

    if (fromAmount && rateData) {
      setApplicationStatus("preview");
    }
  };

  // Handle confirming conversion
  const handleConfirmConversion = () => {
    if (!isConnected || !fromAmount) {
      showToast("Please sign in and enter amount", "error");
      return;
    }

    setApplicationStatus("processing");

    // Mock conversion process
    const mockData = {
      id: `TRADE-${Date.now()}`,
      paymentDetails: {
        bankName: "Global Exchange Bank",
        accountNumber: "1234567890",
        accountName: `Global ${selectedFiat} Collection`,
        reference: `REF${Date.now()}`,
        expiresAt: "15 minutes",
        currency: selectedFiat,
        stablecoin: selectedStablecoin,
      },
    };

    setTimeout(() => {
      setOrderData(mockData);
      setApplicationStatus("payment_pending");
      showToast(`Conversion order created!`, "info");
    }, 1500);

    // Simulate completion after payment
    setTimeout(() => {
      setApplicationStatus("completed");
      setWalletBalances((prev) => ({
        ...prev,
        [selectedStablecoin]:
          prev[selectedStablecoin as keyof typeof prev] +
          (rateData?.cryptoAmount || 0),
      }));
      showToast(`${selectedStablecoin} credited successfully!`, "success");
    }, 8000);
  };

  // Handle starting new conversion
  const handleNewConversion = () => {
    setApplicationStatus("initial");
    setFromAmount("");
    setOrderData(null);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  if (!isLoaded) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Convert Currency
            </h1>
            <p className="text-gray-600 text-lg">
              Fast, secure conversions with real-time rates
            </p>
          </div>

          {/* Main Conversion Card */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Conversion Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white rounded-2xl shadow-xl border-0">
                <div className="p-6">
                  {/* Quick Stats Bar */}
                  <div className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Current Rate</p>
                      <p className="text-xl font-bold text-gray-900">
                        {currentFiat?.symbol}1 = ${(1 / currentRate).toFixed(4)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Fee</p>
                      <p className="text-xl font-bold text-green-600">1.5%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Speed</p>
                      <div className="flex items-center text-purple-600">
                        <Lightning size={20} />
                        <span className="font-bold ml-1">Instant</span>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Currency Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* From Currency */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          You Send
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowFiatDropdown(!showFiatDropdown)
                            }
                            className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">
                                {currentFiat?.flag}
                              </span>
                              <div className="text-left">
                                <p className="font-medium text-gray-900">
                                  {currentFiat?.code}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {currentFiat?.name}
                                </p>
                              </div>
                            </div>
                            <CaretDown size={16} className="text-gray-400" />
                          </button>

                          {showFiatDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                              {SUPPORTED_FIAT_CURRENCIES.map((currency) => (
                                <button
                                  key={currency.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedFiat(currency.code);
                                    setShowFiatDropdown(false);
                                  }}
                                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors"
                                >
                                  <span className="text-xl">
                                    {currency.flag}
                                  </span>
                                  <div className="text-left">
                                    <p className="font-medium text-gray-900">
                                      {currency.code}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {currency.name}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* To Currency */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          You Receive
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowStablecoinDropdown(!showStablecoinDropdown)
                            }
                            className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">
                                {currentStablecoin?.icon}
                              </span>
                              <div className="text-left">
                                <p className="font-medium text-gray-900">
                                  {currentStablecoin?.symbol}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {currentStablecoin?.name}
                                </p>
                              </div>
                            </div>
                            <CaretDown size={16} className="text-gray-400" />
                          </button>

                          {showStablecoinDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                              {SUPPORTED_STABLECOINS.map((coin) => (
                                <button
                                  key={coin.symbol}
                                  type="button"
                                  onClick={() => {
                                    setSelectedStablecoin(coin.symbol);
                                    setShowStablecoinDropdown(false);
                                  }}
                                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors"
                                >
                                  <span className="text-xl">{coin.icon}</span>
                                  <div className="text-left">
                                    <p className="font-medium text-gray-900">
                                      {coin.symbol}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {coin.name}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount Inputs */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount to Convert
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">
                            {currentFiat?.symbol}
                          </span>
                          <input
                            type="number"
                            value={fromAmount}
                            onChange={(e) => setFromAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-gray-50 text-gray-900 text-2xl font-semibold rounded-xl pl-12 pr-4 py-5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            disabled={applicationStatus !== "initial"}
                          />
                        </div>
                      </div>

                      {/* Conversion Arrow */}
                      <div className="flex justify-center">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                          <ArrowsLeftRight size={20} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          You'll Receive
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">
                            $
                          </span>
                          <input
                            type="text"
                            value={
                              rateData
                                ? rateData.cryptoAmount.toFixed(2)
                                : "0.00"
                            }
                            className="w-full bg-gray-50 text-gray-900 text-2xl font-semibold rounded-xl pl-12 pr-4 py-5 border border-gray-300 cursor-not-allowed"
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    {/* Conversion Details */}
                    {rateData && fromAmount && (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Exchange Rate</span>
                          <span className="font-medium">
                            1 {selectedStablecoin} = {currentFiat?.symbol}
                            {rateData.rate.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Processing Fee</span>
                          <span className="font-medium">
                            {currentFiat?.symbol}
                            {rateData.fee.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                          <span className="text-gray-800 font-semibold">
                            Total Cost
                          </span>
                          <span className="font-semibold">
                            {currentFiat?.symbol}
                            {rateData.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {applicationStatus === "initial" && (
                      <Button
                        type="submit"
                        className="w-full py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-[1.02]"
                        disabled={!fromAmount || !rateData || !isConnected}
                      >
                        Continue
                      </Button>
                    )}
                  </form>
                </div>
              </Card>
            </div>

            {/* Right Column - Info & Status */}
            <div className="space-y-6">
              {/* Wallet Balance */}
              {isConnected && (
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl border-0">
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-300 mb-4">
                      Your Balances
                    </h3>
                    <div className="space-y-3">
                      {SUPPORTED_STABLECOINS.map((coin) => (
                        <div
                          key={coin.symbol}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{coin.icon}</span>
                            <span className="font-medium">{coin.symbol}</span>
                          </div>
                          <span className="font-semibold">
                            $
                            {walletBalances[
                              coin.symbol as keyof typeof walletBalances
                            ].toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Status Panel */}
              {(applicationStatus === "preview" ||
                applicationStatus === "payment_pending" ||
                applicationStatus === "completed") &&
                rateData && (
                  <Card className="rounded-2xl border-0 shadow-lg">
                    <div className="p-6">
                      {/* Status Header */}
                      <div className="flex items-center space-x-3 mb-6">
                        <div
                          className={`p-2 rounded-full ${
                            applicationStatus === "preview"
                              ? "bg-blue-100 text-blue-600"
                              : applicationStatus === "payment_pending"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {applicationStatus === "preview" && (
                            <Receipt size={20} />
                          )}
                          {applicationStatus === "payment_pending" && (
                            <Clock size={20} />
                          )}
                          {applicationStatus === "completed" && (
                            <CheckCircle size={20} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {applicationStatus === "preview" && "Order Preview"}
                            {applicationStatus === "payment_pending" &&
                              "Awaiting Payment"}
                            {applicationStatus === "completed" &&
                              "Conversion Complete"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {applicationStatus === "preview" &&
                              "Review your conversion details"}
                            {applicationStatus === "payment_pending" &&
                              "Complete your payment"}
                            {applicationStatus === "completed" &&
                              "Funds have been credited"}
                          </p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">You send</span>
                            <span className="font-semibold text-gray-900">
                              {currentFiat?.symbol}
                              {parseFloat(fromAmount).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">You receive</span>
                            <span className="font-semibold text-purple-600">
                              ${rateData.cryptoAmount.toFixed(2)}{" "}
                              {selectedStablecoin}
                            </span>
                          </div>
                        </div>

                        {applicationStatus === "preview" && (
                          <div className="space-y-3">
                            <Button
                              onClick={handleConfirmConversion}
                              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                              Confirm Conversion
                            </Button>
                            <Button
                              onClick={() => setApplicationStatus("initial")}
                              variant="outline"
                              className="w-full py-3 rounded-xl"
                            >
                              Edit Details
                            </Button>
                          </div>
                        )}

                        {applicationStatus === "payment_pending" &&
                          orderData && (
                            <div className="space-y-4">
                              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div className="flex items-start space-x-2">
                                  <Warning
                                    size={18}
                                    className="text-yellow-600 mt-0.5 flex-shrink-0"
                                  />
                                  <div className="text-sm text-yellow-800">
                                    <p className="font-medium">
                                      Transfer {currentFiat?.symbol}
                                      {rateData.totalAmount.toLocaleString()}{" "}
                                      to:
                                    </p>
                                    <p className="mt-1 font-mono">
                                      {orderData.paymentDetails.accountNumber}
                                    </p>
                                    <p className="text-xs mt-2">
                                      Reference:{" "}
                                      {orderData.paymentDetails.reference}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  onClick={() =>
                                    copyToClipboard(
                                      orderData.paymentDetails.accountNumber
                                    )
                                  }
                                  variant="outline"
                                  className="flex-1 py-2 rounded-xl"
                                >
                                  Copy Details
                                </Button>
                                <Button
                                  onClick={() =>
                                    copyToClipboard(
                                      orderData.paymentDetails.reference
                                    )
                                  }
                                  variant="outline"
                                  className="flex-1 py-2 rounded-xl"
                                >
                                  Copy Reference
                                </Button>
                              </div>
                            </div>
                          )}

                        {applicationStatus === "completed" && (
                          <div className="text-center space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                              <CheckCircle
                                size={32}
                                className="text-green-500 mx-auto mb-2"
                              />
                              <p className="font-semibold text-green-800">
                                Conversion Successful!
                              </p>
                              <p className="text-sm text-green-700 mt-1">
                                ${rateData.cryptoAmount.toFixed(2)}{" "}
                                {selectedStablecoin} has been added to your
                                wallet
                              </p>
                            </div>
                            <Button
                              onClick={handleNewConversion}
                              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                              New Conversion
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

              {/* Features Panel */}
              {applicationStatus === "initial" && (
                <Card className="rounded-2xl border-0 bg-white">
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Why Convert With Us?
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                          <TrendUp size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            Best Exchange Rates
                          </p>
                          <p className="text-xs text-gray-600">
                            Real-time market rates
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <Lightning size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Fast Processing</p>
                          <p className="text-xs text-gray-600">
                            Complete in minutes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                          <Shield size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Secure & Safe</p>
                          <p className="text-xs text-gray-600">
                            Bank-level security
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 max-w-sm animate-in slide-in-from-right">
          <div className="flex items-center space-x-3">
            {toast.type === "success" && (
              <CheckCircle size={20} className="text-green-500" />
            )}
            {toast.type === "error" && (
              <Warning size={20} className="text-red-500" />
            )}
            {toast.type === "info" && (
              <Clock size={20} className="text-blue-500" />
            )}
            {toast.type === "warning" && (
              <Warning size={20} className="text-yellow-500" />
            )}
            <span className="text-gray-800 text-sm">{toast.message}</span>
            <button
              onClick={handleCloseToast}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

// Add missing Shield icon component
const Shield = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
    <path d="M208,40H48A16,16,0,0,0,32,56V114.8c0,92.36,78.1,123,93.76,128.18a19.6,19.6,0,0,0,12.48,0C153.9,237.78,232,207.16,232,114.8V56A16,16,0,0,0,208,40Zm0,16V114.8c0,73.56-60.53,99.53-76.68,105.62h-1.64a.47.47,0,0,1-.23,0l-.54-.17C113,220.34,48,194.32,48,114.8V56H208Z" />
  </svg>
);
