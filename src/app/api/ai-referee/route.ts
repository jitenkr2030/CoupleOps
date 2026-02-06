import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { LLM } from "z-ai-web-dev-sdk"

const createSessionSchema = z.object({
  topic: z.string().min(1),
  user1Input: z.string().min(1),
  user2Input: z.string().min(1),
  user2Id: z.string().min(1)
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await db.aiRefereeSession.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Get AI referee sessions error:", error)
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
    const { topic, user1Input, user2Input, user2Id } = createSessionSchema.parse(body)

    // Get current user to check partner relationship
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { partner: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // User2 must be the current user's partner
    if (currentUser.partnerId !== user2Id) {
      return NextResponse.json(
        { error: "Can only create referee sessions with your partner" },
        { status: 400 }
      )
    }

    // Verify user2 exists
    const user2 = await db.user.findUnique({
      where: { id: user2Id }
    })

    if (!user2) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }

    // Create the session first
    const refereeSession = await db.aiRefereeSession.create({
      data: {
        topic,
        user1Input,
        user2Input,
        user1Id: session.user.id,
        user2Id,
        status: 'active'
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    try {
      // Use AI to analyze the conflict
      const llm = new LLM()
      
      const prompt = `As a neutral AI referee for a couple's conflict resolution system, analyze the following disagreement:

Topic: ${topic}

Partner 1's perspective: ${user1Input}

Partner 2's perspective: ${user2Input}

Please provide:
1. A brief, neutral summary of the core disagreement
2. 3-4 practical, logical suggestions for resolution
3. Focus on systems and processes, not emotional language
4. Keep responses concise and actionable

Format your response as JSON:
{
  "summary": "Brief neutral summary",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`

      const aiResponse = await llm.chat({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        maxTokens: 500
      })

      let aiAnalysis
      try {
        aiAnalysis = JSON.parse(aiResponse.content)
      } catch (parseError) {
        // Fallback if JSON parsing fails
        aiAnalysis = {
          summary: "AI analysis available but format error occurred",
          suggestions: ["Schedule a calm discussion", "Focus on the specific issue", "Consider compromise options"]
        }
      }

      // Update the session with AI analysis
      const updatedSession = await db.aiRefereeSession.update({
        where: { id: refereeSession.id },
        data: {
          summary: aiAnalysis.summary,
          suggestions: aiAnalysis.suggestions,
          status: 'resolved'
        },
        include: {
          user1: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          user2: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return NextResponse.json(updatedSession, { status: 201 })
    } catch (aiError) {
      console.error("AI analysis error:", aiError)
      
      // Return session without AI analysis if AI fails
      return NextResponse.json(refereeSession, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create AI referee session error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}