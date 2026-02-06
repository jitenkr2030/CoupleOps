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
import { AlertTriangle, Zap, Clock, CheckSquare, Lock } from "lucide-react"

interface EmergencyOverride {
  id: string
  reason: string
  decisionId?: string
  taskId?: string
  status: 'active' | 'expired'
  expiresAt: string
  createdAt: string
}

interface Decision {
  id: string
  title: string
  status: string
}

interface Task {
  id: string
  title: string
  status: string
}

export function EmergencyOverride() {
  const { data: session } = useSession()
  const [overrides, setOverrides] = useState<EmergencyOverride[]>([])
  const [activeOverrides, setActiveOverrides] = useState<EmergencyOverride[]>([])
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newOverride, setNewOverride] = useState({
    reason: "",
    decisionId: "",
    taskId: "",
    durationHours: 2
  })
  const [message, setMessage] = useState("")
  const [creatingOverride, setCreatingOverride] = useState(false)

  useEffect(() => {
    fetchData()
    // Check for expired overrides every minute
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [session])

  const fetchData = async () => {
    if (!session?.user?.id) return

    try {
      // Fetch overrides
      const overrideResponse = await fetch("/api/emergency-override")
      if (overrideResponse.ok) {
        const overrideData = await overrideResponse.json()
        setOverrides(overrideData.overrides)
        setActiveOverrides(overrideData.activeOverrides)
      }

      // Fetch decisions for selection
      const decisionResponse = await fetch("/api/decisions?status=locked")
      if (decisionResponse.ok) {
        const decisionData = await decisionResponse.json()
        setDecisions(decisionData.slice(0, 10)) // Limit to recent 10
      }

      // Fetch tasks for selection
      const taskResponse = await fetch("/api/tasks?status=locked")
      if (taskResponse.ok) {
        const taskData = await taskResponse.json()
        setTasks(taskData.slice(0, 10)) // Limit to recent 10
      }
    } catch (error) {
      console.error("Failed to fetch emergency override data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOverride = async () => {
    if (!newOverride.reason || (!newOverride.decisionId && !newOverride.taskId) || !session?.user?.id) {
      setMessage("Please provide a reason and select a decision or task")
      return
    }

    setCreatingOverride(true)
    setMessage("")

    try {
      const response = await fetch("/api/emergency-override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newOverride)
      })

      const data = await response.json()

      if (response.ok) {
        setOverrides(prev => [data, ...prev])
        setActiveOverrides(prev => [data, ...prev])
        setNewOverride({
          reason: "",
          decisionId: "",
          taskId: "",
          durationHours: 2
        })
        setCreateDialogOpen(false)
        setMessage("Emergency override activated successfully!")
      } else {
        setMessage(data.error || "Failed to activate emergency override")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setCreatingOverride(false)
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiryTime = new Date(expiresAt)
    
    if (expiryTime <= now) return "Expired"
    
    const hours = Math.floor((expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60))
    const minutes = Math.floor(((expiryTime.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  const getSelectedResourceName = () => {
    if (newOverride.decisionId) {
      const decision = decisions.find(d => d.id === newOverride.decisionId)
      return decision ? `Decision: ${decision.title}` : ""
    }
    if (newOverride.taskId) {
      const task = tasks.find(t => t.id === newOverride.taskId)
      return task ? `Task: ${task.title}` : ""
    }
    return ""
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Emergency Override</span>
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
            <Zap className="w-5 h-5" />
            <span>Emergency Override</span>
          </CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Activate Override
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Emergency Override</span>
                </DialogTitle>
                <DialogDescription>
                  Use this only for genuine emergencies. This will notify your partner.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="override-reason">Emergency Reason</Label>
                  <Textarea
                    id="override-reason"
                    value={newOverride.reason}
                    onChange={(e) => setNewOverride(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Explain why this emergency override is necessary..."
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Select Resource to Override</Label>
                  <Select 
                    value={newOverride.decisionId || newOverride.taskId || ""} 
                    onValueChange={(value) => {
                      if (value.startsWith('decision-')) {
                        setNewOverride(prev => ({ 
                          ...prev, 
                          decisionId: value.replace('decision-', ''), 
                          taskId: '' 
                        }))
                      } else if (value.startsWith('task-')) {
                        setNewOverride(prev => ({ 
                          ...prev, 
                          taskId: value.replace('task-', ''), 
                          decisionId: '' 
                        }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a locked decision or task" />
                    </SelectTrigger>
                    <SelectContent>
                      {decisions.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-sm font-semibold text-gray-500">Decisions</div>
                          {decisions.map((decision) => (
                            <SelectItem key={decision.id} value={`decision-${decision.id}`}>
                              <div className="flex items-center space-x-2">
                                <Lock className="w-4 h-4" />
                                <span>{decision.title}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {tasks.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-sm font-semibold text-gray-500">Tasks</div>
                          {tasks.map((task) => (
                            <SelectItem key={task.id} value={`task-${task.id}`}>
                              <div className="flex items-center space-x-2">
                                <CheckSquare className="w-4 h-4" />
                                <span>{task.title}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {getSelectedResourceName() && (
                    <p className="text-sm text-gray-600">{getSelectedResourceName()}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Override Duration (hours)</Label>
                  <Select 
                    value={newOverride.durationHours.toString()} 
                    onValueChange={(value) => setNewOverride(prev => ({ ...prev, durationHours: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Emergency overrides are logged and shared with your partner. 
                    Use sparingly for genuine emergencies only.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleCreateOverride} 
                  disabled={!newOverride.reason || (!newOverride.decisionId && !newOverride.taskId) || creatingOverride}
                  className="w-full"
                  variant="destructive"
                >
                  {creatingOverride ? "Activating..." : "Activate Emergency Override"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Override locked decisions or tasks in emergency situations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeOverrides.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active emergency overrides</p>
            <p className="text-sm text-gray-500">Emergency overrides can be activated when needed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOverrides.map((override) => (
              <div key={override.id} className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Zap className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-red-900">Emergency Override Active</h4>
                    <p className="text-sm text-red-700">{override.reason}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-red-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Expires in {getTimeRemaining(override.expiresAt)}
                      </span>
                      <span className="text-xs text-red-600">
                        Activated {new Date(override.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="destructive">
                  Active
                </Badge>
              </div>
            ))}
          </div>
        )}
        
        {overrides.length > activeOverrides.length && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Overrides</h4>
            <div className="space-y-2">
              {overrides
                .filter(o => !activeOverrides.find(ao => ao.id === o.id))
                .slice(0, 3)
                .map((override) => (
                  <div key={override.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{override.reason}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(override.createdAt).toLocaleDateString()} • {getTimeRemaining(override.expiresAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-gray-500">
                      Expired
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}