export interface User {
  username: string
  xrplAccount?: string
}

export interface XRPLAccount {
  account: string
  balance: string
  sequence: number
  ownerCount: number
  previousTxnID: string
  previousTxnLgrSeq: number
  flags: number
}

export interface PasskeyCredential {
  PasskeyID: string
  PublicKey: string
  SignCount: number
  Algorithm: number
}

export interface Transaction {
  hash?: string
  TransactionType: string
  Account: string
  Destination?: string
  Amount?: string
  Fee: string
  Sequence: number
  PasskeySignature?: {
    PasskeyID: string
    AuthenticatorData: string
    ClientDataJSON: string
    Signature: string
    Algorithm?: number
  }
  validated?: boolean
  ledger_index?: number
  date?: number
}
