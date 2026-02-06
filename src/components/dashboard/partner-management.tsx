'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, UserPlus, Mail, CheckCircle, AlertCircle } from "lucide-react"

interface Partner {
  id: string
  name: string
  email: string
  businessRole?: string
}

export function PartnerManagement() {
  const { data: session } = useSession()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  useEffect(() => {
    if (session?.user?.partnerId) {
      // In a real app, you'd fetch partner details from API
      // For now, we'll show a placeholder
      setPartner({
        id: session.user.partnerId,
        name: "Partner Name",
        email: "partner@example.com",
        businessRole: "CEO"
      })
    }
  }, [session])

  const handleInvitePartner = async () => {
    if (!inviteEmail || !session?.user?.id) return

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/partner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: inviteEmail })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Invitation sent successfully!")
        setInviteEmail("")
        setIsInviteDialogOpen(false)
      } else {
        setMessage(data.error || "Failed to send invitation")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (partner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Partner Connected</span>
          </CardTitle>
          <CardDescription>
            You're partnered with {partner.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{partner.name}</p>
                <p className="text-sm text-gray-600">{partner.email}</p>
                {partner.businessRole && (
                  <Badge variant="secondary" className="mt-1">
                    {partner.businessRole}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="w-5 h-5" />
          <span>Invite Partner</span>
        </CardTitle>
        <CardDescription>
          Connect with your partner to start using CoupleOps together
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Invite Partner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Your Partner</DialogTitle>
              <DialogDescription>
                Send an invitation to your partner to join CoupleOps
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partner-email">Partner's Email</Label>
                <Input
                  id="partner-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter your partner's email"
                />
              </div>
              {message && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              <Button 
                onClick={handleInvitePartner} 
                disabled={loading || !inviteEmail}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}