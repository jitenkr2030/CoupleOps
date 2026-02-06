import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const createOverrideSchema = z.object({
  reason: z.string().min(1),
  decisionId: z.string().optional(),
  taskId: z.string().optional(),
  durationHours: z.number().min(1).max(24).default(2) // Max 24 hours
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const overrides = await db.emergencyOverride.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Filter out expired overrides
    const now = new Date()
    const activeOverrides = overrides.filter(override => 
      override.status === 'active' && override.expiresAt > now
    )

    return NextResponse.json({
      overrides,
      activeOverrides
    })
  } catch (error) {
    console.error("Get emergency overrides error:", error)
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
    const { reason, decisionId, taskId, durationHours } = createOverrideSchema.parse(body)

    // Validate that at least one resource is provided
    if (!decisionId && !taskId) {
      return NextResponse.json(
        { error: "Either decisionId or taskId must be provided" },
        { status: 400 }
      )
    }

    // Check if user has too many recent overrides (prevent abuse)
    const recentOverrides = await db.emergencyOverride.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })

    if (recentOverrides >= 5) {
      return NextResponse.json(
        { error: "Too many emergency overrides in the last 24 hours" },
        { status: 429 }
      )
    }

    // Validate decision/task exists and user has access
    if (decisionId) {
      const decision = await db.decision.findFirst({
        where: {
          id: decisionId,
          OR: [
            { createdBy: session.user.id },
            { ownerId: session.user.id }
          ]
        }
      })

      if (!decision) {
        return NextResponse.json({ error: "Decision not found" }, { status: 404 })
      }
    }

    if (taskId) {
      const task = await db.task.findFirst({
        where: {
          id: taskId,
          OR: [
            { createdBy: session.user.id },
            { assignedTo: session.user.id }
          ]
        }
      })

      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 })
      }
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + durationHours)

    const override = await db.emergencyOverride.create({
      data: {
        reason,
        decisionId,
        taskId,
        userId: session.user.id,
        expiresAt,
        status: 'active'
      }
    })

    // Create notification for partner
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { partner: true }
    })

    if (currentUser?.partnerId) {
      await db.notification.create({
        data: {
          title: "Emergency Override Activated",
          message: `${currentUser.name || "Your partner"} has activated an emergency override: ${reason}`,
          type: "emergency",
          userId: currentUser.partnerId,
          data: {
            overrideId: override.id,
            reason,
            activatedBy: currentUser.name
          }
        }
      })
    }

    return NextResponse.json(override, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create emergency override error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}