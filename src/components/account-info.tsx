"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, Hash } from "lucide-react"
import { AccountRoot } from "xrpl/dist/npm/models/ledger"

interface AccountInfoProps {
  account: AccountRoot
}

const formatXRP = (drops: string) => {
  return (Number.parseInt(drops) / 1000000).toFixed(6) + " XRP"
}

export function AccountInfo({ account }: AccountInfoProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-green-600" />
          <span>Account Balance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Balance</p>
            <p className="text-xl font-bold text-green-700">{formatXRP(account.Balance)}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Hash className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Sequence</p>
            <p className="text-xl font-bold text-blue-700">{account.Sequence}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Owner Count</span>
            <Badge variant="secondary">{account.OwnerCount}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Flags</span>
            <Badge variant="outline">{account.Flags}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
