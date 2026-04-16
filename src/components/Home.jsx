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

export default function Home({ onScan }) {
  const { publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const connected = !!publicKey
  const short = (a) => a ? a.slice(0,4)+'...'+a.slice(-4) : ''

  return (
    <div style={{position:'relative',minHeight:'100vh',background:'#060610',overflow:'hidden',fontFamily:"'DM Sans',sans-serif"}}>
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
        <div style={{display:'flex',gap:32}}>
          {NAV_LINKS.map(([label, href]) => (
            <a key={href} href={href} style={{color:'rgba(255,255,255,0.45)',fontSize:14,textDecoration:'none',transition:'color 0.2s'}}
              onMouseEnter={e => e.target.style.color='#fff'}
              onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.45)'}
            >{label}</a>
          ))}
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

        <div style={{display:'flex',alignItems:'center',gap:52,marginBottom:52}}>
          {[{v:'1.2M+',l:'Accounts Closed'},{v:'8,400',l:'SOL Reclaimed'},{v:'< 2s',l:'Scan Time'}].map((s,i) => (
            <div key={i} style={{textAlign:'center'}}>
              <p style={{fontSize:26,fontWeight:800,background:'linear-gradient(135deg,#c4b5fd,#93c5fd)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',margin:0}}>{s.v}</p>
              <p style={{fontSize:11,color:'rgba(255,255,255,0.30)',marginTop:3}}>{s.l}</p>
            </div>
          ))}
        </div>

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

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,maxWidth:960,width:'100%'}}>
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
      </main>

      <footer style={{position:'relative',zIndex:10,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',borderTop:'1px solid rgba(255,255,255,0.055)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <img src="/logo.png" alt="Solint" style={{width:36,height:36,objectFit:'contain',opacity:0.7}}/>
          <span style={{color:'rgba(255,255,255,0.30)',fontSize:13}}>© 2025 Solint Protocol</span>
        </div>
        <div style={{display:'flex',gap:24}}>
          {FOOTER_LINKS.map(([label, href]) => (
            <a key={label} href={href} style={{color:'rgba(255,255,255,0.28)',fontSize:13,textDecoration:'none',transition:'color 0.2s'}}
              onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.28)'}
            >{label}</a>
          ))}
        </div>
      </footer>

      <style>{'@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} *{box-sizing:border-box}'}</style>
    </div>
  )
}
