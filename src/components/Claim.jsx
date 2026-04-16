import { useEffect, useRef, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

import { useReclaimSOL } from '../hooks/useReclaimSOL'
import { ScanIcon, CoinsIcon, ShieldIcon, ZapIcon, CheckIcon, ArrowRightIcon, ExternalLinkIcon, SpinnerIcon, SolanaLogo, AlertIcon, WalletIcon } from './icons'

const fmt = (l) => (l/1_000_000_000).toFixed(4)
const short = (a) => a ? a.slice(0,4)+'...'+a.slice(-4) : ''

const FEATS = [
  {icon:<ScanIcon/>,title:'Deep Wallet Scan',desc:'Detects every dormant token account holding locked SOL rent.',b:'rgba(139,92,246,0.25)',bg:'rgba(139,92,246,0.15)',c:'#a78bfa',g:'rgba(139,92,246,0.10)'},
  {icon:<CoinsIcon/>,title:'Reclaim SOL Rent',desc:'Close unused accounts and recover locked lamports instantly.',b:'rgba(6,182,212,0.25)',bg:'rgba(6,182,212,0.15)',c:'#22d3ee',g:'rgba(6,182,212,0.10)'},
  {icon:<ShieldIcon/>,title:'Non-Custodial',desc:'All transactions signed in your wallet. We never hold your keys.',b:'rgba(16,185,129,0.25)',bg:'rgba(16,185,129,0.15)',c:'#34d399',g:'rgba(16,185,129,0.10)'},
  {icon:<ZapIcon/>,title:'3% Protocol Fee',desc:'Pay only when you reclaim. No upfront costs, no subscriptions.',b:'rgba(245,158,11,0.25)',bg:'rgba(245,158,11,0.15)',c:'#fbbf24',g:'rgba(245,158,11,0.10)'},
]

function FadeIn({children, delay=0}) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e])=>{ if(e.isIntersecting){setV(true);o.disconnect()} },{threshold:0.05})
    if(ref.current) o.observe(ref.current)
    return ()=>o.disconnect()
  },[])
  return <div ref={ref} style={{opacity:v?1:0,transform:v?'translateY(0)':'translateY(24px)',transition:`opacity 0.8s ease ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`}}>{children}</div>
}

