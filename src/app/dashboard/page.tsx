'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PartnerManagement } from "@/components/dashboard/partner-management"
import { RoleManagement } from "@/components/dashboard/role-management"
import { CommunicationControl } from "@/components/dashboard/communication-control"
import { ChildCalendar } from "@/components/dashboard/child-calendar"
import { NotificationCenter } from "@/components/dashboard/notification-center"
import { EmergencyOverride } from "@/components/dashboard/emergency-override"
import { 
  Users, 
  Shield, 
  DollarSign, 
  MessageSquare, 
  CheckSquare, 
  Baby, 
  Calendar,
  Bell,
  Settings,
  Heart,
  TrendingUp,
  AlertCircle,
  Clock
} from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentMode, setCurrentMode] = useState("personal")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const user = session?.user

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-8 h-8 text-pink-600" />
                <h1 className="text-2xl font-bold text-gray-900">CoupleOps</h1>
              </div>
              <Badge variant={currentMode === "business" ? "default" : "secondary"}>
                {currentMode === "business" ? "Business Mode" : "Personal Mode"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Mode:</span>
                <Switch
                  checked={currentMode === "business"}
                  onCheckedChange={(checked) => setCurrentMode(checked ? "business" : "personal")}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-semibold">
                    {user?.name?.[0] || user?.email?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || "User"}!
          </h2>
          <p className="text-gray-600">
            {user?.businessRole ? `${user.businessRole} • ` : ""}
            Manage your relationship with structured systems and clear communication.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Decisions</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 pending your input</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,450</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">5 completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Children</CardTitle>
              <Baby className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">3 events this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Partner Management */}
              <PartnerManagement />
              
              {/* Role Management */}
              <RoleManagement />

              {/* Communication Control */}
              <CommunicationControl />

              {/* Notification Center */}
              <NotificationCenter />

              {/* Emergency Override */}
              <EmergencyOverride />

              {/* Recent Decisions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckSquare className="w-5 h-5" />
                    <span>Recent Decisions</span>
                  </CardTitle>
                  <CardDescription>Latest decisions requiring your attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Q4 Budget Allocation</p>
                      <p className="text-sm text-gray-600">Financial • Expires in 2 days</p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Vacation Planning</p>
                      <p className="text-sm text-gray-600">Personal • 5 days left</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Recent Activities</span>
                  </CardTitle>
                  <CardDescription>Latest updates from your system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm"><strong>System</strong> Role "Financial Decisions" created</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm"><strong>System</strong> Decision "Budget Review" locked</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm"><strong>System</strong> New task assigned: "Pay utilities"</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="decisions">
            <Card>
              <CardHeader>
                <CardTitle>Decision Management</CardTitle>
                <CardDescription>Manage and track all your decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Decision management interface coming soon</p>
                  <p className="text-sm text-gray-500">Create, track, and lock decisions with authority</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finances">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Track income, expenses, and budget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Financial management interface coming soon</p>
                  <p className="text-sm text-gray-500">Transparent money tracking for both partners</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>Assign and track tasks by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Task management interface coming soon</p>
                  <p className="text-sm text-gray-500">Role-based task assignment and tracking</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="children">
            <div className="space-y-6">
              {/* Sample child data - in a real app, this would come from API */}
              <ChildCalendar child={{
                id: "sample-child-1",
                name: "Emma",
                dateOfBirth: "2018-05-15",
                class: "3rd Grade",
                school: "Lincoln Elementary"
              }} />
              
              <ChildCalendar child={{
                id: "sample-child-2", 
                name: "Noah",
                dateOfBirth: "2020-09-22",
                class: "Preschool",
                school: "Sunshine Academy"
              }} />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Settings interface coming soon</p>
                  <p className="text-sm text-gray-500">Account preferences and privacy settings</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}