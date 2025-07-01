// xrpl

import React, { ReactNode, useState, useEffect, createContext } from 'react'
import { Client } from 'xrpl'

export type XrplContextProps = {
  xrpl: Client | undefined
  error: string | undefined
  method: 'xrpl'
}

const initialState: XrplContextProps = {
  xrpl: undefined,
  error: undefined,
  method: 'xrpl',
}

const XrplContext = createContext(initialState)

type XrplProviderProps = {
  children: ReactNode
}

export function XrplProvider({ children }: XrplProviderProps) {
  const httpProvider = process.env.XRPL_WSS_ENDPOINT || "wss://batch.nerdnest.xyz"
  const [client, setClient] = useState<Client | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    const connectToNetwork = async () => {
      try {
        const xrpl = new Client(httpProvider)
        await xrpl.connect()
        setClient(xrpl)
      } catch(error: any) {
        console.log(error.message);
        setError(error.message)
      }
    }
    connectToNetwork()
  }, [httpProvider])

  if (!client) {
    return null
  }

  return (
    <XrplContext.Provider
      value={{
        method: 'xrpl',
        xrpl: client,
        error: error,
      }}
    >
      {children}
    </XrplContext.Provider>
  )
}

export const XrpConsumer = XrplContext.Consumer

export default XrplContext
