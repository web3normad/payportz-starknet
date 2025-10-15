"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Layout from "../components/core/Layout";
import { ethers } from "ethers";
import {
  Wallet,
  TrendUp,
  ArrowUp,
  ArrowDown,
  Plus,
  Eye,
  EyeSlash,
  ArrowsLeftRight,
  Spinner,
  Copy,
} from "@phosphor-icons/react";
import { breadApi } from "@/app/lib/breadApi";
import usdtLogo from "@/public/usdt-logo.svg";
import usdcLogo from "@/public/usdc-logo.svg";
import cngnLogo from "@/public/cngn-logo.png";
import starknetLogo from "@/public/strk-logo.svg";

const Dashboard = () => {
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletId, setWalletId] = useState("");
  const [starknetAddress, setStarknetAddress] = useState("");

  const logoMap: Record<string, any> = {
    USDC: usdcLogo,
    USDT: usdtLogo,
    CNGN: cngnLogo,
  };

  const colorMap: Record<string, string> = {
    USDC: "from-blue-500 to-blue-600",
    USDT: "from-teal-500 to-teal-600",
    CNGN: "from-green-500 to-green-600",
    STRK: "from-purple-500 to-purple-600",
    ETH: "from-gray-700 to-gray-900",
  };

  const [exchangeRates, setExchangeRates] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const breadWalletId = localStorage.getItem("payportz_bread_wallet_id");
        const strkAddress = localStorage.getItem("payportz_starknet_address");

        if (strkAddress) setStarknetAddress(strkAddress);

        if (breadWalletId) {
          setWalletId(breadWalletId);

          await Promise.all([
            strkAddress
              ? fetchStarknetBalance(strkAddress).catch((e) => {
                  console.warn("Starknet balance fetch error", e);
                  return null;
                })
              : Promise.resolve(null),
            fetchBalances(breadWalletId).catch((e) => {
              console.warn("Bread API balance fetch error", e);
              return [];
            }),
            fetchExchangeRates().catch((e) => {
              console.warn("Exchange rates fetch error", e);
            }),
          ]);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Dashboard initialization error:", err);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Minimal ERC20 ABI
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function transfer(address to, uint256 amount) returns (bool)",
  ];

  const getProvider = () => {
    const rpc = process.env.NEXT_PUBLIC_RPC_URL || "";
    try {
      if (rpc) return new ethers.JsonRpcProvider(rpc);
    } catch (e) {
      console.warn("invalid RPC URL, falling back to default provider", e);
    }
    return ethers.getDefaultProvider();
  };

  const fetchStarknetBalance = async (address: string) => {
    try {
      const response = await fetch("/api/starknet/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (data.ok && data.balance) {
        const balanceInStrk = parseFloat(ethers.formatUnits(data.balance, 18));

        // Fetch STRK price in USD (optional - you can add this later)
        let usdValue = balanceInStrk; // Default to 1:1 if no price feed

        const strkWallet = {
          id: "strk",
          symbol: "STRK",
          name: "Starknet",
          blockchain: "Starknet",
          balance: balanceInStrk,
          usdValue: usdValue,
          change24h: 0,
          color: "from-purple-500 to-purple-600",
          logo: starknetLogo,
        };

        setWallets((prev) => {
          const filtered = prev.filter((w) => w.id !== "strk");
          return [...filtered, strkWallet];
        });

        return strkWallet;
      } else {
        console.warn("Failed to fetch Starknet balance:", data.error);
        return null;
      }
    } catch (err) {
      console.error("Starknet balance fetch error:", err);
      return null;
    }
  };

  // removed EVM/Solana on-chain fetches — dashboard only shows Starknet and Bread balances

  const quickSend = async (wallet: any) => {
    try {
      const to = window.prompt("Recipient address:");
      if (!to) return;
      const amount = window.prompt(`Amount of ${wallet.symbol} to send:`);
      if (!amount) return;

      const privateKey = localStorage.getItem("payportz_evm_private_key");
      if (!privateKey) {
        showToast("No private key available to sign transaction", "error");
        return;
      }

      const provider = getProvider();
      const signer = new ethers.Wallet(privateKey, provider);

      if (wallet.symbol === "ETH") {
        const tx = await signer.sendTransaction({
          to,
          value: ethers.parseEther(amount),
        });
        showToast("Transaction submitted: " + tx.hash, "success");
        await tx.wait();
        showToast("Transaction confirmed", "success");
      } else if (wallet.symbol === "USDC" || wallet.symbol === "USDT") {
        const tokenAddress =
          wallet.symbol === "USDC"
            ? process.env.NEXT_PUBLIC_USDC_ADDRESS ||
              "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            : process.env.NEXT_PUBLIC_USDT_ADDRESS ||
              "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const decimals = await token.decimals().catch(() => 6);
        const parsed = ethers.parseUnits(amount, decimals);
        const tx = await token.transfer(to, parsed);
        showToast("Transaction submitted: " + tx.hash, "success");
        await tx.wait();
        showToast("Transaction confirmed", "success");
      } else {
        window.location.href = `/send?currency=${wallet.id}`;
        return;
      }

      // refresh balances after send
      const addr = localStorage.getItem("payportz_bread_wallet_evm") || "";
      if (addr) fetchOnchainBalances(addr).catch(() => null);
    } catch (err: any) {
      console.error("quickSend error", err);
      showToast(err?.message || "Failed to send transaction", "error");
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const [onrampRateData, offrampRateData] = await Promise.all([
        breadApi.getOnrampRate("NGN"),
        breadApi.getOfframpRate("NGN"),
      ]);

      setExchangeRates([
        {
          from: "NGN",
          to: "USDC",
          rate: onrampRateData.rate,
          trend: "up",
          label: "Buy Rate",
        },
        {
          from: "USDC",
          to: "NGN",
          rate: offrampRateData.rate,
          trend: "up",
          label: "Sell Rate",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    }
  };

  const fetchBalances = async (id: string) => {
    try {
      const balances = await breadApi.getBalances(id);

      const transformedWallets = balances.map((balance: any) => ({
        id: balance.id,
        symbol: balance.code,
        name: balance.name,
        blockchain: balance.blockchain.name,
        balance: balance.available,
        usdValue:
          balance.code === "CNGN"
            ? balance.available / 1600
            : balance.available,
        change24h: 0,
        color: colorMap[balance.code] || "from-gray-500 to-gray-600",
        logo: logoMap[balance.code] || null,
      }));

      setWallets((prev) => {
        const breadIds = transformedWallets.map((w: any) => w.id);
        const filtered = prev.filter((w) => !breadIds.includes(w.id));
        return [...filtered, ...transformedWallets];
      });

      return transformedWallets;
    } catch (error: any) {
      console.error("Failed to fetch Bread balances:", error);
      showToast("Failed to load some balances", "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const recentTransactions = [
    {
      id: "tx1",
      type: "send",
      amount: 5000,
      currency: "USDC",
      supplierName: "Shenzhen Textile Co.",
      country: "🇨🇳 China",
      date: "2 hours ago",
      status: "completed",
    },
    {
      id: "tx2",
      type: "onramp",
      amount: 8000,
      currency: "USDC",
      from: "₦12,800,000",
      date: "1 day ago",
      status: "completed",
    },
    {
      id: "tx3",
      type: "offramp",
      amount: 1500,
      currency: "USDC",
      to: "₦2,400,000",
      date: "3 days ago",
      status: "completed",
    },
  ];

  const totalUsdValue = wallets.reduce(
    (sum, wallet) => sum + wallet.usdValue,
    0
  );

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUp size={20} className="text-red-600" />;
      case "onramp":
        return <Plus size={20} className="text-green-600" />;
      case "offramp":
        return <ArrowDown size={20} className="text-blue-600" />;
      default:
        return <ArrowsLeftRight size={20} className="text-gray-600" />;
    }
  };

  const getTransactionLabel = (tx: any) => {
    switch (tx.type) {
      case "send":
        return `Sent to ${tx.supplierName || tx.recipient} · ${
          tx.country || ""
        }`;
      case "onramp":
        return `Added funds (${tx.from})`;
      case "offramp":
        return `Withdrew to bank (${tx.to})`;
      default:
        return "Transaction";
    }
  };

  const refreshAllBalances = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        starknetAddress
          ? fetchStarknetBalance(starknetAddress)
          : Promise.resolve(null),
        walletId ? fetchBalances(walletId) : Promise.resolve([]),
      ]);
      showToast("Balances refreshed successfully");
    } catch (err) {
      console.error("Failed to refresh balances:", err);
      showToast("Failed to refresh balances", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-black mx-auto"></div>
            <p className="text-gray-900 mt-6 text-lg font-medium">
              Loading your balances...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage your multi-currency balances
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshAllBalances}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                title="Refresh balances"
              >
                <ArrowsLeftRight size={20} />
              </button>
              <button
                onClick={() => setBalancesHidden(!balancesHidden)}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {balancesHidden ? <Eye size={20} /> : <EyeSlash size={20} />}
              </button>
            </div>
          </div>

          {/* Total Balance Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-300 text-sm mb-2">
                  Total Balance (USD)
                </p>
                <div className="flex items-baseline space-x-3">
                  {balancesHidden ? (
                    <span className="text-5xl font-bold">••••••</span>
                  ) : (
                    <>
                      <span className="text-5xl font-bold">
                        ${totalUsdValue.toLocaleString()}
                      </span>
                      <span className="text-xl text-gray-400">
                        .{(totalUsdValue % 1).toFixed(2).slice(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white bg-opacity-10 px-4 py-2 rounded-xl">
                <Wallet size={20} className="text-blue-400" />
                <span className="text-blue-400 font-medium">
                  {wallets.length} Assets
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => (window.location.href = "/add-funds")}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-xl p-4 transition-all text-left"
              >
                <Plus size={24} className="mb-2" />
                <div className="font-medium">Add Money</div>
                <div className="text-sm text-gray-300">Deposit Naira</div>
              </button>

              <button
                onClick={() => (window.location.href = "/send")}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-xl p-4 transition-all text-left"
              >
                <ArrowUp size={24} className="mb-2" />
                <div className="font-medium">Send Payment</div>
                <div className="text-sm text-gray-300">Pay suppliers</div>
              </button>

              <button
                onClick={() => (window.location.href = "/withdraw")}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-xl p-4 transition-all text-left"
              >
                <ArrowDown size={24} className="mb-2" />
                <div className="font-medium">Withdraw</div>
                <div className="text-sm text-gray-300">Cash out to bank</div>
              </button>

              <button
                onClick={() => {
                  const address = starknetAddress;
                  if (address) {
                    copyToClipboard(address, "Wallet address");
                  } else {
                    showToast("No wallet address found", "error");
                  }
                }}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-xl p-4 transition-all text-left"
              >
                <Wallet size={24} className="mb-2" />
                <div className="font-medium">Receive Crypto</div>
                <div className="text-sm text-gray-300">Copy address</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallet Balances */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Wallets
              </h2>

              {wallets.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center">
                  <Wallet size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No balances yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add money to your wallet to get started
                  </p>
                  <button
                    onClick={() => (window.location.href = "/add-funds")}
                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 font-medium"
                  >
                    Add Money Now
                  </button>
                </div>
              ) : (
                wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center p-2`}
                        >
                          {wallet.logo ? (
                            <Image
                              src={wallet.logo}
                              alt={wallet.name}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          ) : (
                            <span className="text-2xl">💰</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {wallet.symbol}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {wallet.name} · {wallet.blockchain}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {balancesHidden ? (
                          <p className="text-2xl font-bold text-gray-900">
                            ••••••
                          </p>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-gray-900">
                              {wallet.symbol === "CNGN"
                                ? `₦${wallet.balance.toLocaleString()}`
                                : `${wallet.balance.toFixed(4)} ${
                                    wallet.symbol
                                  }`}
                            </p>
                            {wallet.symbol !== "USDC" &&
                              wallet.symbol !== "USDT" && (
                                <p className="text-sm text-gray-500">
                                  ≈ ${wallet.usdValue.toLocaleString()}
                                </p>
                              )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                      <div className="flex-1">
                        <button
                          onClick={() =>
                            (window.location.href = `/send?currency=${wallet.id}`)
                          }
                          disabled={wallet.balance === 0}
                          className="w-full mb-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Send
                        </button>
                        <button
                          onClick={() =>
                            (window.location.href = `/withdraw?currency=${wallet.id}`)
                          }
                          disabled={wallet.balance === 0}
                          className="w-full mb-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                        >
                          Withdraw
                        </button>
                        {/* Privy/EVM/Solana send button removed — only in-app Send/Withdraw available */}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Exchange Rates */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  Live Exchange Rates
                </h3>
                {exchangeRates.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Loading rates...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exchangeRates.map((rate, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center space-x-2">
                          <ArrowsLeftRight
                            size={16}
                            className="text-gray-400"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 block">
                              {rate.from} → {rate.to}
                            </span>
                            <span className="text-xs text-gray-500">
                              {rate.label}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            ₦{rate.rate.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Crypto Deposit Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <Wallet size={24} className="text-gray-900" />
                  <h3 className="font-semibold text-lg text-gray-900">
                    Receive Crypto
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Send crypto from any wallet or exchange to your PayPortz
                  addresses
                </p>

                <div className="space-y-3">
                  {starknetAddress && (
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-purple-700">
                          STARKNET
                        </p>
                        <span className="text-xs text-purple-600">
                          Sepolia • Mainnet
                        </span>
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <p className="font-mono text-xs text-gray-900 truncate flex-1">
                          {starknetAddress}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(starknetAddress, "Starknet address")
                          }
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium flex-shrink-0 flex items-center space-x-1"
                        >
                          <Copy size={14} />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  )}
                  {/* EVM and Solana address cards removed — dashboard focuses on Starknet only */}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getTransactionLabel(tx)}
                          </p>
                          <p className="text-xs text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            tx.type === "send"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {tx.type === "send" ? "-" : "+"}
                          {tx.amount.toLocaleString()} {tx.currency}
                        </p>
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full mt-1">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 p-3 rounded-lg shadow-lg border transition-all duration-300 text-sm z-50 ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : toast.type === "info"
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-green-50 border-green-200 text-green-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "error" ? (
              <span className="text-red-600">⚠️</span>
            ) : toast.type === "info" ? (
              <span className="text-blue-600">ℹ️</span>
            ) : (
              <span className="text-green-600">✅</span>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
