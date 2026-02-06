import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { randomBytes } from "crypto"

const inviteSchema = z.object({
  email: z.string().email()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email } = inviteSchema.parse(body)

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { partner: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user already has a partner
    if (currentUser.partnerId) {
      return NextResponse.json(
        { error: "You already have a partner" },
        { status: 400 }
      )
    }

    // Check if the invited user exists
    const invitedUser = await db.user.findUnique({
      where: { email }
    })

    if (!invitedUser) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      )
    }

    // Check if invited user already has a partner
    if (invitedUser.partnerId) {
      return NextResponse.json(
        { error: "This user already has a partner" },
        { status: 400 }
      )
    }

    // Generate invitation token
    const invitationToken = randomBytes(32).toString('hex')
    
    // Store invitation (you could create a separate invitations table)
    // For now, we'll use a simple approach with user preferences
    await db.user.update({
      where: { id: invitedUser.id },
      data: {
        preferences: {
          ...invitedUser.preferences,
          invitationToken,
          invitedBy: currentUser.id,
          invitedAt: new Date().toISOString()
        }
      }
    })

    // TODO: Send email invitation with token
    // For now, return the token for testing
    return NextResponse.json({
      message: "Invitation sent successfully",
      invitationToken,
      invitedUser: {
        id: invitedUser.id,
        email: invitedUser.email,
        name: invitedUser.name
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Partner invitation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { token } = z.object({ token: z.string() }).parse(body)

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user already has a partner
    if (currentUser.partnerId) {
      return NextResponse.json(
        { error: "You already have a partner" },
        { status: 400 }
      )
    }

    // Get invitation from preferences
    const preferences = currentUser.preferences as any
    if (!preferences?.invitationToken || preferences.invitationToken !== token) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 }
      )
    }

    // Get the inviter
    const inviter = await db.user.findUnique({
      where: { id: preferences.invitedBy }
    })

    if (!inviter) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      )
    }

    // Create partnership
    await db.user.update({
      where: { id: currentUser.id },
      data: {
        partnerId: inviter.id,
        preferences: {
          ...currentUser.preferences,
          invitationToken: null,
          invitedBy: null,
          invitedAt: null
        }
      }
    })

    await db.user.update({
      where: { id: inviter.id },
      data: {
        partnerId: currentUser.id
      }
    })

    return NextResponse.json({
      message: "Partnership established successfully",
      partner: {
        id: inviter.id,
        email: inviter.email,
        name: inviter.name,
        businessRole: inviter.businessRole
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Partner acceptance error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}