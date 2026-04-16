import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { ScanIcon, SolanaLogo, CheckIcon, ShieldIcon, CoinsIcon, ZapIcon } from './icons'

const FEATS = [
  {icon:<ScanIcon/>,title:'Deep Wallet Scan',desc:'Detects every dormant token account holding locked SOL rent.',b:'rgba(139,92,246,0.25)',bg:'rgba(139,92,246,0.15)',c:'#a78bfa'},
  {icon:<CoinsIcon/>,title:'Reclaim SOL Rent',desc:'Close unused accounts and recover locked lamports instantly.',b:'rgba(6,182,212,0.25)',bg:'rgba(6,182,212,0.15)',c:'#22d3ee'},
  {icon:<ShieldIcon/>,title:'Non-Custodial',desc:'All transactions signed in your wallet. We never hold your keys.',b:'rgba(16,185,129,0.25)',bg:'rgba(16,185,129,0.15)',c:'#34d399'},
  {icon:<ZapIcon/>,title:'3% Protocol Fee',desc:'Pay only when you reclaim. No upfront costs, no subscriptions.',b:'rgba(245,158,11,0.25)',bg:'rgba(245,158,11,0.15)',c:'#fbbf24'},
]

const NAV_LINKS = [['How it works','/how-it-works'],['Security','/security'],['Docs','/docs']]
const FOOTER_LINKS = [['Privacy','/privacy'],['Terms','/terms'],['GitHub','https://github.com/Kalluska/sol-rent-claimer']]

const FAQ = [
  {
    q: 'Is Solint safe to use?',
    a: 'Yes. Solint is fully non-custodial — we never have access to your private keys or funds. Every transaction is signed directly in your own wallet (e.g. Phantom). You are in full control at all times.'
  },
  {
    q: 'What does the 3% fee cover?',
    a: 'A 3% protocol fee is taken only from the SOL you successfully reclaim. There are no upfront costs, no subscriptions, and no charges if nothing is found. If you reclaim 0 SOL, you pay nothing.'
  },
  {
    q: 'What happens to my tokens when I close an account?',
    a: 'Only empty token accounts — accounts with a zero token balance — are eligible for closing. Solint never touches accounts that still hold tokens or NFTs. Closing an empty account simply returns the rent deposit to your wallet.'
  },
  {
    q: 'How much SOL can I expect to recover?',
    a: 'Each empty token account holds approximately 0.002 SOL in rent. Active Solana users who have traded many tokens often have dozens of empty accounts, which can add up to 0.05–0.5+ SOL.'
  },
  {
    q: 'Which wallets are supported?',
    a: 'Solint supports all major Solana wallets including Phantom, Solflare, Backpack, and any wallet compatible with the Solana Wallet Adapter standard.'
  },
  {
    q: 'Why are multiple transactions sometimes required?',
    a: "Solana has a transaction size limit. If you have many accounts to close, Solint automatically batches them into multiple transactions. You'll be prompted to sign each one separately."
  },
]

function XIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div
      style={{borderRadius:16,border:'1px solid rgba(255,255,255,0.07)',background:'rgba(255,255,255,0.022)',overflow:'hidden',transition:'border-color 0.2s'}}
      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(124,58,237,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 22px',background:'transparent',border:'none',cursor:'pointer',textAlign:'left',gap:16,fontFamily:"'DM Sans',sans-serif"}}
      >
        <span style={{color:'#fff',fontSize:15,fontWeight:600}}>{q}</span>
        <span style={{color:'#a78bfa',fontSize:20,flexShrink:0,transition:'transform 0.2s',transform:open?'rotate(45deg)':'rotate(0deg)'}}>+</span>
      </button>
      {open && (
        <div style={{padding:'0 22px 18px'}}>
          <p style={{color:'rgba(255,255,255,0.50)',fontSize:14,lineHeight:1.75,margin:0}}>{a}</p>
        </div>
      )}
    </div>
  )
}

import React, { useState } from 'react'

