"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Fingerprint } from "lucide-react"
import { startAuthentication } from "@simplewebauthn/browser"
import { User } from "@/types"

const API_BASE = process.env.API_HOST

interface LoginFormProps {
  onSuccess: (user: User) => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleLogin = async () => {
    if (!username.trim()) {
      setMessage("Please enter your username")
      setIsError(true)
      return
    }

    setLoading(true)
    setMessage("")
    setIsError(false)

    try {
      // Get authentication options from backend
      const options = await fetch(`${API_BASE}/webauthn/authenticate/options`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      }).then((res) => res.json())

      // Start authentication with browser
      const assertionResp = await startAuthentication(options)

      // Send assertion response to backend for verification
      const verification = await fetch(`${API_BASE}/webauthn/authenticate/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertionResp),
      }).then((res) => res.json())

      if (verification.verified) {
        setMessage("Login successful!")
        setIsError(false)
        onSuccess({ username, xrplAccount: verification.xrplAccount })
      } else {
        setMessage("Authentication failed. Please try again.")
        setIsError(true)
      }
    } catch (error) {
      setMessage("Login error: " + (error as Error).message)
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your username"
          className="h-11"
          disabled={loading}
        />
      </div>

      <Button
        onClick={handleLogin}
        disabled={loading || !username.trim()}
        className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            <Fingerprint className="mr-2 h-4 w-4" />
            Sign In with Passkey
          </>
        )}
      </Button>

      {message && (
        <Alert className={isError ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <AlertDescription className={isError ? "text-red-700" : "text-green-700"}>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
