import { Client } from 'xrpl'
import { AccountRoot } from 'xrpl/dist/npm/models/ledger'

export const fetchAccount = async (
  client: Client,
  address: string,
  ledger_index?: number,
): Promise<AccountRoot> => {
  try {
    const response = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: ledger_index || 'current',
    })
    return response.result.account_data
  } catch (error: any) {
    console.info('Failed to get balance.', error)
    return {
      Account: address,
      Balance: "0",
      Sequence: 0,
      Flags: 0,
      OwnerCount: 0,
      LedgerEntryType: "AccountRoot",
      index: "0",
    } as AccountRoot
  }
}

export const fetchAccountTxns = async (
  client: Client,
  address: string,
): Promise<any[]> => {
  try {
    const response = await client.request({
      command: 'account_tx',
      account: address,
      limit: 100,
    })
    return response.result.transactions || []
  } catch (error: any) {
    console.info('Failed to get transactions.', error)
    return []
  }
} 