export default function Home({ onScan }) {
  const { publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const connected = !!publicKey
  const short = (a) => a ? a.slice(0,4)+'...'+a.slice(-4) : ''
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{position:'relative',minHeight:'100vh',background:'#060610',overflow:'hidden',fontFamily:"'DM Sans',sans-serif"}}>
      {/* Background effects */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 15% 50%,rgba(120,40,200,0.18) 0%,transparent 55%)'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 85% 15%,rgba(60,120,255,0.13) 0%,transparent 55%)'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',opacity:0.45,backgroundImage:'radial-gradient(1.5px 1.5px at 12% 22%,rgba(255,255,255,0.9) 0%,transparent 100%),radial-gradient(1px 1px at 70% 8%,rgba(255,255,255,0.7) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 28% 80%,rgba(255,255,255,0.6) 0%,transparent 100%)'}}/>
      <div style={{position:'absolute',top:0,right:'-200px',width:'800px',height:'800px',borderRadius:'50%',background:'radial-gradient(circle,rgba(123,63,228,0.35) 0%,transparent 68%)',filter:'blur(60px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',right:'5%',top:'40%',width:'320px',height:'320px',borderRadius:'50%',background:'radial-gradient(circle,rgba(0,180,255,0.18) 0%,transparent 70%)',filter:'blur(35px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',opacity:0.018,backgroundImage:'linear-gradient(rgba(140,100,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(140,100,255,1) 1px,transparent 1px)',backgroundSize:'80px 80px'}}/>

      {/* NAV */}
      <nav style={{position:'relative',zIndex:20,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 40px',borderBottom:'1px solid rgba(255,255,255,0.055)'}}>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <img src="/logo.png" alt="Solint" style={{width:100,height:100,objectFit:'contain',filter:'drop-shadow(0 0 22px rgba(167,139,250,0.95))'}}/>
          <span style={{color:'#fff',fontWeight:700,fontSize:24,letterSpacing:'-0.03em'}}>sol<span style={{color:'#a78bfa'}}>int</span></span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:32}}>
          {NAV_LINKS.map(([label, href]) => (
            <a key={href} href={href} style={{color:'rgba(255,255,255,0.45)',fontSize:14,textDecoration:'none',transition:'color 0.2s'}}
              onMouseEnter={e => e.target.style.color='#fff'}
              onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.45)'}
            >{label}</a>
          ))}
          {/* X / Twitter link */}
          <a href="https://x.com/Solintlabs" target="_blank" rel="noopener noreferrer"
            style={{display:'flex',alignItems:'center',color:'rgba(255,255,255,0.45)',transition:'color 0.2s',textDecoration:'none'}}
            onMouseEnter={e => e.currentTarget.style.color='#fff'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.45)'}
            title="Follow @Solintlabs on X"
          >
            <XIcon size={16}/>
          </a>
        </div>
        {!connected
          ? <button onClick={() => setVisible(true)} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:14,background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.4)',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all 0.2s'}}
              onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.28)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(124,58,237,0.15)'}
            >
              <SolanaLogo size={18}/> Connect Wallet
            </button>
          : <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:12,background:'rgba(124,58,237,0.12)',border:'1px solid rgba(124,58,237,0.28)'}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:'#34d399',display:'block'}}/>
                <span style={{color:'#c4b5fd',fontSize:13,fontFamily:'DM Mono,monospace'}}>{short(publicKey.toBase58())}</span>
              </div>
              <button onClick={disconnect} style={{padding:'8px 14px',borderRadius:12,background:'transparent',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.4)',fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Disconnect</button>
            </div>
        }
      </nav>

      {/* HERO */}
      <main style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',padding:'64px 24px 80px'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 18px',borderRadius:999,border:'1px solid rgba(167,139,250,0.32)',background:'rgba(167,139,250,0.10)',marginBottom:28}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:'#34d399',display:'block',animation:'pulse 2s infinite'}}/>
          <span style={{fontSize:11,color:'#c4b5fd',fontWeight:600,letterSpacing:'0.13em',textTransform:'uppercase'}}>Solana Mainnet — Live</span>
        </div>

        <h1 style={{textAlign:'center',fontWeight:800,lineHeight:1.06,letterSpacing:'-0.035em',marginBottom:18}}>
          <span style={{display:'block',fontSize:'clamp(48px,7vw,76px)',color:'#fff'}}>Reclaim Your</span>
          <span style={{display:'block',fontSize:'clamp(48px,7vw,76px)',background:'linear-gradient(135deg,#a78bfa 0%,#818cf8 45%,#38bdf8 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Locked SOL</span>
        </h1>

        <p style={{textAlign:'center',color:'rgba(255,255,255,0.45)',fontSize:18,maxWidth:500,lineHeight:1.75,marginBottom:48}}>
          Scan your wallet, close empty token accounts, and recover the SOL rent that's been sitting idle — in seconds.
        </p>

        <button
          onClick={connected ? onScan : () => setVisible(true)}
          style={{display:'flex',alignItems:'center',gap:12,padding:'18px 48px',borderRadius:20,background:'linear-gradient(135deg,#7c3aed 0%,#6d28d9 50%,#4f46e5 100%)',border:'none',color:'#fff',fontSize:18,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 0 40px rgba(124,58,237,0.5),0 4px 24px rgba(0,0,0,0.4)',transition:'all 0.25s',marginBottom:16}}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 55px rgba(124,58,237,0.65),0 8px 32px rgba(0,0,0,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 0 40px rgba(124,58,237,0.5),0 4px 24px rgba(0,0,0,0.4)' }}
        >
          <ScanIcon size={22}/>
          {connected ? 'Scan My Wallet' : 'Connect & Scan'}
        </button>

        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:72}}>
          {['Non-custodial','Free to scan','3% on reclaim'].map(t => (
            <div key={t} style={{display:'flex',alignItems:'center',gap:5,color:'rgba(255,255,255,0.30)',fontSize:12}}>
              <CheckIcon size={12}/><span>{t}</span>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,maxWidth:960,width:'100%',marginBottom:96}}>
          {FEATS.map((f,i) => (
            <div key={i} style={{borderRadius:20,padding:'22px 20px',background:'rgba(255,255,255,0.024)',border:`1px solid ${f.b}`,backdropFilter:'blur(16px)',transition:'transform 0.3s'}}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
            >
              <div style={{width:44,height:44,borderRadius:14,background:f.bg,border:`1px solid ${f.b}`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,color:f.c}}>{f.icon}</div>
              <h3 style={{color:'#fff',fontWeight:600,fontSize:14,margin:'0 0 8px'}}>{f.title}</h3>
              <p style={{color:'rgba(255,255,255,0.38)',fontSize:12,lineHeight:1.65,margin:0}}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{maxWidth:720,width:'100%'}}>
          <h2 style={{textAlign:'center',fontSize:'clamp(28px,4vw,40px)',fontWeight:800,letterSpacing:'-0.03em',color:'#fff',marginBottom:8}}>
            Frequently Asked Questions
          </h2>
          <p style={{textAlign:'center',color:'rgba(255,255,255,0.35)',fontSize:15,marginBottom:40}}>
            Everything you need to know before connecting your wallet.
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {FAQ.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{position:'relative',zIndex:10,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',borderTop:'1px solid rgba(255,255,255,0.055)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <img src="/logo.png" alt="Solint" style={{width:36,height:36,objectFit:'contain',opacity:0.7}}/>
          <span style={{color:'rgba(255,255,255,0.30)',fontSize:13}}>© 2025 Solint Protocol</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:24}}>
          {FOOTER_LINKS.map(([label, href]) => (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
              style={{color:'rgba(255,255,255,0.28)',fontSize:13,textDecoration:'none',transition:'color 0.2s'}}
              onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.28)'}
            >{label}</a>
          ))}
          {/* X / Twitter */}
          <a href="https://x.com/Solintlabs" target="_blank" rel="noopener noreferrer"
            style={{display:'flex',alignItems:'center',gap:6,color:'rgba(255,255,255,0.28)',fontSize:13,textDecoration:'none',transition:'color 0.2s'}}
            onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.28)'}
          >
            <XIcon size={13}/> @Solintlabs
          </a>
        </div>
      </footer>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} *{box-sizing:border-box} @media(max-width:768px){.sol-desktop{display:none!important}}`}</style>
    </div>
  )
}
