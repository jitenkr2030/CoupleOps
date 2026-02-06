import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const updateControlSchema = z.object({
  status: z.enum(["active", "frozen", "cooldown"]).optional(),
  freezeHours: z.number().min(1).max(168).optional()
})

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
    const { status, freezeHours } = updateControlSchema.parse(body)

    // Check if control exists
    const existingControl = await db.communicationControl.findUnique({
      where: { id: params.id }
    })

    if (!existingControl) {
      return NextResponse.json({ error: "Communication control not found" }, { status: 404 })
    }

    const updateData: any = {}

    if (status) {
      updateData.status = status
      
      if (status === 'frozen') {
        const hours = freezeHours || 24
        const freezeUntil = new Date()
        freezeUntil.setHours(freezeUntil.getHours() + hours)
        updateData.freezeUntil = freezeUntil
      } else if (status === 'active') {
        updateData.freezeUntil = null
      } else if (status === 'cooldown') {
        const cooldownUntil = new Date()
        cooldownUntil.setHours(cooldownUntil.getHours() + 2) // 2-hour cooldown
        updateData.freezeUntil = cooldownUntil
      }
    }

    const control = await db.communicationControl.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(control)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Update communication control error:", error)
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

    // Check if control exists and is active
    const existingControl = await db.communicationControl.findUnique({
      where: { id: params.id }
    })

    if (!existingControl) {
      return NextResponse.json({ error: "Communication control not found" }, { status: 404 })
    }

    // Check if topic is frozen or in cooldown
    const now = new Date()
    if (existingControl.status === 'frozen' && existingControl.freezeUntil && existingControl.freezeUntil > now) {
      return NextResponse.json(
        { 
          error: "Topic is frozen", 
          freezeUntil: existingControl.freezeUntil,
          message: `This topic is frozen until ${existingControl.freezeUntil.toLocaleString()}`
        },
        { status: 423 } // Locked
      )
    }

    if (existingControl.status === 'cooldown' && existingControl.freezeUntil && existingControl.freezeUntil > now) {
      return NextResponse.json(
        { 
          error: "Topic is in cooldown", 
          freezeUntil: existingControl.freezeUntil,
          message: `This topic is in cooldown until ${existingControl.freezeUntil.toLocaleString()}`
        },
        { status: 423 } // Locked
      )
    }

    // Update discussion count and last discussed time
    const updatedControl = await db.communicationControl.update({
      where: { id: params.id },
      data: {
        lastDiscussed: now,
        discussionCount: existingControl.discussionCount + 1
      }
    })

    // Check if this topic should be frozen due to repeated discussions
    if (updatedControl.discussionCount >= 3) {
      const freezeUntil = new Date()
      freezeUntil.setHours(freezeUntil.getHours() + 24) // 24-hour freeze after 3 discussions

      await db.communicationControl.update({
        where: { id: params.id },
        data: {
          status: 'frozen',
          freezeUntil
        }
      })

      return NextResponse.json({
        ...updatedControl,
        autoFrozen: true,
        message: "Topic has been automatically frozen due to repeated discussions"
      })
    }

    return NextResponse.json(updatedControl)
  } catch (error) {
    console.error("Discuss topic error:", error)
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

    // Check if control exists and belongs to user
    const existingControl = await db.communicationControl.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingControl) {
      return NextResponse.json({ error: "Communication control not found" }, { status: 404 })
    }

    await db.communicationControl.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Communication control removed successfully" })
  } catch (error) {
    console.error("Delete communication control error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}