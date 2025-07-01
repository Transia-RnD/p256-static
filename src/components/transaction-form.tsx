"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Send, ChevronDown, ChevronUp, Loader2, Fingerprint } from "lucide-react"
import { PasskeyCredential, User } from "@/types"

const API_BASE = process.env.API_HOST

interface TransactionFormProps {
  user: User
  passkeys: PasskeyCredential[]
  onTransactionComplete: () => void
}

// Helper functions
const arrayBufferToBase64url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64urlToBuffer(hex: string): string {
  let b64 = Buffer.from(hex, "hex").toString("base64")
  b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  return b64
}

export function TransactionForm({ user, passkeys, onTransactionComplete }: TransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [destination, setDestination] = useState("")
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleSendTransaction = async () => {
    if (!destination.trim() || !amount.trim()) {
      setMessage("Please provide destination address and amount")
      setIsError(true)
      return
    }

    const amountInDrops = Math.floor(Number.parseFloat(amount) * 1000000).toString()
    setLoading(true)
    setMessage("")
    setIsError(false)

    try {
      setMessage("Preparing transaction...")

      // Get prepared transaction data from backend
      const prepareResponse = await fetch(`${API_BASE}/xrpl/prepare-transaction`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: user.xrplAccount,
          transactionType: "Payment",
          Destination: destination,
          Amount: amountInDrops,
        }),
      })

      if (!prepareResponse.ok) {
        throw new Error("Failed to prepare transaction")
      }

      const prepareData = await prepareResponse.json()
      setMessage("Sign transaction with your passkey...")

      // Create challenge buffer from transaction hash
      const challengeBytes = Buffer.from(prepareData.hash, "hex")

      // Convert passkey IDs to proper format for WebAuthn
      const allowCredentials = passkeys.map((pk) => {
        let credentialId: ArrayBuffer
        try {
          credentialId = Buffer.from(base64urlToBuffer(pk.PasskeyID), "base64").buffer
        } catch (e: any) {
          throw new Error(e)
        }

        return {
          id: credentialId,
          type: "public-key" as const,
          transports: ["internal", "hybrid"] as AuthenticatorTransport[],
        }
      })

      // Start WebAuthn authentication
      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: challengeBytes,
          timeout: 60000,
          rpId: process.env.RPID || "localhost",
          allowCredentials: allowCredentials,
          userVerification: "preferred",
        },
      })) as PublicKeyCredential

      if (!assertion || !assertion.response) {
        throw new Error("Failed to get assertion from authenticator")
      }

      const response = assertion.response as AuthenticatorAssertionResponse

      // Prepare the signed transaction
      const signedTransaction = {
        ...prepareData.transaction,
        PasskeySignature: {
          PasskeyID: Buffer.from(assertion.rawId).toString("hex").toUpperCase(),
          AuthenticatorData: Buffer.from(response.authenticatorData).toString("hex").toUpperCase(),
          ClientDataJSON: Buffer.from(response.clientDataJSON).toString("hex").toUpperCase(),
          Signature: Buffer.from(response.signature).toString("hex").toUpperCase(),
        },
      }

      setMessage("Submitting transaction...")

      // Submit the signed transaction
      const submitResponse = await fetch(`${API_BASE}/xrpl/submit-transaction`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction: signedTransaction,
          username: user.username,
        }),
      })

      const submitResult = await submitResponse.json()

      if (submitResult.success) {
        setMessage("Transaction submitted successfully!")
        setIsError(false)
        setDestination("")
        setAmount("")
        setIsOpen(false)
        setTimeout(() => {
          onTransactionComplete()
        }, 3000)
      } else {
        setMessage("Transaction failed: " + submitResult.error)
        setIsError(true)
      }
    } catch (error) {
      console.error("Transaction error:", error)
      setMessage("Transaction error: " + (error as Error).message)
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Send className="h-5 w-5 text-green-600" />
                <span>Send XRP</span>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination Address</Label>
              <Input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (XRP)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.000001"
                step="0.000001"
                min="0.000001"
                disabled={loading}
              />
            </div>

            <Button
              onClick={handleSendTransaction}
              disabled={loading || !destination.trim() || !amount.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Sign & Send Transaction
                </>
              )}
            </Button>

            {message && (
              <Alert className={isError ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                <AlertDescription className={isError ? "text-red-700" : "text-green-700"}>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
