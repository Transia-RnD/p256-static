"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Loader2, UserPlus, Shield, Database } from "lucide-react"
import { startRegistration } from "@simplewebauthn/browser"
import { User } from "@/types"
import { Wallet } from "xrpl"
import useXrpl from "@/context/Xrpl/useXrpl"

const API_BASE = process.env.API_HOST

interface RegisterFormProps {
  onSuccess: (user: User) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { xrpl } = useXrpl()
  const [username, setUsername] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"webauthn" | "ledger">("webauthn")
  const [progress, setProgress] = useState(0)
  const [isError, setIsError] = useState(false)

  const handleRegister = async () => {
    if (!username.trim()) {
      setMessage("Please enter a username")
      setIsError(true)
      return
    }

    setLoading(true)
    setMessage("")
    setIsError(false)
    setProgress(0)

    try {
      setMessage("Creating passkey credential...")
      setProgress(25)

      // Get registration options from backend
      const options = await fetch(`${API_BASE}/webauthn/register/options`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      }).then((res) => res.json())

      setProgress(50)

      // Start registration with browser
      const attResp = await startRegistration(options)

      setProgress(75)
      setMessage("Verifying passkey...")

      // Send attestation response to backend for verification
      const verification = await fetch(`${API_BASE}/webauthn/register/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attResp),
      }).then((res) => res.json())

      if (verification.verified) {
        setStep("ledger")
        setMessage("Adding passkey to XRPL ledger...")
        setProgress(90)

        // Add passkey to XRPL ledger
        const addToLedger = await fetch(`${API_BASE}/xrpl/add-passkey`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, passkeyId: verification.passkeyId }),
        }).then((res) => res.json())

        if (addToLedger.success) {
          const response = await xrpl.fundWallet(new Wallet("", "", {
            masterAddress: addToLedger.account,
          }), {
            faucetHost: 'batch.faucet.nerdnest.xyz',
            faucetPath: '/accounts',
          })
          console.log(response);
          
          setProgress(100)
          setMessage("Registration complete! Welcome to XRPL Passkey.")
          setIsError(false)
          setTimeout(() => {
            onSuccess({ username, xrplAccount: addToLedger.account })
          }, 1500)
        } else {
          setMessage("Passkey created but failed to add to ledger: " + addToLedger.error)
          setIsError(true)
        }
      } else {
        setMessage("Passkey registration failed. Please try again.")
        setIsError(true)
      }
    } catch (error) {
      setMessage("Registration error: " + (error as Error).message)
      setIsError(true)
    } finally {
      if (!message.includes("complete")) {
        setLoading(false)
        setProgress(0)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRegister()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-username">Username</Label>
        <Input
          id="register-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Choose a username"
          className="h-11"
          disabled={loading}
        />
      </div>

      <Button
        onClick={handleRegister}
        disabled={loading || !username.trim()}
        className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {step === "webauthn" ? "Creating Passkey..." : "Adding to Ledger..."}
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Create Account
          </>
        )}
      </Button>

      {loading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className={`flex items-center space-x-1 ${step === "webauthn" ? "text-blue-600" : "text-gray-400"}`}>
              <Shield className="h-4 w-4" />
              <span>Passkey</span>
            </div>
            <div className={`flex items-center space-x-1 ${step === "ledger" ? "text-blue-600" : "text-gray-400"}`}>
              <Database className="h-4 w-4" />
              <span>Ledger</span>
            </div>
          </div>
        </div>
      )}

      {message && (
        <Alert className={isError ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <AlertDescription className={isError ? "text-red-700" : "text-green-700"}>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
