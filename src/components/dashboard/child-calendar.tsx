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
import { Calendar, Plus, Clock, School, Stethoscope, DollarSign, Trophy, Activity } from "lucide-react"

interface Child {
  id: string
  name: string
  dateOfBirth: string
  class?: string
  school?: string
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: 'school' | 'exam' | 'activity' | 'fee_due' | 'medical'
  startDate: string
  endDate?: string
  reminderAt?: string
  isRecurring: boolean
}

interface ChildCalendarProps {
  child: Child
}

export function ChildCalendar({ child }: ChildCalendarProps) {
  const { data: session } = useSession()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "school" as const,
    startDate: "",
    endDate: "",
    reminderAt: "",
    isRecurring: false
  })
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchEvents()
  }, [child.id, session])

  const fetchEvents = async () => {
    if (!session?.user?.id || !child.id) return

    try {
      const response = await fetch(`/api/children/${child.id}/calendar`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Failed to fetch child events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.type || !session?.user?.id) return

    try {
      const response = await fetch(`/api/children/${child.id}/calendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newEvent)
      })

      const data = await response.json()

      if (response.ok) {
        setEvents(prev => [data, ...prev])
        setNewEvent({
          title: "",
          description: "",
          type: "school",
          startDate: "",
          endDate: "",
          reminderAt: "",
          isRecurring: false
        })
        setCreateDialogOpen(false)
        setMessage("Event created successfully!")
      } else {
        setMessage(data.error || "Failed to create event")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'school': return <School className="w-4 h-4" />
      case 'exam': return <Trophy className="w-4 h-4" />
      case 'activity': return <Activity className="w-4 h-4" />
      case 'fee_due': return <DollarSign className="w-4 h-4" />
      case 'medical': return <Stethoscope className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'school': return 'bg-blue-100 text-blue-800'
      case 'exam': return 'bg-purple-100 text-purple-800'
      case 'activity': return 'bg-green-100 text-green-800'
      case 'fee_due': return 'bg-yellow-100 text-yellow-800'
      case 'medical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatEventDate = (startDate: string, endDate?: string) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : null
    
    if (end && start.toDateString() !== end.toDateString()) {
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
    }
    
    return start.toLocaleDateString()
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter(event => new Date(event.startDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>{child.name}'s Calendar</span>
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

  const upcomingEvents = getUpcomingEvents()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>{child.name}'s Calendar</span>
          </CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Calendar Event</DialogTitle>
                <DialogDescription>
                  Add an event for {child.name}'s schedule
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Parent-teacher meeting"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select value={newEvent.type} onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="fee_due">Fee Due</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Event details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date (Optional)</Label>
                    <Input
                      id="end-date"
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  onClick={handleCreateEvent} 
                  disabled={!newEvent.title || !newEvent.startDate}
                  className="w-full"
                >
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Manage {child.name}'s schedule, appointments, and important dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No upcoming events</p>
            <p className="text-sm text-gray-500">Add events to keep track of {child.name}'s schedule</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      {formatEventDate(event.startDate, event.endDate)}
                    </p>
                    {event.description && (
                      <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                    )}
                    {event.isRecurring && (
                      <Badge variant="outline" className="mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge className={getEventColor(event.type)}>
                  {event.type.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}