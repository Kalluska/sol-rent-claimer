import { useState, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction } from '@solana/spl-token'

const FEE_RECIPIENT = new PublicKey('AtMahEVEDY7aip4raA7o6Nk6dkGtGKCJWaaSUfzgqpNN')
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const FEE_RATE = 0.03
const MAX_CLOSES_PER_TX = 8

// Known LP program IDs (Raydium, Orca, Meteora etc.)
const LP_MINTS_KEYWORDS = ['LP', 'pool', 'whirl']
const KNOWN_LP_PROGRAMS = [
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium AMM
  'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK', // Raydium CLMM
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',  // Orca Whirlpool
  'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',  // Meteora DLMM
]

function categorize(account) {
  const info = account.data.parsed?.info
  const decimals = info?.tokenAmount?.decimals ?? 0
  const mint = info?.mint ?? ''

  // Check if it's an LP token by mint name hints or known programs
  if (
    LP_MINTS_KEYWORDS.some(k => mint.toLowerCase().includes(k.toLowerCase())) ||
    KNOWN_LP_PROGRAMS.includes(account.owner?.toString())
  ) {
    return 'lp'
  }

  // NFT = decimals 0, supply typically 1
  if (decimals === 0) return 'nft'

  return 'token'
}

function getProgramId(ownerStr) {
  if (ownerStr === TOKEN_2022_PROGRAM_ID.toBase58()) return TOKEN_2022_PROGRAM_ID
  return TOKEN_PROGRAM_ID
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

      const all = [
        ...res1.value.map(v => ({ ...v, ownerProgram: TOKEN_PROGRAM_ID.toBase58() })),
        ...res2.value.map(v => ({ ...v, ownerProgram: TOKEN_2022_PROGRAM_ID.toBase58() })),
      ]

      const closeable = all
        .filter(({ account }) => {
          const uiAmount = account.data.parsed?.info?.tokenAmount?.uiAmount
          const rawAmount = account.data.parsed?.info?.tokenAmount?.amount
          return (
            (uiAmount === 0 || uiAmount === null || Number(rawAmount) === 0) &&
            account.lamports > 0
          )
        })
        .map(({ pubkey, account, ownerProgram }) => ({
          pubkey,
          lamports: account.lamports,
          mint: account.data.parsed?.info?.mint ?? '',
          category: categorize(account),
          ownerProgram, // Store as string — safe, no .equals() issues
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

    // Split into batches
    const batches = []
    for (let i = 0; i < accountsToClose.length; i += MAX_CLOSES_PER_TX) {
      batches.push(accountsToClose.slice(i, i + MAX_CLOSES_PER_TX))
    }

    setProgress({ current: 0, total: batches.length })

    try {
      const sigs = []
      let totalClosedLamports = 0

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        const isLastBatch = i === batches.length - 1
        setProgress({ current: i + 1, total: batches.length })

        const tx = new Transaction()

        // Close accounts in this batch
        const batchLamports = batch.reduce((s, a) => s + a.lamports, 0)

        for (const acc of batch) {
          const programId = getProgramId(acc.ownerProgram)
          tx.add(createCloseAccountInstruction(
            acc.pubkey,
            publicKey,
            publicKey,
            [],
            programId
          ))
        }

        totalClosedLamports += batchLamports

        // Send accumulated fee only in the LAST batch
        // Fee is calculated from lamports actually closed so far
        if (isLastBatch) {
          const totalLamports = accountsToClose.reduce((s, a) => s + a.lamports, 0)
          const fee = Math.ceil(totalLamports * FEE_RATE)
          if (fee > 0) {
            tx.add(SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: FEE_RECIPIENT,
              lamports: fee,
            }))
          }
        }

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        tx.recentBlockhash = blockhash
        tx.feePayer = publicKey

        const sig = await sendTransaction(tx, connection)
        await connection.confirmTransaction(
          { signature: sig, blockhash, lastValidBlockHeight },
          'confirmed'
        )
        sigs.push(sig)
      }

      setTxSignatures(sigs)
      setStatus('done')
    } catch (err) {
      if (err.message?.includes('User rejected') || err.message?.includes('rejected')) {
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
  const feePercent = selectedLamports > 0
    ? ((feeLamports / selectedLamports) * 100).toFixed(1)
    : '0.0'
  const batchCount = Math.ceil(selectedAccounts.length / MAX_CLOSES_PER_TX)

  return {
    status, allAccounts, selected, setSelected,
    selectedAccounts, selectedLamports,
    feeLamports, netLamports, feePercent, batchCount,
    txSignatures, errorMsg, progress,
    scan,
    claim: () => claim(selectedAccounts),
    reset,
    closeableCount: allAccounts.length,
  }
}