export default function Claim() {
  const { publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const connected = !!publicKey
  const open = () => setVisible(true)
  const { status,closeableCount,totalLamports,feeLamports,netLamports,txSignature,errorMsg,scan,claim,reset } = useReclaimSOL()
  const scanning=status==='scanning',ready=status==='ready',empty=status==='empty',claiming=status==='claiming',done=status==='done',err=status==='error'

  return (
    <div style={{position:'relative',minHeight:'100vh',background:'#060610',overflow:'hidden',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 15% 50%,rgba(120,40,200,0.18) 0%,transparent 55%)'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 85% 15%,rgba(60,120,255,0.13) 0%,transparent 55%)'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',opacity:0.45,backgroundImage:'radial-gradient(1.5px 1.5px at 12% 22%,rgba(255,255,255,0.9) 0%,transparent 100%),radial-gradient(1px 1px at 70% 8%,rgba(255,255,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 82% 50%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 28% 80%,rgba(255,255,255,0.6) 0%,transparent 100%)'}}/>
      <div style={{position:'absolute',top:0,right:'-200px',width:'800px',height:'800px',borderRadius:'50%',background:'radial-gradient(circle,rgba(123,63,228,0.35) 0%,transparent 68%)',filter:'blur(60px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',right:'5%',top:'40%',width:'320px',height:'320px',borderRadius:'50%',background:'radial-gradient(circle,rgba(0,180,255,0.18) 0%,transparent 70%)',filter:'blur(35px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',left:'-100px',bottom:'5%',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle,rgba(0,200,140,0.10) 0%,transparent 70%)',filter:'blur(50px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',opacity:0.018,backgroundImage:'linear-gradient(rgba(140,100,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(140,100,255,1) 1px,transparent 1px)',backgroundSize:'80px 80px'}}/>

      {/* NAVBAR */}
      <nav style={{position:'relative',zIndex:20,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 40px',borderBottom:'1px solid rgba(255,255,255,0.055)'}}>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <img src="/logo.png" alt="Solint" style={{width:100,height:100,objectFit:'contain',filter:'drop-shadow(0 0 22px rgba(167,139,250,0.95))'}}/>
          <span style={{color:'#fff',fontWeight:700,fontSize:24,letterSpacing:'-0.03em'}}>sol<span style={{color:'#a78bfa'}}>int</span></span>
        </div>
        <div style={{display:'flex',gap:32}}>
          {['How it works','Security','Docs'].map(i=>(
            <a key={i} href="#" style={{color:'rgba(255,255,255,0.45)',fontSize:14,textDecoration:'none',transition:'color 0.2s'}} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.45)'}>{i}</a>
          ))}
        </div>
        {!connected
          ? <button onClick={open} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:14,background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.4)',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all 0.2s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,0.28)';e.currentTarget.style.borderColor='rgba(167,139,250,0.65)'}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(124,58,237,0.15)';e.currentTarget.style.borderColor='rgba(124,58,237,0.4)'}}>
              <SolanaLogo size={18}/> Connect Wallet
            </button>
          : <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:12,background:'rgba(124,58,237,0.12)',border:'1px solid rgba(124,58,237,0.28)'}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:'#34d399',display:'block'}}/>
                <span style={{color:'#c4b5fd',fontSize:13,fontFamily:'DM Mono,monospace'}}>{short(publicKey.toBase58())}</span>
              </div>
              <button onClick={()=>{disconnect();reset()}} style={{padding:'8px 14px',borderRadius:12,background:'transparent',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.4)',fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.75)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>Disconnect</button>
            </div>
        }
      </nav>

      {/* MAIN */}
      <main style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',padding:'64px 24px 80px'}}>
        <FadeIn>
          <div style={{display:'flex',justifyContent:'center',marginBottom:28}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 18px',borderRadius:999,border:'1px solid rgba(167,139,250,0.32)',background:'rgba(167,139,250,0.10)'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#34d399',display:'block',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:11,color:'#c4b5fd',fontWeight:600,letterSpacing:'0.13em',textTransform:'uppercase'}}>Solana Mainnet — Live</span>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 style={{textAlign:'center',fontWeight:800,lineHeight:1.06,letterSpacing:'-0.035em',marginBottom:18}}>
            <span style={{display:'block',fontSize:'clamp(48px,7vw,76px)',color:'#fff'}}>Reclaim Your</span>
            <span style={{display:'block',fontSize:'clamp(48px,7vw,76px)',background:'linear-gradient(135deg,#a78bfa 0%,#818cf8 45%,#38bdf8 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Locked SOL</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p style={{textAlign:'center',color:'rgba(255,255,255,0.45)',fontSize:18,maxWidth:500,lineHeight:1.75,marginBottom:48}}>Scan your wallet, close empty token accounts, and recover the SOL rent that's been sitting idle — in seconds.</p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div style={{display:'flex',alignItems:'center',gap:52,marginBottom:52}}>
            {[{v:'1.2M+',l:'Accounts Closed'},{v:'8,400',l:'SOL Reclaimed'},{v:'< 2s',l:'Scan Time'}].map((s,i)=>(
              <div key={i} style={{textAlign:'center'}}>
                <p style={{fontSize:26,fontWeight:800,background:'linear-gradient(135deg,#c4b5fd,#93c5fd)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',margin:0}}>{s.v}</p>
                <p style={{fontSize:11,color:'rgba(255,255,255,0.30)',marginTop:3}}>{s.l}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* CARD */}
        <FadeIn delay={0.15}>
          <div style={{position:'relative',width:'100%',maxWidth:480,borderRadius:24,overflow:'hidden',background:'linear-gradient(145deg,rgba(255,255,255,0.058) 0%,rgba(255,255,255,0.02) 100%)',border:'1px solid rgba(255,255,255,0.092)',backdropFilter:'blur(32px)',WebkitBackdropFilter:'blur(32px)',boxShadow:'0 0 0 1px rgba(123,63,228,0.16),0 40px 100px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.08)'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(167,139,250,0.65) 50%,transparent)'}}/>
            <div style={{padding:'20px 24px 18px',borderBottom:'1px solid rgba(255,255,255,0.068)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <h2 style={{color:'#fff',fontWeight:600,fontSize:16,margin:0}}>Wallet Scanner</h2>
                <p style={{color:'rgba(255,255,255,0.35)',fontSize:12,margin:'3px 0 0'}}>{done?'Recovery complete ✓':'Connect wallet to begin'}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:999,background:err?'rgba(239,68,68,0.10)':'rgba(16,185,129,0.10)',border:`1px solid ${err?'rgba(239,68,68,0.25)':'rgba(16,185,129,0.22)'}`}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:err?'#f87171':'#34d399',display:'block'}}/>
                <span style={{fontSize:12,fontWeight:600,color:err?'#f87171':'#34d399'}}>{done?'Done':err?'Error':'Ready'}</span>
              </div>
            </div>
            <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:10}}>
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:16,background:'rgba(255,255,255,0.030)',border:'1px solid rgba(255,255,255,0.068)'}}>
                <div style={{width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,rgba(124,58,237,0.4),rgba(91,33,182,0.32))',border:'1px solid rgba(167,139,250,0.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#a78bfa'}}><WalletIcon size={16}/></div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{color:'rgba(255,255,255,0.30)',fontSize:11,margin:'0 0 2px'}}>{connected?'Connected wallet':'No wallet connected'}</p>
                  <p style={{color:'rgba(255,255,255,0.70)',fontSize:13,fontFamily:'DM Mono,monospace',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{connected?short(publicKey.toBase58()):'—'}</p>
                </div>
                {connected
                  ? <button onClick={()=>{disconnect();reset()}} style={{fontSize:12,color:'rgba(255,255,255,0.35)',border:'1px solid rgba(255,255,255,0.08)',padding:'5px 12px',borderRadius:8,background:'transparent',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.75)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>Change</button>
                  : <button onClick={open} style={{fontSize:12,color:'#a78bfa',border:'1px solid rgba(167,139,250,0.35)',padding:'5px 12px',borderRadius:8,background:'rgba(167,139,250,0.10)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.background='rgba(167,139,250,0.22)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(167,139,250,0.10)'}>Connect</button>
                }
              </div>

              {empty && <div style={{padding:'14px 16px',borderRadius:14,background:'rgba(255,255,255,0.022)',border:'1px solid rgba(255,255,255,0.06)',textAlign:'center'}}><p style={{color:'#34d399',fontSize:14,margin:0}}>✓ Wallet is already clean!</p></div>}

              {(ready||claiming||done) && <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {[{l:'Token accounts found',v:`${closeableCount}`,c:'#fff'},{l:'Closeable accounts',v:`${closeableCount}`,c:'#fbbf24'},{l:'Recoverable SOL',v:`${fmt(totalLamports)} SOL`,c:'#34d399'},{l:'Protocol fee (3%)',v:`${fmt(feeLamports)} SOL`,c:'rgba(255,255,255,0.40)'}].map(r=>(
                  <div key={r.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 16px',borderRadius:10,background:'rgba(255,255,255,0.022)'}}>
                    <span style={{color:'rgba(255,255,255,0.40)',fontSize:13}}>{r.l}</span>
                    <span style={{fontSize:13,fontWeight:500,fontFamily:'DM Mono,monospace',color:r.c}}>{r.v}</span>
                  </div>
                ))}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',borderRadius:14,background:'linear-gradient(135deg,rgba(16,185,129,0.13),rgba(6,182,212,0.08))',border:'1px solid rgba(16,185,129,0.24)'}}>
                  <span style={{color:'rgba(255,255,255,0.70)',fontSize:14,fontWeight:500}}>You receive</span>
                  <span style={{color:'#34d399',fontSize:16,fontWeight:800,fontFamily:'DM Mono,monospace'}}>≈ {fmt(netLamports)} SOL</span>
                </div>
              </div>}

              {done && <div style={{padding:'13px 16px',borderRadius:14,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.22)'}}>
                <p style={{color:'#34d399',fontSize:13,fontWeight:600,margin:'0 0 6px'}}>✓ Transaction confirmed</p>
                <a href={`https://solscan.io/tx/${txSignature}`} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'rgba(255,255,255,0.40)',textDecoration:'none'}} onMouseEnter={e=>e.currentTarget.style.color='#a78bfa'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.40)'}>View on Solscan <ExternalLinkIcon size={12}/></a>
              </div>}

              {err && <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'13px 16px',borderRadius:14,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.22)',color:'#fca5a5'}}><AlertIcon size={16}/><p style={{fontSize:12,lineHeight:1.6,margin:0}}>{errorMsg}</p></div>}

              {!done&&!empty&&<button
                onClick={!connected?open:(status==='idle'||err)?scan:ready?claim:undefined}
                disabled={scanning||claiming}
                style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'15px',borderRadius:16,fontWeight:700,fontSize:15,color:'#fff',cursor:scanning||claiming?'not-allowed':'pointer',border:'none',background:ready||claiming?'linear-gradient(135deg,#059669 0%,#0d9488 100%)':'linear-gradient(135deg,#7c3aed 0%,#6d28d9 50%,#4f46e5 100%)',boxShadow:scanning||claiming?'none':ready||claiming?'0 0 32px rgba(5,150,105,0.40),0 4px 24px rgba(0,0,0,0.35)':'0 0 36px rgba(124,58,237,0.45),0 4px 24px rgba(0,0,0,0.35)',opacity:scanning||claiming?0.65:1,transition:'all 0.25s',fontFamily:"'DM Sans',sans-serif"}}
                onMouseEnter={e=>{if(!scanning&&!claiming)e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
              >
                {scanning?<><SpinnerIcon size={17}/> Scanning…</>:claiming?<><SpinnerIcon size={17}/> Sending…</>:ready?<><CoinsIcon size={17}/> Reclaim {fmt(netLamports)} SOL <ArrowRightIcon size={15}/></>:!connected?<><SolanaLogo size={17}/> Connect Wallet</>:<><ScanIcon size={17}/> Scan My Wallet</>}
              </button>}

              {(done||empty)&&<button onClick={reset} style={{width:'100%',padding:'12px',borderRadius:14,fontSize:13,color:'rgba(255,255,255,0.45)',border:'1px solid rgba(255,255,255,0.08)',background:'transparent',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.75)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>Scan again</button>}

              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20,paddingTop:4}}>
                {['Non-custodial','Open source','Audited'].map(t=>(<div key={t} style={{display:'flex',alignItems:'center',gap:5,color:'rgba(255,255,255,0.28)',fontSize:11}}><CheckIcon size={12}/><span>{t}</span></div>))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* FEATURES */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,maxWidth:960,width:'100%',marginTop:64}}>
          {FEATS.map((f,i)=>(
            <FadeIn key={i} delay={0.5+i*0.08}>
              <div style={{borderRadius:20,padding:'22px 20px',background:'rgba(255,255,255,0.024)',border:`1px solid ${f.b}`,backdropFilter:'blur(16px)',cursor:'default',transition:'transform 0.3s,box-shadow 0.3s',height:'100%'}} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=`0 20px 40px ${f.g}`}} onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
                <div style={{width:44,height:44,borderRadius:14,background:f.bg,border:`1px solid ${f.b}`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,color:f.c}}>{f.icon}</div>
                <h3 style={{color:'#fff',fontWeight:600,fontSize:14,margin:'0 0 8px'}}>{f.title}</h3>
                <p style={{color:'rgba(255,255,255,0.38)',fontSize:12,lineHeight:1.65,margin:0}}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </main>

      <footer style={{position:'relative',zIndex:10,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',borderTop:'1px solid rgba(255,255,255,0.055)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <img src="/logo.png" alt="Solint" style={{width:52,height:52,objectFit:'contain',opacity:0.75,filter:'drop-shadow(0 0 8px rgba(167,139,250,0.5))'}}/>
          <span style={{color:'rgba(255,255,255,0.30)',fontSize:14,fontWeight:500}}>© 2025 Solint Protocol</span>
        </div>
        <div style={{display:'flex',gap:24}}>
          {['Privacy','Terms','GitHub'].map(i=>(<a key={i} href="#" style={{color:'rgba(255,255,255,0.28)',fontSize:13,textDecoration:'none'}} onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.70)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.28)'}>{i}</a>))}
        </div>
      </footer>
      <style>{'@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin 1s linear infinite} *{box-sizing:border-box}'}</style>
    </div>
  )
}
