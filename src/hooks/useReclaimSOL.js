import { useState, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction } from '@solana/spl-token'

const FEE_RECIPIENT = new PublicKey('AtMahEVEDY7aip4raA7o6Nk6dkGtCKCJWaaSUfzgqpNN')
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const FEE_RATE = 0.03
// Max ~8 close instructions per tx to stay under Solana's tx size limit
const MAX_CLOSES_PER_TX = 8

function categorize(account) {
  const info = account.data.parsed?.info
  const decimals = info?.tokenAmount?.decimals ?? 0
  if (decimals === 0) return 'nft'
  return 'token'
}

export function useReclaimSOL() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const [status, setStatus] = useState('idle')
  const [allAccounts, setAllAccounts] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [txSignatures, setTxSignatures] = useState([])
  const [errorMsg, setErrorMsg] = useState(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const scan = useCallback(async () => {
    if (!publicKey) return
    setStatus('scanning')
    setErrorMsg(null)
    try {
      const [res1, res2] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID }),
        connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_2022_PROGRAM_ID }),
      ])
      const all = [...res1.value, ...res2.value]
      const closeable = all
        .filter(({ account }) => {
          const uiAmount = account.data.parsed?.info?.tokenAmount?.uiAmount
          const rawAmount = account.data.parsed?.info?.tokenAmount?.amount
          return (uiAmount === 0 || uiAmount === null || Number(rawAmount) === 0) && account.lamports > 0
        })
        .map(({ pubkey, account }) => ({
          pubkey,
          lamports: account.lamports,
          mint: account.data.parsed?.info?.mint ?? '',
          category: categorize(account),
          owner: account.owner,
        }))

      setAllAccounts(closeable)
      setSelected(new Set(closeable.map(a => a.pubkey.toBase58())))
      setStatus(closeable.length === 0 ? 'empty' : 'ready')
    } catch (err) {
      setErrorMsg('Scan failed: ' + err.message)
      setStatus('error')
    }
  }, [publicKey, connection])

  const claim = useCallback(async (accountsToClose) => {
    if (!publicKey || !accountsToClose.length) return
    setStatus('claiming')
    setErrorMsg(null)
    setTxSignatures([])

    // Split into batches of MAX_CLOSES_PER_TX
    const batches = []
    for (let i = 0; i < accountsToClose.length; i += MAX_CLOSES_PER_TX) {
      batches.push(accountsToClose.slice(i, i + MAX_CLOSES_PER_TX))
    }

    const totalLamports = accountsToClose.reduce((s, a) => s + a.lamports, 0)
    const totalFee = Math.ceil(totalLamports * FEE_RATE)

    setProgress({ current: 0, total: batches.length })

    try {
      const sigs = []
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        setProgress({ current: i + 1, total: batches.length })

        const tx = new Transaction()

        // Close all accounts in this batch
        for (const acc of batch) {
          const programId = acc.owner?.equals?.(TOKEN_2022_PROGRAM_ID)
            ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
          tx.add(createCloseAccountInstruction(
            acc.pubkey, publicKey, publicKey, [], programId
          ))
        }

        // Send fee only in the LAST batch
        if (i === batches.length - 1 && totalFee > 0) {
          tx.add(SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: FEE_RECIPIENT,
            lamports: totalFee,
          }))
        }

        const { blockhash } = await connection.getLatestBlockhash()
        tx.recentBlockhash = blockhash
        tx.feePayer = publicKey

        const sig = await sendTransaction(tx, connection)
        await connection.confirmTransaction(sig, 'confirmed')
        sigs.push(sig)
      }

      setTxSignatures(sigs)
      setStatus('done')
    } catch (err) {
      if (err.message?.includes('User rejected')) {
        setStatus('ready')
      } else {
        setErrorMsg(err.message)
        setStatus('error')
      }
    }
  }, [publicKey, connection, sendTransaction])

  const reset = useCallback(() => {
    setStatus('idle')
    setAllAccounts([])
    setSelected(new Set())
    setTxSignatures([])
    setErrorMsg(null)
    setProgress({ current: 0, total: 0 })
  }, [])

  const selectedAccounts = allAccounts.filter(a => selected.has(a.pubkey.toBase58()))
  const selectedLamports = selectedAccounts.reduce((s, a) => s + a.lamports, 0)
  const feeLamports = Math.ceil(selectedLamports * FEE_RATE)
  const netLamports = selectedLamports - feeLamports
  const feePercent = selectedLamports > 0 ? ((feeLamports / selectedLamports) * 100).toFixed(1) : '0.0'
  const batchCount = Math.ceil(selectedAccounts.length / MAX_CLOSES_PER_TX)

  return {
    status, allAccounts, selected, setSelected,
    selectedAccounts, selectedLamports,
    feeLamports, netLamports, feePercent, batchCount,
    txSignatures, errorMsg, progress,
    scan, claim: () => claim(selectedAccounts), reset,
    closeableCount: allAccounts.length,
  }
}
