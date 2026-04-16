import { Buffer } from 'buffer'
window.Buffer = Buffer
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { clusterApiUrl } from '@solana/web3.js'
import App from './App'
import './index.css'
import '@solana/wallet-adapter-react-ui/styles.css'
const wallets = [new PhantomWalletAdapter()]
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={'https://mainnet.helius-rpc.com/?api-key=22806699-1497-433e-9566-082e42527e14'}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
)
