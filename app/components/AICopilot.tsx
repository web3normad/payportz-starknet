"use client";

import React, { useEffect, useState } from "react";

type Wallet = {
  symbol: string;
  balance: number;
  name: string;
};

type Suggestion = {
  chain: string;
  currency: string;
  feeUSD: number;
  estTimeSec: number;
  riskScore: number;
  reason: string;
};

export default function AICopilot({
  recipientAddress,
  amount,
  availableWallets,
  onSuggestion,
  enabled,
}: {
  recipientAddress: string;
  amount: string | number;
  availableWallets: Wallet[];
  onSuggestion?: (s: Suggestion) => void;
  enabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const timeout = setTimeout(() => {
      (async () => {
        if (!recipientAddress) return;
        setLoading(true);
        setError(null);
        try {
          const res = await fetch("/api/ai/analyze-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipientAddress,
              amount,
              availableWallets,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Analysis failed");
          setSuggestions(data.recommendations || []);
        } catch (e: any) {
          setError(e.message || "Analysis error");
          setSuggestions(null);
        } finally {
          setLoading(false);
        }
      })();
    }, 600);

    return () => clearTimeout(timeout);
  }, [recipientAddress, amount, enabled]);

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">AI Payment Copilot</h3>
        {enabled ? (
          <span className="text-xs text-gray-500">Powered by AI ✨</span>
        ) : (
          <span className="text-xs text-gray-400">AI off</span>
        )}
      </div>

      <div className="mt-3">
        {!enabled && (
          <p className="text-xs text-gray-500">
            Enable AI to get smart suggestions.
          </p>
        )}

        {enabled && loading && (
          <p className="text-sm text-gray-600">Analyzing…</p>
        )}

        {enabled && error && <p className="text-sm text-red-600">{error}</p>}

        {enabled && suggestions && suggestions.length > 0 && (
          <div className="mt-3 space-y-3">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="p-3 bg-white rounded-lg border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="font-semibold">
                        {s.chain.toUpperCase()}{" "}
                        {s.currency.split(":")[1].toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Risk: {s.riskScore}/100
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{s.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${s.feeUSD.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      ~{Math.round(s.estTimeSec)}s
                    </div>
                    <button
                      onClick={() => onSuggestion && onSuggestion(s)}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Use
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
