import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const createControlSchema = z.object({
  topic: z.string().min(1),
  freezeHours: z.number().min(1).max(168).default(24) // Max 1 week
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const whereClause: any = {
      OR: [
        { userId: session.user.id },
        { userId: null } // Global controls
      ]
    }

    if (status) {
      whereClause.status = status
    }

    const controls = await db.communicationControl.findMany({
      where: whereClause,
      orderBy: {
        lastDiscussed: 'desc'
      }
    })

    // Filter out expired freezes
    const now = new Date()
    const activeControls = controls.map(control => {
      if (control.status === 'frozen' && control.freezeUntil && control.freezeUntil < now) {
        return { ...control, status: 'active' as const }
      }
      return control
    })

    return NextResponse.json(activeControls)
  } catch (error) {
    console.error("Get communication controls error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { topic, freezeHours } = createControlSchema.parse(body)

    // Check if topic already exists
    const existingControl = await db.communicationControl.findFirst({
      where: {
        topic: topic.toLowerCase().trim()
      }
    })

    if (existingControl) {
      return NextResponse.json(
        { error: "Topic already exists in communication control" },
        { status: 400 }
      )
    }

    // Get user's partner to apply control to both
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { partner: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const control = await db.communicationControl.create({
      data: {
        topic: topic.toLowerCase().trim(),
        status: 'active',
        lastDiscussed: new Date(),
        discussionCount: 0,
        userId: session.user.id
      }
    })

    return NextResponse.json(control, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create communication control error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}