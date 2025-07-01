'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { Transaction } from '@/types'
import Link from 'next/link'

interface TransactionHistoryProps {
  account: string
  transactions: Transaction[]
}

const formatXRP = (drops: string) => {
  return (Number.parseInt(drops) / 1000000).toFixed(6) + ' XRP'
}

export function TransactionHistory({
  account,
  transactions,
}: TransactionHistoryProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5 text-purple-600" />
          <span>Transaction History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((tx, index) => (
              <Link
                key={index}
                href={`https://explorer.xrplf.org/wss:batch.nerdnest.xyz/tx/${tx.hash}`}
                target="_blank"
              >
                <div className="border rounded-lg p-4 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {tx.tx_json.Account === account ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      )}
                      <span className="font-medium text-sm">
                        {tx.tx_json.TransactionType}
                      </span>
                    </div>
                    <Badge
                      variant={tx.validated ? 'default' : 'secondary'}
                      className={
                        tx.validated
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {tx.validated ? 'Validated' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                    {tx.tx_json.Amount && (
                      <div>
                        <span className="font-medium">Amount:</span>{' '}
                        {formatXRP(tx.tx_json.Amount)}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Fee:</span>{' '}
                      {formatXRP(tx.tx_json.Fee)}
                    </div>
                    {tx.tx_json.Destination && (
                      <div className="sm:col-span-2">
                        <span className="font-medium">To:</span>{' '}
                        {tx.tx_json.Destination.substring(0, 20)}...
                      </div>
                    )}
                    {tx.hash && (
                      <div className="sm:col-span-2">
                        <span className="font-medium">Hash:</span>{' '}
                        {tx.hash.substring(0, 20)}...
                      </div>
                    )}
                    <div className="sm:col-span-2 flex items-center space-x-1 text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{tx.close_time_iso}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No transactions found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
