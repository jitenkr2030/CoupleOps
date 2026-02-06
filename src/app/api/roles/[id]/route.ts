import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isLocked: z.boolean().optional()
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

    const role = await db.role.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        decisions: true,
        tasks: true
      }
    })

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    return NextResponse.json(role)
  } catch (error) {
    console.error("Get role error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, isLocked } = updateRoleSchema.parse(body)

    // Check if role exists and belongs to user
    const existingRole = await db.role.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id
      }
    })

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // If trying to lock, check if user is the owner
    if (isLocked && existingRole.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the role owner can lock this role" },
        { status: 403 }
      )
    }

    // Check if new name conflicts with existing roles
    if (name && name !== existingRole.name) {
      const nameConflict = await db.role.findFirst({
        where: {
          name,
          ownerId: session.user.id,
          id: { not: params.id }
        }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: "You already have a role with this name" },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isLocked !== undefined) {
      updateData.isLocked = isLocked
      if (isLocked) {
        updateData.lockedAt = new Date()
        updateData.lockedBy = session.user.id
      } else {
        updateData.lockedAt = null
        updateData.lockedBy = null
      }
    }

    const role = await db.role.update({
      where: { id: params.id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(role)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Update role error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if role exists and belongs to user
    const existingRole = await db.role.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id
      }
    })

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // Don't allow deletion if role is locked
    if (existingRole.isLocked) {
      return NextResponse.json(
        { error: "Cannot delete a locked role" },
        { status: 400 }
      )
    }

    await db.role.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Role deleted successfully" })
  } catch (error) {
    console.error("Delete role error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}