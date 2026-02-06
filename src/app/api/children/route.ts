import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const createChildSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z.string().datetime(),
  class: z.string().optional(),
  school: z.string().optional(),
  parentId2: z.string().min(1)
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const children = await db.child.findMany({
      where: {
        OR: [
          { parentId1: session.user.id },
          { parentId2: session.user.id }
        ]
      },
      include: {
        parent1: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        parent2: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            decisions: true,
            expenses: true,
            calendarEvents: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(children)
  } catch (error) {
    console.error("Get children error:", error)
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
    const { name, dateOfBirth, class: childClass, school, parentId2 } = createChildSchema.parse(body)

    // Get current user to check partner relationship
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { partner: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Parent2 must be the current user's partner
    if (currentUser.partnerId !== parentId2) {
      return NextResponse.json(
        { error: "Can only add children with your partner" },
        { status: 400 }
      )
    }

    // Verify parent2 exists
    const parent2 = await db.user.findUnique({
      where: { id: parentId2 }
    })

    if (!parent2) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }

    const child = await db.child.create({
      data: {
        name,
        dateOfBirth: new Date(dateOfBirth),
        class: childClass,
        school,
        parentId1: session.user.id,
        parentId2
      },
      include: {
        parent1: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        parent2: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(child, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create child error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}