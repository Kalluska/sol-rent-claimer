import { useState, useEffect } from 'react'

export function useSolPrice() {
  const [price, setPrice] = useState(null)

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      .then(r => r.json())
      .then(d => setPrice(d?.solana?.usd ?? null))
      .catch(() => setPrice(null))
    // Refresh every 60 seconds
    const interval = setInterval(() => {
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        .then(r => r.json())
        .then(d => setPrice(d?.solana?.usd ?? null))
        .catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return price
}
