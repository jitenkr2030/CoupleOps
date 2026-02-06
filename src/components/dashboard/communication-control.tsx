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
import { MessageSquare, Snowflake, Clock, Plus, AlertTriangle, Ban } from "lucide-react"

interface CommunicationControl {
  id: string
  topic: string
  status: 'active' | 'frozen' | 'cooldown'
  freezeUntil?: string
  lastDiscussed: string
  discussionCount: number
}

export function CommunicationControl() {
  const { data: session } = useSession()
  const [controls, setControls] = useState<CommunicationControl[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTopic, setNewTopic] = useState("")
  const [message, setMessage] = useState("")
  const [discussingTopic, setDiscussingTopic] = useState<string | null>(null)

  useEffect(() => {
    fetchControls()
  }, [session])

  const fetchControls = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch("/api/communication-control")
      if (response.ok) {
        const data = await response.json()
        setControls(data)
      }
    } catch (error) {
      console.error("Failed to fetch communication controls:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateControl = async () => {
    if (!newTopic || !session?.user?.id) return

    try {
      const response = await fetch("/api/communication-control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ topic: newTopic })
      })

      const data = await response.json()

      if (response.ok) {
        setControls(prev => [data, ...prev])
        setNewTopic("")
        setCreateDialogOpen(false)
        setMessage("Topic added to communication control!")
      } else {
        setMessage(data.error || "Failed to add topic")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    }
  }

  const handleDiscussTopic = async (topicId: string) => {
    if (!session?.user?.id) return

    setDiscussingTopic(topicId)
    setMessage("")

    try {
      const response = await fetch(`/api/communication-control/${topicId}`, {
        method: "POST"
      })

      const data = await response.json()

      if (response.ok) {
        setControls(prev => prev.map(control => 
          control.id === topicId ? data : control
        ))
        
        if (data.autoFrozen) {
          setMessage(`Topic "${data.topic}" has been automatically frozen due to repeated discussions.`)
        } else {
          setMessage(`Discussion recorded for "${data.topic}". Count: ${data.discussionCount}`)
        }
      } else {
        setMessage(data.error || "Failed to record discussion")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setDiscussingTopic(null)
    }
  }

  const handleFreezeTopic = async (topicId: string, hours: number = 24) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/communication-control/${topicId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: 'frozen', freezeHours: hours })
      })

      if (response.ok) {
        const data = await response.json()
        setControls(prev => prev.map(control => 
          control.id === topicId ? data : control
        ))
        setMessage(`Topic "${data.topic}" has been frozen.`)
      }
    } catch (error) {
      setMessage("Failed to freeze topic")
    }
  }

  const getStatusBadge = (status: string, freezeUntil?: string) => {
    const now = new Date()
    const isExpired = freezeUntil && new Date(freezeUntil) < now

    if (status === 'frozen' && !isExpired) {
      return <Badge variant="destructive"><Snowflake className="w-3 h-3 mr-1" />Frozen</Badge>
    }
    if (status === 'cooldown' && !isExpired) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Cooldown</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getTimeRemaining = (freezeUntil?: string) => {
    if (!freezeUntil) return null
    
    const now = new Date()
    const freezeTime = new Date(freezeUntil)
    
    if (freezeTime <= now) return null
    
    const hours = Math.floor((freezeTime.getTime() - now.getTime()) / (1000 * 60 * 60))
    const minutes = Math.floor(((freezeTime.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Communication Control</span>
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
            <MessageSquare className="w-5 h-5" />
            <span>Communication Control</span>
          </CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Topic to Communication Control</DialogTitle>
                <DialogDescription>
                  Add a sensitive topic that requires discussion limits
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic-name">Topic Name</Label>
                  <Input
                    id="topic-name"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g., Budget discussions, In-laws visits"
                  />
                </div>
                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  onClick={handleCreateControl} 
                  disabled={!newTopic}
                  className="w-full"
                >
                  Add Topic
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Manage sensitive topics with discussion limits and cooldowns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {controls.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No topics under communication control</p>
            <p className="text-sm text-gray-500">Add sensitive topics to prevent repeated arguments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {controls.map((control) => (
              <div key={control.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium capitalize">{control.topic}</h3>
                    {getStatusBadge(control.status, control.freezeUntil)}
                    {control.discussionCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {control.discussionCount} discussions
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Last discussed: {new Date(control.lastDiscussed).toLocaleDateString()}
                    {control.freezeUntil && getTimeRemaining(control.freezeUntil) && (
                      <span className="ml-4">
                        {control.status === 'frozen' ? 'Frozen for' : 'Cooldown for'} {getTimeRemaining(control.freezeUntil)}
                      </span>
                    )}
                  </div>
                  {control.discussionCount >= 2 && (
                    <Alert className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        This topic has been discussed {control.discussionCount} times. 
                        {control.discussionCount >= 3 ? " It will be frozen automatically." : " It will be frozen after one more discussion."}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDiscussTopic(control.id)}
                    disabled={control.status === 'frozen' || control.status === 'cooldown' || discussingTopic === control.id}
                  >
                    {discussingTopic === control.id ? "Recording..." : "Discuss"}
                  </Button>
                  {control.status !== 'frozen' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleFreezeTopic(control.id)}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}