import Link from 'next/link';
import Image from 'next/image';
export default function Home() {
  return (
    <main style={{padding: 24, fontFamily: 'Arial'}}>
      <header style={{display:'flex', alignItems:'center', gap:12}}>
        <Image src="/logo.svg" alt="logo" width={120} height={40} />
        <h1>SupplyChain DApp</h1>
      </header>
      <p>Welcome — use the dashboard to create and track products.</p>
      <ul>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/product/1">Product demo (id=1)</Link></li>
      </ul>
    </main>
  );
}
