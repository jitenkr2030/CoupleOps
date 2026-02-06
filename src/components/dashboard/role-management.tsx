'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, Unlock, Plus, Clock, CheckCircle } from "lucide-react"

interface Role {
  id: string
  name: string
  description?: string
  isLocked: boolean
  lockedAt?: string
  createdAt: string
}

export function RoleManagement() {
  const { data: session } = useSession()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState({ name: "", description: "" })
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchRoles()
  }, [session])

  const fetchRoles = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.name || !session?.user?.id) return

    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newRole)
      })

      const data = await response.json()

      if (response.ok) {
        setRoles(prev => [data, ...prev])
        setNewRole({ name: "", description: "" })
        setCreateDialogOpen(false)
        setMessage("Role created successfully!")
      } else {
        setMessage(data.error || "Failed to create role")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    }
  }

  const handleToggleLock = async (roleId: string, isLocked: boolean) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isLocked: !isLocked })
      })

      if (response.ok) {
        setRoles(prev => prev.map(role => 
          role.id === roleId 
            ? { ...role, isLocked: !isLocked, lockedAt: !isLocked ? new Date().toISOString() : undefined }
            : role
        ))
      }
    } catch (error) {
      console.error("Failed to toggle role lock:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Role Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Role Management</span>
          </CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new business role for decision authority
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Financial Decisions"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-description">Description</Label>
                  <Textarea
                    id="role-description"
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the responsibilities of this role"
                  />
                </div>
                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  onClick={handleCreateRole} 
                  disabled={!newRole.name}
                  className="w-full"
                >
                  Create Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Manage business roles and ownership for decision authority
        </CardDescription>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No roles created yet</p>
            <p className="text-sm text-gray-500">Create your first role to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{role.name}</h3>
                    <Badge variant={role.isLocked ? "destructive" : "secondary"}>
                      {role.isLocked ? "Locked" : "Active"}
                    </Badge>
                  </div>
                  {role.description && (
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  )}
                  {role.lockedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Locked on {new Date(role.lockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={role.isLocked ? "outline" : "default"}
                  onClick={() => handleToggleLock(role.id, role.isLocked)}
                >
                  {role.isLocked ? (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Lock
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}