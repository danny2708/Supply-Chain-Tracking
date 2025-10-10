import React from 'react';
export default function Dashboard() {
  return (
    <main style={{padding: 24, fontFamily: 'Arial'}}>
      <h2>Producer / Actor Dashboard</h2>
      <p>Connect wallet and interact with contract (example buttons below).</p>
      <div style={{marginTop:12}}>
        <button>Connect Wallet</button>
        <button style={{marginLeft:8}}>Create Product</button>
      </div>
    </main>
  );
}
