"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Key, Plus, Loader2, Shield } from "lucide-react"
import { startRegistration } from "@simplewebauthn/browser"
import { PasskeyCredential, User } from "@/types"

const API_BASE = process.env.API_HOST

interface PasskeyManagerProps {
  user: User
  passkeys: PasskeyCredential[]
  onRefresh: () => void
}

export function PasskeyManager({ user, passkeys, onRefresh }: PasskeyManagerProps) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleAddPasskey = async () => {
    setLoading(true)
    setMessage("")
    setIsError(false)

    try {
      setMessage("Creating new passkey credential...")

      // Get registration options for additional passkey
      const options = await fetch(`${API_BASE}/webauthn/register/options`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, xrplAccount: user.xrplAccount }),
      }).then((res) => res.json())

      // Start registration with browser
      const attResp = await startRegistration(options)

      // Send attestation response to backend for verification
      const verification = await fetch(`${API_BASE}/webauthn/register/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attResp),
      }).then((res) => res.json())

      if (verification.verified) {
        setMessage("Adding passkey to XRPL ledger...")

        // Add passkey to ledger
        const addToLedger = await fetch(`${API_BASE}/xrpl/add-passkey`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username, passkeyId: verification.passkeyId }),
        }).then((res) => res.json())

        if (addToLedger.success) {
          setMessage("Passkey added successfully!")
          setIsError(false)
          onRefresh()
        } else {
          setMessage("Failed to add passkey to ledger: " + addToLedger.error)
          setIsError(true)
        }
      } else {
        setMessage("Passkey creation failed.")
        setIsError(true)
      }
    } catch (error) {
      setMessage("Error adding passkey: " + (error as Error).message)
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-600" />
            <span>Passkeys</span>
          </div>
          <Badge variant="secondary">{passkeys.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {passkeys.length > 0 ? (
          <div className="space-y-3">
            {passkeys.map((passkey, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Passkey {index + 1}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Algorithm: {passkey.Algorithm}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>ID: {passkey.PasskeyID.substring(0, 20)}...</div>
                  <div>Sign Count: {passkey.SignCount}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No passkeys registered</p>
          </div>
        )}

        <Button onClick={handleAddPasskey} disabled={loading} variant="outline" className="w-full bg-transparent">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Passkey...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add New Passkey
            </>
          )}
        </Button>

        {message && (
          <Alert className={isError ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
            <AlertDescription className={isError ? "text-red-700" : "text-green-700"}>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
