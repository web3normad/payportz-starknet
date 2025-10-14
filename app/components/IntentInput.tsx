"use client";

import React, { useState } from "react";

export default function IntentInput({
  onParsed,
  enabled,
}: {
  onParsed: (p: any) => void;
  enabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!enabled) return;
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/parse-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to parse");
      onParsed(data.parsed || {});
    } catch (e: any) {
      setError(e.message || "Parse error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-200">
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your payment... (e.g., 'Send $2000 USDC to 0x...')"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
        />
        <button
          onClick={handleParse}
          disabled={!enabled || loading}
          className="px-3 py-2 bg-gray-900 text-white rounded-lg"
        >
          {loading ? "Parsing..." : "Parse"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
