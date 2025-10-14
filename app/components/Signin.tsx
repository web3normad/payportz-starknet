"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Briefcase, User, Wallet } from "@phosphor-icons/react";
import { breadApi } from "@/app/lib/breadApi";

const logo = "/Payslab-logo.svg";

const Signin = () => {
  const [businessName, setBusinessName] = useState("");
  const [reloginName, setReloginName] = useState("");
  const [reloginToken, setReloginToken] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

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
    // run once
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
      localStorage.setItem("payportz_business_name", reloginName);

      showToast("Signed in successfully");
      handleSuccessfulLogin();
    } catch (err) {
      console.error("relogin error", err);
      showToast("Failed to sign in", "error");
    }
  };

  const createStarknetAccount = async () => {
    if (typeof window === "undefined") return null;

    try {
      // dynamic import of starknetkit (optional)
      // @ts-ignore
      const skitModule: any = await import("starknetkit").catch(() => null);
      if (!skitModule) {
        console.warn("starknetkit not installed; skipping Starknet flow");
        showToast(
          "StarknetKit not installed; install to enable Argent flow",
          "error"
        );
        return null;
      }

      const StarknetKit: any =
        skitModule?.default || skitModule?.StarknetKit || skitModule;

      let kit: any = null;
      if (typeof StarknetKit === "function") kit = new StarknetKit();
      else if (StarknetKit && typeof StarknetKit.connect === "function")
        kit = StarknetKit;
      else kit = StarknetKit;

      const res = await kit?.connect?.();
      if (!res) {
        showToast("Failed to connect to Starknet wallet", "error");
        return null;
      }

      const { wallet } = res;
      if (!wallet || typeof wallet.request !== "function") {
        showToast(
          "Connected wallet does not support deployment data request",
          "error"
        );
        return null;
      }

      const deploymentData = await wallet.request({
        type: "wallet_deploymentData",
      });
      if (!deploymentData) {
        showToast("No deployment data returned from wallet", "error");
        return null;
      }

      const respRaw = await fetch("/api/starknet/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deployPayload: deploymentData }),
      });

      const resp = await respRaw.json().catch(() => ({}));
      if (resp?.ok) {
        showToast("Starknet account deploy submitted", "success");
        const addr =
          deploymentData.contractAddress || resp.contractAddress || "";
        if (addr) localStorage.setItem("payportz_starknet_address", addr);
      } else {
        showToast(
          "Starknet deploy failed: " + (resp?.error || "unknown"),
          "error"
        );
      }

      return deploymentData;
    } catch (err: any) {
      console.error("createStarknetAccount error:", err);
      showToast(err?.message || "Starknet account creation failed", "error");
      return null;
    }
  };

  const createBreadWallet = async () => {
    try {
      setIsCreatingWallet(true);
      const reference = `user_${guestId}_${Date.now()}`;
      const breadWallet = await breadApi.createWallet(reference);

      // store bread wallet info
      localStorage.setItem("payportz_bread_wallet_id", breadWallet.id);
      localStorage.setItem(
        "payportz_bread_wallet_reference",
        breadWallet.reference || reference
      );
      if (breadWallet.address?.evm)
        localStorage.setItem(
          "payportz_bread_wallet_evm",
          breadWallet.address.evm
        );
      if (breadWallet.address?.svm)
        localStorage.setItem(
          "payportz_bread_wallet_svm",
          breadWallet.address.svm
        );

      showToast("Bread wallet created");
      setShowBusinessForm(true);

      // non-blocking attempt to create a Starknet account for the same user
      createStarknetAccount().catch((e) =>
        console.warn("starknet non-blocking error", e)
      );

      return breadWallet;
    } catch (err: any) {
      console.error("Bread wallet creation failed:", err);
      showToast(err?.message || "Failed to create Bread wallet", "error");
      throw err;
    } finally {
      setIsCreatingWallet(false);
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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-black mx-auto"></div>
          <p className="text-gray-900 mt-6 text-lg font-medium">
            Creating your multi-chain wallet with Bread...
          </p>
          <p className="text-gray-600 text-sm mt-2">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="bg-green-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Setup Complete!
          </h1>
          <p className="text-gray-600">Taking you to your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showBusinessForm) {
    const breadWalletEvm = localStorage.getItem("payportz_bread_wallet_evm");
    const breadWalletSvm = localStorage.getItem("payportz_bread_wallet_svm");

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <Image
                src={logo}
                alt="Logo"
                width={64}
                height={64}
                className="mx-auto mb-4"
              />
              <h1 className="font-bold text-xl text-gray-900">PayPortz</h1>
              <h2 className="text-2xl font-semibold mt-6 mb-2 text-gray-900">
                Complete Your Profile
              </h2>
              <p className="text-gray-600">
                Please provide your business information to continue
              </p>

              <div className="mt-4 space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">🔷 EVM Wallet</p>
                  <p className="text-xs font-mono text-gray-900 truncate">
                    {breadWalletEvm?.slice(0, 10)}...{breadWalletEvm?.slice(-8)}
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">🟢 Solana Wallet</p>
                  <p className="text-xs font-mono text-gray-900 truncate">
                    {breadWalletSvm?.slice(0, 10)}...{breadWalletSvm?.slice(-8)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="font-medium block mb-2 text-gray-700"
                  htmlFor="businessName"
                >
                  Business/Company Name
                </label>
                <div className="relative">
                  <Briefcase
                    size={20}
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-gray-100 p-3 pl-10 pr-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-black border-0"
                    placeholder="Your Company Ltd."
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={handleBusinessNameSubmit}
                disabled={!businessName.trim()}
                className="bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium w-full p-3 rounded-xl transition-colors"
              >
                Complete Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="w-full lg:w-1/2 max-w-md">
            <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-sm">
              <div className="mb-6">
                <Image src={logo} alt="PayPortz Logo" width={64} height={64} />
                <h1 className="font-bold text-base mt-2 text-gray-900">
                  PayPortz
                </h1>
              </div>

              <div className="mb-8">
                <h1 className="text-4xl font-medium text-gray-900 mb-3">
                  Welcome to PayPortz!
                </h1>
                <p className="text-gray-600 text-sm">
                  Sign in to create your multi-chain wallets and start accepting
                  cross-border payments.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Guest
                        </p>
                        <p className="text-xs text-gray-600">Not signed</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startWalletCreation}
                    className="bg-black hover:bg-gray-800 text-white font-medium w-full p-4 rounded-xl transition-colors flex items-center justify-center gap-3"
                  >
                    <Wallet size={20} />
                    <span>Create Multi-Chain Wallets</span>
                  </button>

                  {/* Returning user sign-in */}
                  <div className="mt-4 bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Returning user? Sign in
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={reloginName}
                        onChange={(e) => setReloginName(e.target.value)}
                        placeholder="Username"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={reloginToken}
                        onChange={(e) => setReloginToken(e.target.value)}
                        placeholder="Recovery token"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRelogin}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          // quick helper to autofill last account if one exists
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
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        Autofill
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      If you lost your token check localStorage key{" "}
                      <code>payportz_accounts</code> for the value.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700 text-center">
                      ✅ Ready to create EVM & Solana wallets
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Why PayPortz?
                  </h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <span>⚡</span>
                      <span>Multi-chain wallet creation (EVM + Solana)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>🔒</span>
                      <span>Secure authentication (optional)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>🌍</span>
                      <span>Instant cross-border payments</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>💰</span>
                      <span>No setup costs & gasless transactions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-full lg:w-1/2">
            <div className="bg-[#E8F5E3] rounded-3xl p-12 min-h-[600px] flex flex-col items-center justify-center">
              <div className="w-full max-w-md aspect-square bg-white/50 rounded-2xl flex items-center justify-center mb-8 relative overflow-hidden">
                <div className="text-center p-8">
                  <div className="mb-4">
                    <Image
                      src={logo}
                      alt="Illustration"
                      width={120}
                      height={120}
                      className="mx-auto opacity-30"
                    />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">
                    Multi-Chain Powered
                  </p>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Cross-border payments across all chains
                </h2>
                <p className="text-lg text-gray-700">Powered by Bread</p>
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p>• EVM wallets (Ethereum, Base, Polygon, BSC, etc.)</p>
                  <p>• Solana wallet</p>
                  <p>• Gasless transactions & instant global payments</p>
                  <p>• Enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default Signin;
