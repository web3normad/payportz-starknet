"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth, useUser } from "@clerk/nextjs";
import Layout from "../components/core/Layout";
import {
  ArrowUp,
  Wallet,
  Users,
  Warning,
  CheckCircle,
  Copy,
  Clock,
  X,
} from "@phosphor-icons/react";
import { breadApi, type Asset } from "@/app/lib/breadApi";
import usdtLogo from "@/public/usdt-logo.svg";
import usdcLogo from "@/public/usdc-logo.svg";
import cngnLogo from "@/public/cngn-logo.png";
import dynamic from "next/dynamic";

const IntentInput = dynamic(() => import("@/app/components/IntentInput"), {
  ssr: false,
});
const AICopilot = dynamic(() => import("@/app/components/AICopilot"), {
  ssr: false,
});

const SendPayment = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [isAppSignedIn, setIsAppSignedIn] = useState(false);

  useEffect(() => {
    try {
      const business = localStorage.getItem("payportz_business_name");
      const breadWalletId = localStorage.getItem("payportz_bread_wallet_id");
      setIsAppSignedIn(!!business && !!breadWalletId);
    } catch (e) {
      setIsAppSignedIn(false);
    }
  }, []);

  const [recipientType, setRecipientType] = useState("external"); // 'external' or 'platform'
  const [selectedCurrency, setSelectedCurrency] = useState<Asset>("base:usdc");
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [toast, setToast] = useState<any>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [aiEnabled, setAiEnabled] = useState(true);
  // Multisig state
  const [multisigEnabled, setMultisigEnabled] = useState(false);
  const [signersInput, setSignersInput] = useState(""); // comma-separated
  const [multisigSigners, setMultisigSigners] = useState<string[]>([]);
  const [multisigThreshold, setMultisigThreshold] = useState<number>(2);
  const [multisigProposals, setMultisigProposals] = useState<any[]>([]);
  // Demo escrow state (Starknet)
  const [escrows, setEscrows] = useState<any[]>([]);
  const [creatingEscrow, setCreatingEscrow] = useState(false);

  // Mock wallet balances - In production, fetch from Bread API
  const wallets = [
    {
      symbol: "base:usdc",
      balance: 8450.0,
      logo: usdcLogo,
      name: "USD Coin (Base)",
      color: "from-blue-500 to-blue-600",
    },
    {
      symbol: "polygon:usdc",
      balance: 3200.0,
      logo: usdcLogo,
      name: "USD Coin (Polygon)",
      color: "from-purple-500 to-purple-600",
    },
    {
      symbol: "bsc:usdt",
      balance: 2450.0,
      logo: usdtLogo,
      name: "Tether (BSC)",
      color: "from-teal-500 to-teal-600",
    },
    {
      symbol: "base:cngn",
      balance: 3200000,
      logo: cngnLogo,
      name: "Canza NGN (Base)",
      color: "from-green-500 to-green-600",
    },
    // Starknet USDC (mock)
    {
      symbol: "starknet:usdc",
      balance: 1200.0,
      logo: usdcLogo,
      name: "USDC (Starknet)",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  // Mock recent recipients
  const recentRecipients = [
    {
      type: "external",
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      label: "Shenzhen Supplier",
      lastUsed: "2 days ago",
    },
    {
      type: "external",
      address: "0x9876543210abcdef9876543210abcdef98765432",
      label: "Dubai Textile",
      lastUsed: "1 week ago",
    },
  ];

  useEffect(() => {
    const breadWalletId = localStorage.getItem("payportz_bread_wallet_id");
    if (breadWalletId) {
      setWalletId(breadWalletId);
    }

    // make platform recipient default (first option)
    setRecipientType("platform");
  }, []);

  // load multisig proposals
  useEffect(() => {
    const raw = localStorage.getItem("payportz_multisigs") || "[]";
    try {
      const items = JSON.parse(raw);
      setMultisigProposals(items || []);
    } catch (e) {
      setMultisigProposals([]);
    }
  }, []);

  // load demo escrows from server
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/demo/escrow");
        const data = await res.json();
        if (data?.escrows) setEscrows(data.escrows || []);
      } catch (err) {
        console.debug("Failed to load escrows", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    // Populate addresses from localStorage into the wallets list if available
    const evm = localStorage.getItem("payportz_bread_wallet_evm");
    const svm = localStorage.getItem("payportz_bread_wallet_svm");
    // If present, optionally show them in the UI or use as defaults
    // We'll set as defaults by keeping walletId (already set) and allow selection by currency.
    if (evm) {
      // If current selectedCurrency is an EVM USDC variant, prefer using evm address implicitly
      // (no state change needed here unless you want to show explicit address picker)
      console.debug("Found Bread EVM address", evm);
    }
    if (svm) {
      console.debug("Found Bread Solana address", svm);
    }
  }, []);

  const selectedWallet = wallets.find((w) => w.symbol === selectedCurrency);
  const amountValue = parseFloat(amount) || 0;
  const insufficientBalance = amountValue > (selectedWallet?.balance || 0);

  const handleAICustomSuggestion = (s: any) => {
    // apply suggestion
    if (s.currency) setSelectedCurrency(s.currency as Asset);
    if (s.chain && s.chain === "starknet" && s.currency) {
      // prioritize starknet
      setSelectedCurrency(s.currency as Asset);
    }
  };

  const handleIntentParsed = (parsed: any) => {
    if (!parsed) return;
    if (parsed.amount) setAmount(String(parsed.amount));
    if (parsed.recipient) {
      // If recipient is a username (no 0x), set as platform recipient
      if (!/^0x[a-fA-F0-9]{40}$/.test(parsed.recipient)) {
        setRecipientType("platform");
        setRecipientEmail(parsed.recipient);
      } else {
        setRecipientType("external");
        setRecipientAddress(parsed.recipient);
      }
    }
    if (parsed.currency) setSelectedCurrency(parsed.currency as Asset);
  };

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  };

  const validateAddress = (address: string): boolean => {
    // Basic EVM address validation
    if (selectedCurrency.includes("solana")) {
      // Solana address validation (32-44 characters)
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    } else {
      // EVM address validation (0x + 40 hex characters)
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
  };

  const resolvePlatformName = (name: string) => {
    try {
      const raw = localStorage.getItem("payportz_accounts") || "{}";
      const accounts = JSON.parse(raw);
      const account = accounts[name];
      if (!account) return null;
      // Prefer Bread EVM for EVM-based currencies; for starknet, prefer starknetAddress
      return {
        evm: account.breadEvm || null,
        svm: account.breadSvm || null,
        starknet: account.starknetAddress || null,
      };
    } catch (err) {
      return null;
    }
  };

  const handleSend = () => {
    if (recipientType === "external") {
      if (!recipientAddress) {
        showToast("Please enter recipient address", "error");
        return;
      }
      if (!validateAddress(recipientAddress)) {
        showToast("Invalid recipient address format", "error");
        return;
      }
      if (!amount || amountValue <= 0) {
        showToast("Please enter a valid amount", "error");
        return;
      }
      if (insufficientBalance) {
        showToast("Insufficient balance", "error");
        return;
      }
      if (!walletId) {
        showToast("Wallet not found. Please reconnect your wallet.", "error");
        return;
      }

      // If multisig enabled, create a multisig proposal instead of immediate send
      if (multisigEnabled) {
        createMultisigProposal();
        return;
      }

      // Show confirmation modal
      setShowConfirmModal(true);
    } else {
      // Platform transfer: resolve username to on-chain address depending on selectedCurrency
      if (!recipientEmail) {
        showToast("Please enter recipient username/email", "error");
        return;
      }

      const resolved = resolvePlatformName(recipientEmail.trim());
      if (!resolved) {
        showToast("Platform user not found", "error");
        return;
      }

      // pick appropriate address for currency
      let resolvedAddress = "";
      if (selectedCurrency.startsWith("starknet")) {
        resolvedAddress = resolved.starknet || "";
      } else if (selectedCurrency.includes("solana")) {
        resolvedAddress = resolved.svm || "";
      } else {
        resolvedAddress = resolved.evm || "";
      }

      if (!resolvedAddress) {
        showToast("Recipient does not have an address for this chain", "error");
        return;
      }

      setRecipientAddress(resolvedAddress);
      if (multisigEnabled) {
        createMultisigProposal();
        return;
      }
      setShowConfirmModal(true);
    }
  };

  const executeTransfer = async () => {
    setIsTransferring(true);
    try {
      // If sending via Starknet, we don't yet have a relayer transfer endpoint in Bread
      // so we'll mock a transfer for testing. For EVM/Solana, use Bread API.
      let result: any = null;
      if (selectedCurrency.startsWith("starknet")) {
        // Mock transfer: simulate delay and success
        await new Promise((res) => setTimeout(res, 1000));
        result = { hash: "0xmockstarknettxhash", link: "#" };
        showToast(
          "Starknet payment simulated (mock) — replace with real relayer later"
        );
      } else {
        result = await breadApi.transfer(
          walletId,
          amountValue === -1 ? -1 : amountValue, // -1 for max amount
          recipientAddress,
          selectedCurrency as Asset
        );

        showToast("Payment sent successfully!");
      }

      // Reset form
      setAmount("");
      setRecipientAddress("");
      setReference("");
      setNote("");
      setShowConfirmModal(false);

      // Optionally redirect to transactions page
      setTimeout(() => {
        window.location.href = "/transactions";
      }, 2000);
    } catch (error: any) {
      console.error("Transfer failed:", error);
      showToast(error.message || "Transfer failed. Please try again.", "error");
    } finally {
      setIsTransferring(false);
    }
  };

  // Multisig helpers
  const persistProposals = (items: any[]) => {
    localStorage.setItem("payportz_multisigs", JSON.stringify(items));
    setMultisigProposals(items);
  };

  const createMultisigProposal = () => {
    // parse signers input
    const signers = signersInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (signers.length < 2) {
      showToast(
        "Enter at least two signer addresses/usernames for multisig",
        "error"
      );
      return;
    }
    if (multisigThreshold <= 0 || multisigThreshold > signers.length) {
      showToast("Invalid threshold", "error");
      return;
    }
    // proposal id
    const id = `ms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const payload = {
      id,
      creator:
        localStorage.getItem("payportz_business_name") ||
        localStorage.getItem("payportz_user_id") ||
        "guest",
      chainCurrency: selectedCurrency,
      amount: amountValue,
      recipient:
        recipientType === "external" ? recipientAddress : recipientEmail,
      signers,
      threshold: multisigThreshold,
      approvals: [],
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const items = [payload, ...multisigProposals];
    persistProposals(items);
    showToast("Multisig proposal created");
  };

  // Demo escrow helpers
  const loadEscrows = async () => {
    try {
      const res = await fetch("/api/demo/escrow");
      const data = await res.json();
      if (data?.escrows) setEscrows(data.escrows || []);
    } catch (err) {
      console.error("Failed to load escrows", err);
    }
  };

  const createEscrow = async () => {
    if (!amount || amountValue <= 0) {
      showToast("Enter amount to create escrow", "error");
      return;
    }
    setCreatingEscrow(true);
    try {
      const res = await fetch("/api/demo/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountValue,
          recipient: recipientAddress || recipientEmail,
          currency: selectedCurrency,
          creator: getCurrentSignerId(),
        }),
      });
      const data = await res.json();
      if (data?.escrow) {
        setEscrows((s) => [data.escrow, ...s]);
        showToast("Escrow created");
      } else {
        showToast("Failed to create escrow", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to create escrow", "error");
    } finally {
      setCreatingEscrow(false);
    }
  };

  const updateEscrow = async (id: string, action: "fund" | "release") => {
    try {
      const res = await fetch("/api/demo/escrow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data?.escrow) {
        setEscrows((s) => s.map((e) => (e.id === id ? data.escrow : e)));
        showToast(`Escrow ${action}ed`);
      } else {
        showToast("Failed to update escrow", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update escrow", "error");
    }
  };

  const getCurrentSignerId = () => {
    // prefer evm address, then starknet, then username
    const evm = localStorage.getItem("payportz_bread_wallet_evm");
    const stark = localStorage.getItem("payportz_starknet_address");
    const user =
      localStorage.getItem("payportz_business_name") ||
      localStorage.getItem("payportz_user_id");
    return evm || stark || user || "guest";
  };

  const approveProposal = async (id: string) => {
    const items = [...multisigProposals];
    const idx = items.findIndex((p: any) => p.id === id);
    if (idx === -1) return;
    const p = items[idx];
    const signerId = getCurrentSignerId();
    // normalize: signers are strings, could be usernames or addresses
    if (
      !p.signers.includes(signerId) &&
      !p.signers.includes(signerId.toLowerCase())
    ) {
      showToast("You are not an authorized signer for this proposal", "error");
      return;
    }
    if (
      p.approvals.includes(signerId) ||
      p.approvals.includes(signerId.toLowerCase())
    ) {
      showToast("You already approved", "info");
      return;
    }
    p.approvals.push(signerId);
    // check threshold
    if (p.approvals.length >= p.threshold) {
      // execute
      p.status = "executing";
      persistProposals(items);
      try {
        // execute based on chain
        if ((p.chainCurrency as string).startsWith("starknet")) {
          // mock execution
          await new Promise((res) => setTimeout(res, 1000));
          p.status = "executed";
          p.executedAt = new Date().toISOString();
          p.tx = { hash: "0xmockstarknettx" };
          showToast("Multisig executed (mock Starknet)");
        } else {
          // call Bread API using current walletId
          await breadApi.transfer(
            walletId,
            p.amount,
            p.recipient,
            p.chainCurrency as Asset
          );
          p.status = "executed";
          p.executedAt = new Date().toISOString();
          p.tx = { hash: "bread_tx_mock_or_real" };
          showToast("Multisig executed via Bread");
        }
      } catch (err: any) {
        p.status = "failed";
        p.error = err?.message || String(err);
        showToast("Execution failed: " + p.error, "error");
      }
    }
    persistProposals(items);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Send Payment</h1>
            <p className="text-gray-600 mt-1">
              Pay suppliers with multi-chain stablecoins
            </p>
          </div>

          {/* Authentication Check */}
          {/* Consider either Clerk sign-in OR the app-local sign-in (business + bread wallet) */}
          {!(isSignedIn || isAppSignedIn) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <Warning size={24} className="text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    Sign in required
                  </p>
                  <p className="text-sm text-yellow-700">
                    Please sign in to send payments
                  </p>
                  <button
                    onClick={() => (window.location.href = "/sign-in")}
                    className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recipient Type Selection */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  1. Select Recipient Type
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setRecipientType("external")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      recipientType === "external"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Wallet size={24} className="mb-2 text-gray-700" />
                    <p className="font-semibold text-gray-900">
                      External Wallet
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Any EVM or Solana wallet
                    </p>
                  </button>

                  <button
                    onClick={() => setRecipientType("platform")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      recipientType === "platform"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Users size={24} className="mb-2 text-gray-700" />
                    <p className="font-semibold text-gray-900">Payportz User</p>
                    <p className="text-sm text-gray-600 mt-1">Instant & FREE</p>
                    {/* <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Coming Soon
                    </span> */}
                  </button>
                </div>
              </div>

              {/* Currency Selection */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  2. Select Currency & Chain
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.symbol}
                      onClick={() =>
                        setSelectedCurrency(wallet.symbol as Asset)
                      }
                      disabled={wallet.balance === 0}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedCurrency === wallet.symbol
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      } ${
                        wallet.balance === 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${wallet.color} flex items-center justify-center p-2`}
                        >
                          <Image
                            src={wallet.logo}
                            alt={wallet.name}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm text-gray-900">
                            {wallet.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {wallet.symbol === "base:cngn"
                              ? `₦${wallet.balance.toLocaleString()}`
                              : `${wallet.balance.toLocaleString()} ${wallet.symbol
                                  .split(":")[1]
                                  .toUpperCase()}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  3. Recipient Details
                </h2>

                {recipientType === "external" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wallet Address *
                      </label>
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder={
                          selectedCurrency.includes("solana")
                            ? "Solana address"
                            : "0x..."
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedCurrency.includes("solana")
                          ? "Enter valid Solana address (32-44 characters)"
                          : "Enter valid EVM address (0x + 40 hex characters)"}
                      </p>
                    </div>

                    {/* Recent Recipients */}
                    {recentRecipients.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Recent Recipients
                        </p>
                        <div className="space-y-2">
                          {recentRecipients.map((recipient, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                setRecipientAddress(recipient.address)
                              }
                              className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {recipient.label}
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono">
                                    {recipient.address.slice(0, 10)}...
                                    {recipient.address.slice(-8)}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {recipient.lastUsed}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email or Username
                    </label>
                    <input
                      type="text"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="supplier@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  4. Enter Amount
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">
                        {selectedCurrency === "base:cngn" ? "₦" : ""}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full ${
                          selectedCurrency === "base:cngn" ? "pl-10" : "pl-4"
                        } pr-20 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-2xl font-semibold`}
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        {selectedCurrency.split(":")[1].toUpperCase()}
                      </span>
                    </div>

                    {selectedWallet && (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">
                          Available:{" "}
                          {selectedCurrency === "base:cngn"
                            ? `₦${selectedWallet.balance.toLocaleString()}`
                            : `${selectedWallet.balance.toLocaleString()}`}{" "}
                          {selectedCurrency.split(":")[1].toUpperCase()}
                        </p>
                        <button
                          onClick={() =>
                            setAmount(selectedWallet.balance.toString())
                          }
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Max
                        </button>
                      </div>
                    )}

                    {insufficientBalance && amountValue > 0 && (
                      <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                        <Warning size={16} />
                        <span>Insufficient balance</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Details */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  5. Additional Details (Optional)
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice/Reference Number
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="INV-2024-001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note to Supplier
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Payment for January shipment..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSend}
                disabled={
                  !isSignedIn ||
                  !amount ||
                  (recipientType === "external"
                    ? !recipientAddress
                    : !recipientEmail) ||
                  insufficientBalance ||
                  !walletId
                }
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowUp size={20} />
                <span>Review & Send Payment</span>
              </button>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Transaction Summary */}
              {amount && amountValue > 0 && !insufficientBalance && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Transaction Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">
                        {amountValue}{" "}
                        {selectedCurrency.split(":")[1].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Network:</span>
                      <span className="font-medium capitalize">
                        {selectedCurrency.split(":")[0]}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Network Fee:</span>
                      <span className="font-medium text-green-600">
                        Gasless ✨
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Speed:</span>
                      <span className="font-medium">Instant</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">
                          Total:
                        </span>
                        <span className="font-bold text-gray-900">
                          {amountValue}{" "}
                          {selectedCurrency.split(":")[1].toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Why Send via Bread?
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle
                      size={16}
                      className="text-green-600 mt-0.5 flex-shrink-0"
                    />
                    <p className="text-gray-700">
                      Instant settlement (30 seconds)
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle
                      size={16}
                      className="text-green-600 mt-0.5 flex-shrink-0"
                    />
                    <p className="text-gray-700">Gasless transactions</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle
                      size={16}
                      className="text-green-600 mt-0.5 flex-shrink-0"
                    />
                    <p className="text-gray-700">
                      Multi-chain support (Base, Polygon, BSC, Solana)
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle
                      size={16}
                      className="text-green-600 mt-0.5 flex-shrink-0"
                    />
                    <p className="text-gray-700">
                      Full transaction record for taxes
                    </p>
                  </div>
                </div>
              </div>

              {/* Demo Escrows Panel */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Demo Escrows</h3>
                  <button
                    onClick={createEscrow}
                    disabled={creatingEscrow}
                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md"
                  >
                    {creatingEscrow ? "Creating..." : "Create"}
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  {escrows.length === 0 && (
                    <p className="text-gray-500">
                      No escrows yet. Create one to simulate funding and
                      release.
                    </p>
                  )}
                  {escrows.map((e: any) => (
                    <div
                      key={e.id}
                      className="p-3 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {e.currency || "starknet:usdc"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {e.amount} • {e.status}
                          </p>
                        </div>
                        <div className="space-x-2 text-right">
                          {e.status === "created" && (
                            <button
                              onClick={() => updateEscrow(e.id, "fund")}
                              className="text-xs px-2 py-1 bg-yellow-50 border border-yellow-200 rounded"
                            >
                              Fund
                            </button>
                          )}
                          {e.status === "funded" && (
                            <button
                              onClick={() => updateEscrow(e.id, "release")}
                              className="text-xs px-2 py-1 bg-green-50 border border-green-200 rounded"
                            >
                              Release
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">
                  🔒 Secure & Verified
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>All transactions are secured by blockchain technology.</p>
                  <p>
                    Your funds are protected with enterprise-grade encryption.
                  </p>
                  <p>Transaction receipts are generated automatically.</p>
                </div>
              </div>

              {/* Support Info */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-start space-x-2">
                  <Clock
                    size={16}
                    className="text-gray-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="text-xs text-gray-600">
                    <p className="font-medium text-gray-900 mb-1">Need help?</p>
                    <p>
                      Contact support if you have questions about sending
                      payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Confirm Payment
            </h2>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sending:</span>
                    <span className="font-semibold">
                      {amountValue}{" "}
                      {selectedCurrency.split(":")[1].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <span className="font-medium capitalize">
                      {selectedCurrency.split(":")[0]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-mono text-xs">
                      {recipientAddress.slice(0, 10)}...
                      {recipientAddress.slice(-8)}
                    </span>
                  </div>
                  {reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-medium">{reference}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ Please verify the recipient address carefully. Blockchain
                  transactions cannot be reversed.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isTransferring}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeTransfer}
                disabled={isTransferring}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isTransferring ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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

export default SendPayment;
