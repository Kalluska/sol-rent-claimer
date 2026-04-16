import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useReclaimSOL } from '../hooks/useReclaimSOL'
import { useSolPrice } from '../hooks/useSolPrice'
import { SpinnerIcon, SolanaLogo, ExternalLinkIcon, ArrowRightIcon } from './icons'

const fmt = (l) => (l / 1_000_000_000).toFixed(4)
const fmtSOL = (l) => {
  const sol = l / 1_000_000_000
  if (sol >= 1) return sol.toFixed(3) + ' SOL'
  return sol.toFixed(4) + ' SOL'
}
const short = (a) => a ? a.slice(0,4)+'...'+a.slice(-4) : ''
const shortMint = (a) => a ? a.slice(0,6)+'...'+a.slice(-4) : ''

const TABS = ['CLEANUP','TOKENS','NFTS','LP']

export default function ClaimPage({ onBack }) {
  const { publicKey } = useWallet()
  const {
    status, allAccounts, selected, setSelected,
    selectedAccounts, selectedLamports, feeLamports, netLamports,
    feePercent, batchCount, txSignatures, errorMsg, progress,
    scan, claim, reset
  } = useReclaimSOL()
  const solPrice = useSolPrice()

  const [activeTab, setActiveTab] = useState('CLEANUP')
  const [search, setSearch] = useState('')

  const scanning = status==='scanning'
  const ready = status==='ready'
  const claiming = status==='claiming'
  const done = status==='done'
  const err = status==='error'

  useEffect(() => { if (publicKey) scan() }, [publicKey])

  const filtered = allAccounts.filter(a => {
    if (activeTab === 'TOKENS') return a.category === 'token'
    if (activeTab === 'NFTS') return a.category === 'nft'
    if (activeTab === 'LP') return a.category === 'lp'
    return true
  }).filter(a =>
    !search ||
    a.mint.toLowerCase().includes(search.toLowerCase()) ||
    a.pubkey.toBase58().toLowerCase().includes(search.toLowerCase())
  )

  const toggleAll = (select) => {
    if (select) setSelected(new Set(filtered.map(a => a.pubkey.toBase58())))
    else setSelected(prev => {
      const n = new Set(prev)
      filtered.forEach(a => n.delete(a.pubkey.toBase58()))
      return n
    })
  }

  const toggleOne = (key) => {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(key) ? n.delete(key) : n.add(key)
      return n
    })
  }

  return (
    <div style={{minHeight:'100vh',background:'#060610',fontFamily:"'DM Sans',sans-serif",color:'#fff'}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 15% 50%,rgba(120,40,200,0.15) 0%,transparent 55%)'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 85% 15%,rgba(60,120,255,0.10) 0%,transparent 55%)'}}/>
      <div style={{position:'absolute',top:0,right:'-200px',width:'700px',height:'700px',borderRadius:'50%',background:'radial-gradient(circle,rgba(123,63,228,0.25) 0%,transparent 68%)',filter:'blur(60px)',pointerEvents:'none'}}/>

      {/* NAV */}
      <nav style={{position:'relative',zIndex:20,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 40px',borderBottom:'1px solid rgba(255,255,255,0.055)'}}>
        <div style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer'}} onClick={onBack}>
          <img src="/logo.png" alt="Solint" style={{width:72,height:72,objectFit:'contain',filter:'drop-shadow(0 0 16px rgba(167,139,250,0.8))'}}/>
          <span style={{color:'#fff',fontWeight:700,fontSize:20,letterSpacing:'-0.03em'}}>sol<span style={{color:'#a78bfa'}}>int</span></span>
        </div>
        {publicKey && (
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:12,background:'rgba(124,58,237,0.12)',border:'1px solid rgba(124,58,237,0.28)'}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:'#34d399',display:'block'}}/>
            <span style={{color:'#c4b5fd',fontSize:13,fontFamily:'DM Mono,monospace'}}>{short(publicKey?.toBase58())}</span>
          </div>
        )}
      </nav>

      <div style={{position:'relative',zIndex:10,maxWidth:980,margin:'0 auto',padding:'36px 24px 80px'}}>
        <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:6,background:'transparent',border:'none',color:'rgba(255,255,255,0.40)',fontSize:14,cursor:'pointer',marginBottom:20,fontFamily:"'DM Sans',sans-serif",padding:0}}
          onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.80)'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.40)'}
        >← Back to home</button>

        <h1 style={{fontSize:30,fontWeight:800,letterSpacing:'-0.03em',marginBottom:4}}>Wallet Cleanup</h1>
        <p style={{color:'rgba(255,255,255,0.40)',fontSize:15,marginBottom:28}}>Select accounts to close and reclaim locked SOL rent.</p>

        {/* SCANNING */}
        {scanning && (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'80px 0',gap:16}}>
            <SpinnerIcon size={40}/>
            <p style={{color:'rgba(255,255,255,0.50)',fontSize:16}}>Scanning your wallet…</p>
          </div>
        )}

        {/* DONE */}
        {done && (
          <div style={{borderRadius:20,padding:'32px',background:'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.08))',border:'1px solid rgba(16,185,129,0.25)',textAlign:'center',marginBottom:32}}>
            <p style={{fontSize:48,margin:'0 0 8px'}}>🎉</p>
            <h2 style={{fontSize:22,fontWeight:700,color:'#34d399',margin:'0 0 8px'}}>SOL Reclaimed!</h2>
            <p style={{color:'rgba(255,255,255,0.50)',marginBottom:20}}>
              {txSignatures.length > 1 ? `Completed in ${txSignatures.length} transactions.` : 'Your transaction was confirmed on Solana mainnet.'}
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'center',marginBottom:20}}>
              {txSignatures.map((sig, i) => (
                <a key={sig} href={`https://solscan.io/tx/${sig}`} target="_blank" rel="noopener noreferrer"
                  style={{display:'inline-flex',alignItems:'center',gap:6,color:'#a78bfa',fontSize:14,textDecoration:'none'}}
                  onMouseEnter={e=>e.currentTarget.style.textDecoration='underline'}
                  onMouseLeave={e=>e.currentTarget.style.textDecoration='none'}
                >
                  {txSignatures.length > 1 ? `Transaction ${i+1}` : 'View on Solscan'} <ExternalLinkIcon size={14}/>
                </a>
              ))}
            </div>
            <button onClick={()=>{reset();scan()}} style={{padding:'12px 32px',borderRadius:14,background:'rgba(124,58,237,0.2)',border:'1px solid rgba(124,58,237,0.4)',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
              Scan Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {status==='empty' && (
          <div style={{borderRadius:20,padding:'48px',background:'rgba(255,255,255,0.022)',border:'1px solid rgba(255,255,255,0.06)',textAlign:'center'}}>
            <p style={{fontSize:40,margin:'0 0 12px'}}>✨</p>
            <h2 style={{fontSize:20,fontWeight:700,color:'#34d399',margin:'0 0 8px'}}>Wallet is already clean!</h2>
            <p style={{color:'rgba(255,255,255,0.40)'}}>No closeable accounts found.</p>
            <button onClick={onBack} style={{marginTop:20,padding:'10px 24px',borderRadius:12,background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.3)',color:'#fff',fontSize:14,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Go Back</button>
          </div>
        )}

        {/* ERROR */}
        {err && (
          <div style={{borderRadius:16,padding:'16px 20px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.22)',marginBottom:20}}>
            <p style={{color:'#fca5a5',fontSize:14,margin:0}}>{errorMsg}</p>
          </div>
        )}

        {/* MAIN CONTENT */}
        {(ready || claiming) && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:24,alignItems:'start'}}>

            {/* LEFT */}
            <div>
              {/* Tabs */}
              <div style={{display:'flex',gap:4,marginBottom:18,flexWrap:'wrap'}}>
                {TABS.map(tab => {
                  const count = tab==='CLEANUP' ? allAccounts.length
                    : tab==='TOKENS' ? allAccounts.filter(a=>a.category==='token').length
                    : tab==='NFTS' ? allAccounts.filter(a=>a.category==='nft').length
                    : allAccounts.filter(a=>a.category==='lp').length
                  const active = activeTab === tab
                  return (
                    <button key={tab} onClick={()=>setActiveTab(tab)}
                      style={{padding:'7px 18px',borderRadius:10,background:active?'rgba(124,58,237,0.25)':'rgba(255,255,255,0.05)',border:active?'1px solid rgba(124,58,237,0.5)':'1px solid rgba(255,255,255,0.08)',color:active?'#c4b5fd':'rgba(255,255,255,0.45)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.05em',transition:'all 0.15s'}}
                    >
                      {tab}{count > 0 && <span style={{marginLeft:5,padding:'1px 6px',borderRadius:999,background:active?'rgba(124,58,237,0.4)':'rgba(255,255,255,0.08)',fontSize:11}}>{count}</span>}
                    </button>
                  )
                })}
              </div>

              {/* Search */}
              <div style={{position:'relative',marginBottom:12}}>
                <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.28)',fontSize:15}}>⌕</span>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search by mint or account address..."
                  style={{width:'100%',padding:'11px 14px 11px 38px',borderRadius:12,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.10)',color:'#fff',fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:'none'}}
                  onFocus={e=>e.target.style.borderColor='rgba(124,58,237,0.5)'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.10)'}
                />
              </div>

              {/* Select/Deselect */}
              <div style={{display:'flex',gap:8,marginBottom:14}}>
                <button onClick={()=>toggleAll(true)}
                  style={{padding:'7px 16px',borderRadius:9,background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.35)',color:'#c4b5fd',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.06em',transition:'all 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(124,58,237,0.28)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(124,58,237,0.15)'}
                >SELECT ALL</button>
                <button onClick={()=>toggleAll(false)}
                  style={{padding:'7px 16px',borderRadius:9,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.45)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.06em',transition:'all 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.10)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                >DESELECT ALL</button>
              </div>

              {/* Account list */}
              {filtered.length === 0 && (
                <div style={{padding:'32px',textAlign:'center',color:'rgba(255,255,255,0.28)',fontSize:14}}>No accounts in this category</div>
              )}
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {filtered.map(acc => {
                  const key = acc.pubkey.toBase58()
                  const sel = selected.has(key)
                  const solVal = fmtSOL(acc.lamports)
                  const catColor = acc.category==='nft'?'#f59e0b':'#a78bfa'
                  const catLabel = acc.category==='nft'?'NFT':'TOKEN'
                  return (
                    <div key={key} onClick={()=>toggleOne(key)}
                      style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:14,background:sel?'rgba(124,58,237,0.10)':'rgba(255,255,255,0.028)',border:`1px solid ${sel?'rgba(124,58,237,0.38)':'rgba(255,255,255,0.065)'}`,cursor:'pointer',transition:'all 0.12s',userSelect:'none'}}
                      onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
                      onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background='rgba(255,255,255,0.028)' }}
                    >
                      <div style={{width:20,height:20,borderRadius:5,background:sel?'rgba(124,58,237,0.8)':'rgba(255,255,255,0.06)',border:`1.5px solid ${sel?'#7c3aed':'rgba(255,255,255,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.12s'}}>
                        {sel && <span style={{color:'#fff',fontSize:12,lineHeight:1}}>✓</span>}
                      </div>
                      <div style={{padding:'2px 8px',borderRadius:6,background:`${catColor}22`,border:`1px solid ${catColor}44`,color:catColor,fontSize:11,fontWeight:700,flexShrink:0}}>{catLabel}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{color:'rgba(255,255,255,0.65)',fontSize:12,fontFamily:'DM Mono,monospace',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{shortMint(acc.mint)}</p>
                        <p style={{color:'rgba(255,255,255,0.28)',fontSize:11,margin:'2px 0 0',fontFamily:'DM Mono,monospace'}}>{short(key)}</p>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <p style={{color:'#34d399',fontSize:13,fontWeight:600,fontFamily:'DM Mono,monospace',margin:0}}>{solVal}</p>
                        <p style={{color:'rgba(255,255,255,0.22)',fontSize:10,margin:'2px 0 0'}}>{acc.lamports.toLocaleString()} lamports</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* RIGHT: Summary */}
            <div style={{position:'sticky',top:24}}>
              <div style={{borderRadius:20,overflow:'hidden',background:'linear-gradient(145deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.018) 100%)',border:'1px solid rgba(255,255,255,0.088)',backdropFilter:'blur(28px)',boxShadow:'0 0 0 1px rgba(123,63,228,0.14),0 32px 80px rgba(0,0,0,0.6)'}}>
                <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(167,139,250,0.55) 50%,transparent)'}}/>

                <div style={{padding:'18px 22px',borderBottom:'1px solid rgba(255,255,255,0.065)'}}>
                  <h3 style={{color:'#fff',fontWeight:600,fontSize:15,margin:0}}>Summary</h3>
                  <p style={{color:'rgba(255,255,255,0.35)',fontSize:12,margin:'3px 0 0'}}>
                    {selectedAccounts.length} of {allAccounts.length} accounts selected
                    {batchCount > 1 && <span style={{color:'rgba(167,139,250,0.7)',marginLeft:4}}>· {batchCount} transactions</span>}
                  </p>
                </div>

                <div style={{padding:'18px 22px',display:'flex',flexDirection:'column',gap:8}}>

                  {/* Rows */}
                  {[
                    {l:'Selected accounts', v:`${selectedAccounts.length}`, c:'#fff'},
                    {l:'Total recoverable', v:fmtSOL(selectedLamports), c:'#fff'},
                  ].map(r => (
                    <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 14px',borderRadius:10,background:'rgba(255,255,255,0.022)'}}>
                      <span style={{color:'rgba(255,255,255,0.40)',fontSize:13}}>{r.l}</span>
                      <span style={{fontSize:13,fontWeight:500,fontFamily:'DM Mono,monospace',color:r.c}}>{r.v}</span>
                    </div>
                  ))}

                  {/* Fee row */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,0.022)',border:'1px solid rgba(255,255,255,0.065)'}}>
                    <span style={{color:'rgba(255,255,255,0.38)',fontSize:13}}>Protocol fee (3%)</span>
                    <span style={{fontSize:13,fontWeight:500,fontFamily:'DM Mono,monospace',color:'rgba(255,255,255,0.38)'}}>− {fmtSOL(feeLamports)}</span>
                  </div>

                  {/* Net */}
                  <div style={{padding:'16px 16px',borderRadius:14,background:'linear-gradient(135deg,rgba(16,185,129,0.14),rgba(6,182,212,0.09))',border:'1px solid rgba(16,185,129,0.26)',marginTop:2}}>
                    <p style={{color:'rgba(255,255,255,0.45)',fontSize:11,margin:'0 0 8px',letterSpacing:'0.08em',textTransform:'uppercase'}}>You receive</p>
                    <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap'}}>
                      <p style={{color:'#34d399',fontSize:28,fontWeight:800,fontFamily:'DM Mono,monospace',margin:0,lineHeight:1}}>{fmtSOL(netLamports)}</p>
                      <p style={{color:'rgba(52,211,153,0.65)',fontSize:15,fontWeight:600,margin:0,lineHeight:1}}>≈ ${solPrice ? (netLamports/1e9*solPrice).toFixed(2) : "..."} USD</p>
                    </div>
                  </div>

                  {/* Batch info */}
                  {batchCount > 1 && (
                    <div style={{padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)'}}>
                      <p style={{color:'rgba(255,255,255,0.35)',fontSize:12,margin:0,lineHeight:1.6}}>
                        ⚡ {selectedAccounts.length} accounts will be closed in <span style={{color:'#c4b5fd'}}>{batchCount} separate transactions</span> due to Solana's transaction size limit.
                      </p>
                    </div>
                  )}

                  {/* Claiming progress */}
                  {claiming && progress.total > 1 && (
                    <div style={{padding:'12px 14px',borderRadius:12,background:'rgba(124,58,237,0.12)',border:'1px solid rgba(124,58,237,0.25)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                        <span style={{color:'#c4b5fd',fontSize:13,fontWeight:500}}>Processing…</span>
                        <span style={{color:'rgba(196,181,253,0.6)',fontSize:13,fontFamily:'DM Mono,monospace'}}>{progress.current}/{progress.total}</span>
                      </div>
                      <div style={{height:4,borderRadius:99,background:'rgba(255,255,255,0.08)',overflow:'hidden'}}>
                        <div style={{height:'100%',borderRadius:99,background:'linear-gradient(90deg,#7c3aed,#a78bfa)',width:`${(progress.current/progress.total)*100}%`,transition:'width 0.4s ease'}}/>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={claim}
                    disabled={claiming || selectedAccounts.length === 0}
                    style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'15px',borderRadius:16,fontWeight:700,fontSize:15,color:'#fff',cursor:claiming||selectedAccounts.length===0?'not-allowed':'pointer',border:'none',background:'linear-gradient(135deg,#059669 0%,#0d9488 100%)',boxShadow:claiming?'none':'0 0 32px rgba(5,150,105,0.40),0 4px 24px rgba(0,0,0,0.35)',opacity:claiming||selectedAccounts.length===0?0.6:1,transition:'all 0.25s',fontFamily:"'DM Sans',sans-serif",marginTop:2}}
                    onMouseEnter={e=>{ if(!claiming&&selectedAccounts.length>0) e.currentTarget.style.transform='translateY(-2px)' }}
                    onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
                  >
                    {claiming
                      ? <><SpinnerIcon size={17}/> {progress.total > 1 ? `Signing ${progress.current}/${progress.total}…` : 'Sending…'}</>
                      : <>🧹 Clean Now — {fmtSOL(netLamports)} <ArrowRightIcon size={15}/></>
                    }
                  </button>

                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,paddingTop:4}}>
                    {['Non-custodial','Audited','Fee on success only'].map(t => (
                      <div key={t} style={{display:'flex',alignItems:'center',gap:4,color:'rgba(255,255,255,0.22)',fontSize:10}}>
                        <span>✓</span><span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin 1s linear infinite} *{box-sizing:border-box}'}</style>
    </div>
  )
}
