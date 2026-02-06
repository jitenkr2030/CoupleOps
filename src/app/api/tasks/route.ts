import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assignedTo: z.string().min(1),
  roleId: z.string().optional(),
  dueDate: z.string().datetime().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')

    const whereClause: any = {
      OR: [
        { createdBy: session.user.id },
        { assignedTo: session.user.id }
      ]
    }

    if (status) {
      whereClause.status = status
    }

    if (priority) {
      whereClause.priority = priority
    }

    if (assignedTo) {
      whereClause.assignedTo = assignedTo
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            isLocked: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Get tasks error:", error)
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
    const { title, description, priority, assignedTo, roleId, dueDate } = createTaskSchema.parse(body)

    // Get current user to check partner relationship
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { partner: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Assigned user must be either the current user or their partner
    if (assignedTo !== session.user.id && currentUser.partnerId !== assignedTo) {
      return NextResponse.json(
        { error: "Can only assign tasks to yourself or your partner" },
        { status: 400 }
      )
    }

    // If role is specified, verify it exists and belongs to the assigned user
    if (roleId) {
      const role = await db.role.findFirst({
        where: {
          id: roleId,
          ownerId: assignedTo
        }
      })

      if (!role) {
        return NextResponse.json(
          { error: "Role not found or doesn't belong to the assigned user" },
          { status: 404 }
        )
      }
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        priority,
        assignedTo,
        createdBy: session.user.id,
        roleId,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            isLocked: true
          }
        }
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create task error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}