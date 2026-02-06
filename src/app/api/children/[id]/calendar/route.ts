import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["school", "exam", "activity", "fee_due", "medical"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  reminderAt: z.string().datetime().optional(),
  isRecurring: z.boolean().default(false)
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify child belongs to the user
    const child = await db.child.findFirst({
      where: {
        id: params.id,
        OR: [
          { parentId1: session.user.id },
          { parentId2: session.user.id }
        ]
      }
    })

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')

    const whereClause: any = {
      childId: params.id
    }

    if (startDate || endDate) {
      whereClause.startDate = {}
      if (startDate) {
        whereClause.startDate.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.startDate.lte = new Date(endDate)
      }
    }

    if (type) {
      whereClause.type = type
    }

    const events = await db.calendarEvent.findMany({
      where: whereClause,
      orderBy: {
        startDate: 'asc'
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Get child calendar events error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify child belongs to the user
    const child = await db.child.findFirst({
      where: {
        id: params.id,
        OR: [
          { parentId1: session.user.id },
          { parentId2: session.user.id }
        ]
      }
    })

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, type, startDate, endDate, reminderAt, isRecurring } = createEventSchema.parse(body)

    const event = await db.calendarEvent.create({
      data: {
        title,
        description,
        type,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        reminderAt: reminderAt ? new Date(reminderAt) : null,
        isRecurring,
        childId: params.id
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create child calendar event error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}