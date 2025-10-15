"use client";
import { useState } from "react";

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);

  const connect = async () => {
    if (window.ethereum) {
      try {
        const accs = await window.ethereum.request?.({ method: "eth_requestAccounts" });
        if (accs && accs.length > 0) setAccount(accs[0]);
      } catch (err) {
        console.error("Wallet connection error:", err);
      }
    } else {
      alert("Please install MetaMask to continue");
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={connect}>Connect Wallet</button>
      {account && <span style={{ marginLeft: 8 }}>{account}</span>}
    </div>
  );
}
