import { useNavigate } from 'react-router-dom'

export default function PageLayout({ children, title }) {
  const nav = useNavigate()
  return (
    <div style={{minHeight:'100vh',background:'#060610',fontFamily:"'DM Sans',sans-serif",color:'#fff'}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 15% 50%,rgba(120,40,200,0.12) 0%,transparent 55%)'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 85% 15%,rgba(60,120,255,0.08) 0%,transparent 55%)'}}/>
      <div style={{position:'absolute',top:0,right:'-200px',width:'600px',height:'600px',borderRadius:'50%',background:'radial-gradient(circle,rgba(123,63,228,0.20) 0%,transparent 68%)',filter:'blur(60px)',pointerEvents:'none'}}/>

      {/* NAV */}
      <nav style={{position:'relative',zIndex:20,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 40px',borderBottom:'1px solid rgba(255,255,255,0.055)'}}>
        <div style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}} onClick={()=>nav('/')}>
          <img src="/logo.png" alt="Solint" style={{width:52,height:52,objectFit:'contain',filter:'drop-shadow(0 0 12px rgba(167,139,250,0.7))'}}/>
          <span style={{color:'#fff',fontWeight:700,fontSize:20,letterSpacing:'-0.03em'}}>sol<span style={{color:'#a78bfa'}}>int</span></span>
        </div>
        <div style={{display:'flex',gap:28}}>
          {[['How it works','/how-it-works'],['Security','/security'],['Docs','/docs']].map(([l,h])=>(
            <a key={h} href={h} style={{color:'rgba(255,255,255,0.45)',fontSize:14,textDecoration:'none',transition:'color 0.2s'}} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.45)'}>{l}</a>
          ))}
        </div>
        <button onClick={()=>nav('/')} style={{padding:'9px 18px',borderRadius:12,background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.35)',color:'rgba(255,255,255,0.85)',fontSize:14,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(124,58,237,0.28)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(124,58,237,0.15)'}>
          Launch App →
        </button>
      </nav>

      {/* CONTENT */}
      <div style={{position:'relative',zIndex:10,maxWidth:760,margin:'0 auto',padding:'60px 24px 80px'}}>
        <button onClick={()=>nav(-1)} style={{display:'flex',alignItems:'center',gap:6,background:'transparent',border:'none',color:'rgba(255,255,255,0.40)',fontSize:14,cursor:'pointer',marginBottom:32,fontFamily:"'DM Sans',sans-serif",padding:0,transition:'color 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.80)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.40)'}>
          ← Back
        </button>
        {children}
      </div>

      {/* FOOTER */}
      <footer style={{position:'relative',zIndex:10,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',borderTop:'1px solid rgba(255,255,255,0.055)',marginTop:40}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <img src="/logo.png" alt="Solint" style={{width:28,height:28,objectFit:'contain',opacity:0.6}}/>
          <span style={{color:'rgba(255,255,255,0.25)',fontSize:13}}>© 2025 Solint Protocol</span>
        </div>
        <div style={{display:'flex',gap:20}}>
          {[['Privacy','/privacy'],['Terms','/terms'],['GitHub','https://github.com/Kalluska/sol-rent-claimer']].map(([l,h])=>(
            <a key={l} href={h} style={{color:'rgba(255,255,255,0.25)',fontSize:13,textDecoration:'none'}} onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.65)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.25)'}>{l}</a>
          ))}
        </div>
      </footer>
      <style>{'*{box-sizing:border-box}'}</style>
    </div>
  )
}
