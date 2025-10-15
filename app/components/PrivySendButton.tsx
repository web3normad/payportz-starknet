"use client";

import React from "react";
import { useSendTransaction } from "@privy-io/react-auth";

export default function PrivySendButton({ to, value, children }: any) {
  const { sendTransaction } = useSendTransaction();

  const onClick = async () => {
    try {
      await sendTransaction({ to, value });
      alert("Transaction sent via Privy");
    } catch (err: any) {
      console.error("Privy send error", err);
      alert("Failed to send via Privy: " + (err?.message || err));
    }
  };

  return (
    <button
      onClick={onClick}
      className="px-3 py-2 bg-indigo-600 text-white rounded"
    >
      {children || "Send with Privy"}
    </button>
  );
}
