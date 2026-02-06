import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const createDecisionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  ownerId: z.string().min(1),
  roleId: z.string().optional(),
  discussionHours: z.number().min(1).max(168).default(24), // Max 1 week
  childId: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    const whereClause: any = {
      OR: [
        { createdBy: session.user.id },
        { ownerId: session.user.id }
      ]
    }

    if (status) {
      whereClause.status = status
    }

    if (category) {
      whereClause.category = category
    }

    const decisions = await db.decision.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        creator: {
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
        },
        child: {
          select: {
            id: true,
            name: true
          }
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(decisions)
  } catch (error) {
    console.error("Get decisions error:", error)
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
    const { title, description, category, ownerId, roleId, discussionHours, childId } = createDecisionSchema.parse(body)

    // Verify that the owner exists and is either the user or their partner
    const owner = await db.user.findUnique({
      where: { id: ownerId }
    })

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 })
    }

    // Get current user to check partner relationship
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { partner: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Owner must be either the current user or their partner
    if (ownerId !== session.user.id && currentUser.partnerId !== ownerId) {
      return NextResponse.json(
        { error: "Owner must be you or your partner" },
        { status: 400 }
      )
    }

    // If role is specified, verify it exists and belongs to the owner
    if (roleId) {
      const role = await db.role.findFirst({
        where: {
          id: roleId,
          ownerId: ownerId
        }
      })

      if (!role) {
        return NextResponse.json(
          { error: "Role not found or doesn't belong to the owner" },
          { status: 404 }
        )
      }
    }

    // If child is specified, verify it exists and belongs to the couple
    if (childId) {
      const child = await db.child.findFirst({
        where: {
          id: childId,
          OR: [
            { parentId1: session.user.id },
            { parentId2: session.user.id }
          ]
        }
      })

      if (!child) {
        return NextResponse.json(
          { error: "Child not found or doesn't belong to your family" },
          { status: 404 }
        )
      }
    }

    // Calculate discussion end time
    const discussionEndsAt = new Date()
    discussionEndsAt.setHours(discussionEndsAt.getHours() + discussionHours)

    const decision = await db.decision.create({
      data: {
        title,
        description,
        category,
        ownerId,
        createdBy: session.user.id,
        roleId,
        childId,
        discussionEndsAt,
        status: 'active'
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        creator: {
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
        },
        child: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(decision, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create decision error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}