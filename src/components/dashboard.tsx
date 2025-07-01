"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AccountInfo } from "@/components/account-info"
import { PasskeyManager } from "@/components/passkey-manager"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionHistory } from "@/components/transaction-history"
import { LogOut, Wallet, Loader2 } from "lucide-react"
import { PasskeyCredential, Transaction, User, XRPLAccount } from "@/types"
import { fetchAccount, fetchAccountTxns } from "@/lib/xrpl"
import useXrpl from "@/context/Xrpl/useXrpl"
import { AccountRoot } from "xrpl/dist/npm/models/ledger"

const API_BASE = process.env.API_HOST

interface DashboardProps {
  user: User
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const { xrpl } = useXrpl()
  const [account, setAccount] = useState<AccountRoot | null>(null)
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAccountData()
  }, [user])

  const fetchAccountData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch account info
      const accountData = await fetchAccount(xrpl, user.xrplAccount)
      setAccount(accountData)
      const passkeyListResponse = await fetch(`${API_BASE}/xrpl/passkeys/${user.xrplAccount}`, {
        credentials: "include",
      })
      if (passkeyListResponse.ok) {
        const passkeyListData = await passkeyListResponse.json()
        if (!passkeyListData.passkeyList) {
          throw new Error("No passkeys found for this account")
        }        
        setPasskeys(passkeyListData.passkeyList.Passkeys || [])
      }

      const transactionsResponse = await fetchAccountTxns(xrpl, user.xrplAccount)      
      setTransactions(transactionsResponse || [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertDescription className="text-red-700">Error: {error}</AlertDescription>
          </Alert>
          <Button onClick={onLogout} variant="outline" className="w-full bg-transparent">
            <LogOut className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your XRPL account with passkeys</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="shrink-0 bg-transparent">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* User Info */}
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-3">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Welcome back, {user.username}!</h2>
                <p className="text-blue-100 text-sm">
                  {user.xrplAccount ? `Account: ${user.xrplAccount}` : "Setting up your account..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Account Info */}
            {account && <AccountInfo account={account} />}

            {/* Passkey Manager */}
            <PasskeyManager user={user} passkeys={passkeys} onRefresh={fetchAccountData} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Transaction Form */}
            <TransactionForm user={user} passkeys={passkeys} onTransactionComplete={fetchAccountData} />

            {/* Transaction History */}
            <TransactionHistory account={user.xrplAccount} transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  )
}
