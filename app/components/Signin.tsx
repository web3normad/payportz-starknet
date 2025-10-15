"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Briefcase,
  User,
  Wallet,
  ArrowRight,
  CheckCircle,
  Shield,
  Globe,
  Lightning,
} from "@phosphor-icons/react";
import { breadApi } from "@/app/lib/breadApi";
import blackbg from "@/public/black-bg.jpg";
import starknet from "@/public/strk-logo.svg";
import eth from "@/public/ethereum-logo.svg";
import sol from "@/public/solana-logo.svg";

const logo = "/Payslab-logo.svg";

const Signin = () => {
  const [businessName, setBusinessName] = useState("");
  const [reloginName, setReloginName] = useState("");
  const [reloginToken, setReloginToken] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [creationStatus, setCreationStatus] = useState("");
  const [hasSavedAccounts, setHasSavedAccounts] = useState(false);
  const [lastSavedAccountName, setLastSavedAccountName] = useState<
    string | null
  >(null);

  // Helper to set localStorage and broadcast changes so other components update
  const setAndBroadcast = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      try {
        window.dispatchEvent(
          new StorageEvent("storage", { key, newValue: value })
        );
      } catch (e) {
        window.dispatchEvent(
          new CustomEvent("localstorage:update", { detail: { key, value } })
        );
      }
    } catch (e) {
      // ignore
    }
  };

  // current chain addresses for display
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [starknetAddress, setStarknetAddress] = useState<string | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [starknetPrivateKey, setStarknetPrivateKey] = useState<string | null>(
    null
  );

  // guest id used for bread reference when no auth system is present
  const guestId =
    typeof window !== "undefined"
      ? localStorage.getItem("payportz_user_id") || `guest`
      : "guest";

  useEffect(() => {
    const savedBusinessName = localStorage.getItem("payportz_business_name");
    const savedBreadWallet = localStorage.getItem("payportz_bread_wallet_id");

    if (savedBusinessName && savedBreadWallet) {
      handleSuccessfulLogin();
    } else if (savedBreadWallet) {
      setShowBusinessForm(true);
    }

    // discover saved accounts for quick-return
    try {
      const raw = localStorage.getItem("payportz_accounts") || "{}";
      const accounts = JSON.parse(raw || "{}");
      const names = Object.keys(accounts || {});
      if (names.length) {
        setHasSavedAccounts(true);
        setLastSavedAccountName(names[names.length - 1]);
      }
    } catch (e) {
      setHasSavedAccounts(false);
      setLastSavedAccountName(null);
    }
  }, []);

  useEffect(() => {
    try {
      setEvmAddress(localStorage.getItem("payportz_bread_wallet_evm"));
      setStarknetAddress(localStorage.getItem("payportz_starknet_address"));
      setStarknetPrivateKey(
        localStorage.getItem("payportz_starknet_private_key")
      );
      setSolanaAddress(
        localStorage.getItem("payportz_bread_wallet_svm") ||
          localStorage.getItem("payportz_bread_wallet_solana") ||
          null
      );
    } catch (_) {
      // ignore
    }
  }, [showBusinessForm]);

  // Listen for storage changes so the UI updates when keys are restored elsewhere
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === "payportz_bread_wallet_evm")
        setEvmAddress(localStorage.getItem("payportz_bread_wallet_evm"));
      if (e.key === "payportz_bread_wallet_svm")
        setSolanaAddress(
          localStorage.getItem("payportz_bread_wallet_svm") ||
            localStorage.getItem("payportz_bread_wallet_solana") ||
            null
        );
      if (e.key === "payportz_starknet_address")
        setStarknetAddress(localStorage.getItem("payportz_starknet_address"));
      if (e.key === "payportz_starknet_private_key")
        setStarknetPrivateKey(
          localStorage.getItem("payportz_starknet_private_key")
        );
    };

    const onLocalUpdate = (ev: any) => {
      const detail = ev?.detail;
      if (!detail) return;
      const { key } = detail;
      if (key === "payportz_bread_wallet_evm")
        setEvmAddress(localStorage.getItem("payportz_bread_wallet_evm"));
      if (key === "payportz_bread_wallet_svm")
        setSolanaAddress(
          localStorage.getItem("payportz_bread_wallet_svm") ||
            localStorage.getItem("payportz_bread_wallet_solana") ||
            null
        );
      if (key === "payportz_starknet_address")
        setStarknetAddress(localStorage.getItem("payportz_starknet_address"));
      if (key === "payportz_starknet_private_key")
        setStarknetPrivateKey(
          localStorage.getItem("payportz_starknet_private_key")
        );
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("localstorage:update", onLocalUpdate as any);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("localstorage:update", onLocalUpdate as any);
    };
  }, []);

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateToken = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleRelogin = () => {
    if (!reloginName || !reloginToken) {
      showToast("Please enter username and token to sign in", "error");
      return;
    }

    try {
      const raw = localStorage.getItem("payportz_accounts") || "{}";
      const accounts = JSON.parse(raw);
      const account = accounts[reloginName];
      if (!account) {
        showToast("Account not found", "error");
        return;
      }
      if (account.token !== reloginToken) {
        showToast("Invalid token", "error");
        return;
      }

      // restore local storage keys for signed-in user
      if (account.breadWalletId)
        localStorage.setItem("payportz_bread_wallet_id", account.breadWalletId);
      if (account.breadEvm)
        localStorage.setItem("payportz_bread_wallet_evm", account.breadEvm);
      if (account.breadSvm)
        localStorage.setItem("payportz_bread_wallet_svm", account.breadSvm);
      if (account.starknetAddress)
        localStorage.setItem(
          "payportz_starknet_address",
          account.starknetAddress
        );
      if (account.starknetPrivateKey)
        localStorage.setItem(
          "payportz_starknet_private_key",
          account.starknetPrivateKey
        );
      localStorage.setItem("payportz_business_name", reloginName);

      showToast("Signed in successfully");
      handleSuccessfulLogin();
    } catch (err) {
      console.error("relogin error", err);
      showToast("Failed to sign in", "error");
    }
  };

  const handleReturnToAccount = () => {
    try {
      const raw = localStorage.getItem("payportz_accounts") || "{}";
      const accounts = JSON.parse(raw || "{}");
      const last = lastSavedAccountName || Object.keys(accounts).pop();
      if (!last) {
        showToast("No saved account found", "error");
        return;
      }
      const account = accounts[last];
      if (!account) {
        showToast("Saved account data is invalid", "error");
        return;
      }

      // Helper to set localStorage and dispatch a storage event so other tabs/components update
      const setAndBroadcast = (key: string, value: string) => {
        localStorage.setItem(key, value);
        try {
          window.dispatchEvent(
            new StorageEvent("storage", { key, newValue: value })
          );
        } catch (e) {
          // some browsers restrict programmatic StorageEvent construction; fallback to custom event
          window.dispatchEvent(
            new CustomEvent("localstorage:update", { detail: { key, value } })
          );
        }
      };

      // Restore local storage keys for the saved account
      if (account.breadWalletId) {
        const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(
          account.breadWalletId || ""
        );
        if (!isValidObjectId) {
          showToast(
            "Saved Bread wallet id is invalid — cannot restore it",
            "error"
          );
        } else {
          setAndBroadcast("payportz_bread_wallet_id", account.breadWalletId);
        }
      }
      if (account.breadEvm)
        setAndBroadcast("payportz_bread_wallet_evm", account.breadEvm);
      if (account.breadSvm)
        setAndBroadcast("payportz_bread_wallet_svm", account.breadSvm);
      if (account.starknetAddress)
        setAndBroadcast("payportz_starknet_address", account.starknetAddress);
      if (account.starknetPrivateKey)
        setAndBroadcast(
          "payportz_starknet_private_key",
          account.starknetPrivateKey
        );

      setAndBroadcast("payportz_business_name", last);
      showToast("Welcome back — restoring your account", "success");
      handleSuccessfulLogin();
    } catch (err) {
      console.error("Return to account failed", err);
      showToast("Failed to restore account", "error");
    }
  };

  const createStarknetAccount = async () => {
    try {
      setCreationStatus("Creating Starknet account...");

      const resp = await fetch("/api/starknet/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Request only key/address generation; do not fund or deploy the account
        body: JSON.stringify({ deploy: false }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!data.ok && data.error) {
        console.warn("Starknet account creation issue:", data.error);
        showToast(data.error, "error");
        return null;
      }

      const addr = data?.accountAddress || data?.account_address || null;
      const privKey = data?.privateKey || data?.private_key || null;
      const pubKey = data?.publicKey || data?.public_key || null;
      const fundingTxHash =
        data?.fundingTxHash || data?.funding_tx_hash || null;
      const deployTxHash =
        data?.deploymentTxHash || data?.deployment_tx_hash || null;

      if (addr) {
        setAndBroadcast("payportz_starknet_address", addr);
        if (privKey) setAndBroadcast("payportz_starknet_private_key", privKey);
        if (pubKey) setAndBroadcast("payportz_starknet_public_key", pubKey);
        if (fundingTxHash)
          setAndBroadcast("payportz_starknet_funding_tx", fundingTxHash);
        if (deployTxHash)
          setAndBroadcast("payportz_starknet_deploy_tx", deployTxHash);

        setStarknetAddress(addr);
        setStarknetPrivateKey(privKey);

        showToast("Starknet account created successfully", "success");
        return { contractAddress: addr, privateKey: privKey };
      }

      const msg =
        data?.error || data?.message || "Failed to create Starknet account";
      console.warn("Starknet create-account returned no address", data);
      showToast(msg, "error");
      return null;
    } catch (err: any) {
      console.error("Starknet account creation failed", err);
      showToast(err?.message || "Failed to create Starknet account", "error");
      return null;
    }
  };

  const createBreadWallet = async () => {
    try {
      // Clear any previous wallet keys to avoid stale/invalid ids being used
      const keysToClear = [
        "payportz_bread_wallet_id",
        "payportz_bread_wallet_reference",
        "payportz_bread_wallet_evm",
        "payportz_bread_wallet_svm",
        "payportz_bread_wallet_solana",
        "payportz_starknet_address",
        "payportz_starknet_private_key",
        "payportz_starknet_public_key",
        "payportz_starknet_funding_tx",
        "payportz_starknet_deploy_tx",
      ];
      try {
        keysToClear.forEach((k) => localStorage.removeItem(k));
        // Notify other components that localStorage changed
        try {
          window.dispatchEvent(
            new CustomEvent("localstorage:update", {
              detail: { cleared: keysToClear },
            })
          );
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore
      }

      setIsCreatingWallet(true);
      setCreationStatus("Creating multi-chain wallets...");

      const reference = `user_${guestId}_${Date.now()}`;
      const breadWallet = await breadApi.createWallet(reference);

      // store bread wallet info (only if id present) and broadcast
      if (breadWallet?.id) {
        setAndBroadcast("payportz_bread_wallet_id", breadWallet.id);
      }
      if (breadWallet?.reference || reference) {
        setAndBroadcast(
          "payportz_bread_wallet_reference",
          breadWallet.reference || reference
        );
      }

      if (breadWallet.address?.evm) {
        setAndBroadcast("payportz_bread_wallet_evm", breadWallet.address.evm);
        setEvmAddress(breadWallet.address.evm);
      }

      if (breadWallet.address?.svm) {
        setAndBroadcast("payportz_bread_wallet_svm", breadWallet.address.svm);
        setSolanaAddress(breadWallet.address.svm);
      }

      // Broadcast the new keys so other components (Sidebar etc.) update immediately
      try {
        const updatedKeys: string[] = [];
        if (breadWallet?.id) updatedKeys.push("payportz_bread_wallet_id");
        if (breadWallet?.reference || reference)
          updatedKeys.push("payportz_bread_wallet_reference");
        if (breadWallet.address?.evm)
          updatedKeys.push("payportz_bread_wallet_evm");
        if (breadWallet.address?.svm)
          updatedKeys.push("payportz_bread_wallet_svm");

        // Attempt to dispatch a StorageEvent (may be restricted) then fallback to a custom event
        try {
          window.dispatchEvent(
            new StorageEvent("storage", { key: updatedKeys[0] || null })
          );
        } catch (e) {
          // fallback
        }

        try {
          window.dispatchEvent(
            new CustomEvent("localstorage:update", {
              detail: { keys: updatedKeys },
            })
          );
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore
      }

      showToast("Bread wallet created successfully");

      // Create Starknet account (non-blocking but awaited for better UX)
      setCreationStatus("Creating Starknet account...");
      await createStarknetAccount().catch((e) =>
        console.warn("starknet account creation error", e)
      );

      setShowBusinessForm(true);
      return breadWallet;
    } catch (err: any) {
      console.error("Bread wallet creation failed:", err);
      showToast(err?.message || "Failed to create Bread wallet", "error");
      throw err;
    } finally {
      setIsCreatingWallet(false);
      setCreationStatus("");
    }
  };

  const handleSuccessfulLogin = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      window.location.href =
        process.env.NEXT_PUBLIC_DASHBOARD_URL || "/dashboard";
    }, 800);
  };

  const handleBusinessNameSubmit = () => {
    if (!businessName.trim()) return;
    const username = businessName.trim();
    localStorage.setItem("payportz_business_name", username);

    // create a short recovery token and persist an account mapping
    const token = generateToken();
    try {
      const accountsRaw = localStorage.getItem("payportz_accounts") || "{}";
      const accounts = JSON.parse(accountsRaw);
      accounts[username] = accounts[username] || {};
      accounts[username].token = token;
      accounts[username].breadWalletId = localStorage.getItem(
        "payportz_bread_wallet_id"
      );
      accounts[username].breadEvm = localStorage.getItem(
        "payportz_bread_wallet_evm"
      );
      accounts[username].breadSvm = localStorage.getItem(
        "payportz_bread_wallet_svm"
      );
      accounts[username].starknetAddress = localStorage.getItem(
        "payportz_starknet_address"
      );
      accounts[username].starknetPrivateKey = localStorage.getItem(
        "payportz_starknet_private_key"
      );
      localStorage.setItem("payportz_accounts", JSON.stringify(accounts));

      showToast(`Account created. Recovery token: ${token}`, "success");
    } catch (err) {
      console.warn("failed to save account mapping", err);
    }

    handleSuccessfulLogin();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && showBusinessForm && businessName.trim()) {
      handleBusinessNameSubmit();
    }
  };

  const startWalletCreation = () => {
    createBreadWallet();
  };

  if (isCreatingWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-[#253529] mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Wallet size={24} className="text-[#253529]" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Creating Your Wallets
          </h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 font-medium">
              {creationStatus}
            </p>
          </div>
          <p className="text-gray-600">
            Setting up your multi-chain wallets across EVM, Solana, and
            Starknet...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            This will just take a moment
          </p>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 mx-auto w-24 h-24 flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle size={40} className="text-white" weight="fill" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Set!</h1>
          <p className="text-gray-600 text-lg">
            Taking you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (showBusinessForm) {
    const breadWalletEvm = localStorage.getItem("payportz_bread_wallet_evm");
    const breadWalletSvm = localStorage.getItem("payportz_bread_wallet_svm");

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#253529] to-[#1a2a1d] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Image
                  src={logo}
                  alt="PayPortz Logo"
                  width={36}
                  height={36}
                  className="filter brightness-0 invert"
                />
              </div>
              <h1 className="font-bold text-xl text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                PayPortz
              </h1>
              <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900">
                Complete Your Profile
              </h2>
              <p className="text-gray-600 text-sm">
                Please provide your business information to continue
              </p>

              <div className="mt-4 flex flex-col gap-3">
                {/* Starknet card */}
                <div className="w-full p-3 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center gap-3">
                  <Image src={starknet} alt="Starknet" width={25} height={25} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      Starknet
                    </p>
                    <p className="text-xs font-mono text-gray-900 truncate">
                      {starknetAddress
                        ? `${starknetAddress.slice(
                            0,
                            8
                          )}...${starknetAddress.slice(-6)}`
                        : "Not connected"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(starknetAddress || "")
                    }
                    disabled={!starknetAddress}
                    className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy
                  </button>
                </div>

                {/* EVM card */}
                <div className="w-full p-3 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center gap-3">
                  <Image src={eth} alt="EVM" width={24} height={24} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">EVM</p>
                    <p className="text-xs font-mono text-gray-900 truncate">
                      {breadWalletEvm
                        ? `${breadWalletEvm.slice(
                            0,
                            8
                          )}...${breadWalletEvm.slice(-6)}`
                        : "Not connected"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(breadWalletEvm || "")
                    }
                    disabled={!breadWalletEvm}
                    className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy
                  </button>
                </div>

                {/* Solana card */}
                <div className="w-full p-3 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center gap-3">
                  <Image src={sol} alt="Solana" width={24} height={24} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Solana</p>
                    <p className="text-xs font-mono text-gray-900 truncate">
                      {breadWalletSvm
                        ? `${breadWalletSvm.slice(
                            0,
                            8
                          )}...${breadWalletSvm.slice(-6)}`
                        : "Not connected"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(breadWalletSvm || "")
                    }
                    disabled={!breadWalletSvm}
                    className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="font-medium block mb-2 text-gray-700 text-sm"
                  htmlFor="businessName"
                >
                  Business/Company Name
                </label>
                <div className="relative">
                  <Briefcase
                    size={18}
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-gray-50 border border-gray-200 p-3 pl-10 pr-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#253529] focus:border-[#253529] transition-all shadow-sm text-sm"
                    placeholder="Your Company Ltd."
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={handleBusinessNameSubmit}
                disabled={!businessName.trim()}
                className="bg-gradient-to-r from-[#253529] to-[#1a2a1d] hover:from-[#1a2a1d] hover:to-[#253529] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium w-full p-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <span>Complete Setup</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-lg">
          <div className="p-4 lg:p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#253529] to-[#1a2a1d] rounded-xl flex items-center justify-center shadow-lg">
                  <Image
                    src={logo}
                    alt="PayPortz Logo"
                    width={28}
                    height={28}
                    className="filter brightness-0 invert"
                  />
                </div>
                <div>
                  <h1 className="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    PayPortz
                  </h1>
                  <p className="text-gray-600 text-xs mt-1">
                    Multi-chain payment infrastructure
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-[#253529] to-[#1a2a1d] bg-clip-text text-transparent">
                    PayPortz
                  </span>
                </h1>
                <p className="text-gray-600 text-base leading-relaxed">
                  Create multi-chain wallets and start accepting cross-border
                  payments in minutes. Powered by Bread and Starknet.
                </p>
              </div>
            </div>

            {hasSavedAccounts && (
              <div className="mb-4">
                <button
                  onClick={handleReturnToAccount}
                  className="w-full py-2 px-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow-md"
                >
                  Return to your account
                  {lastSavedAccountName ? ` — ${lastSavedAccountName}` : ""}
                </button>
              </div>
            )}

            {/* Main Action Card */}
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 mb-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Guest Session
                    </p>
                    <p className="text-xs text-gray-600">
                      Ready to create wallets
                    </p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              <button
                onClick={startWalletCreation}
                className="bg-gradient-to-r from-[#253529] to-[#1a2a1d] hover:from-[#1a2a1d] hover:to-[#253529] text-white font-medium w-full p-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3 group text-sm"
              >
                <Wallet
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>Create Multi-Chain Wallets</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* Returning User Section */}
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 mb-4">
              <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Shield size={16} className="text-[#253529]" />
                Returning user? Sign in
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input
                  type="text"
                  value={reloginName}
                  onChange={(e) => setReloginName(e.target.value)}
                  placeholder="Username"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-[#253529] focus:border-[#253529] transition-all"
                />
                <input
                  type="text"
                  value={reloginToken}
                  onChange={(e) => setReloginToken(e.target.value)}
                  placeholder="Recovery token"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-[#253529] focus:border-[#253529] transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRelogin}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-[#253529] to-[#1a2a1d] text-white rounded-lg text-sm font-medium hover:from-[#1a2a1d] hover:to-[#253529] transition-all shadow-md"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    try {
                      const raw =
                        localStorage.getItem("payportz_accounts") || "{}";
                      const accounts = JSON.parse(raw);
                      const last = Object.keys(accounts).pop();
                      if (last) {
                        setReloginName(last);
                        setReloginToken(accounts[last].token || "");
                        showToast("Autofilled last account", "info");
                      } else {
                        showToast("No saved accounts found", "error");
                      }
                    } catch (err) {
                      showToast("Failed to autofill", "error");
                    }
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 transition-all font-medium"
                >
                  Autofill
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Lost your token? Check{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  payportz_accounts
                </code>
              </p>
            </div>

            {/* Features Grid */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Lightning size={16} className="text-blue-600" />
                Why Choose PayPortz?
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-white/50">
                  <Globe size={14} className="text-blue-600" />
                  <span className="text-gray-700 font-medium">Multi-chain</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-white/50">
                  <Shield size={14} className="text-green-600" />
                  <span className="text-gray-700 font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-white/50">
                  <Lightning size={14} className="text-yellow-600" />
                  <span className="text-gray-700 font-medium">Instant</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-white/50">
                  <Wallet size={14} className="text-purple-600" />
                  <span className="text-gray-700 font-medium">Gasless</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Black Background with StarkNet */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <Image
          src={blackbg}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/60"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-8">
          <div className="w-full max-w-sm aspect-square bg-white/10 rounded-2xl flex flex-col items-center justify-center mb-8 backdrop-blur-sm border border-white/20 shadow-xl p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 p-4 backdrop-blur-sm border border-white/30">
                <Image
                  src={starknet}
                  alt="StarkNet Logo"
                  width={80}
                  height={80}
                />
              </div>
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                StarkNet Powered
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Built on StarkNet for scalable, secure transactions
              </p>
            </div>
          </div>

          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Enterprise Payment Infrastructure
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              The only payment solution you'll ever need
            </p>

            {/* Supported Chain Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="w-6 h-6 rounded flex items-center justify-center">
                <Image src={starknet} alt="StarkNet" width={14} height={14} />
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-xs">
                  Supported Chain
                </p>
                <p className="text-white/70 text-xs">StarkNet Mainnet</p>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-white/3 rounded-full blur-2xl"></div>
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
    </div>
  );
};

export default Signin;
