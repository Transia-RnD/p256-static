"use client"

import { use, useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { Dashboard } from "@/components/dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Fingerprint } from "lucide-react"
import { User } from "@/types"

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  const handleAuthSuccess = (userData: User) => {
    // Store user data in local storage
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem("user")
    setUser(null)
  }

  useEffect(() => {
    // Check if user is already authenticated
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Shield className="h-12 w-12 text-blue-600" />
                <Fingerprint className="h-6 w-6 text-purple-600 absolute -bottom-1 -right-1" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">XRPL Passkey</h1>
            <p className="text-gray-600">Secure authentication with WebAuthn</p>
          </div>

          {/* Auth Forms */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Get Started</CardTitle>
              <CardDescription>Sign in to your account or create a new one</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="text-sm">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-sm">
                    Register
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <LoginForm onSuccess={handleAuthSuccess} />
                </TabsContent>
                <TabsContent value="register" className="space-y-4">
                  <RegisterForm onSuccess={handleAuthSuccess} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mt-8 grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-gray-900">Secure</h3>
              <p className="text-xs text-gray-600">WebAuthn protection</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <Fingerprint className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-gray-900">Passwordless</h3>
              <p className="text-xs text-gray-600">Biometric login</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
