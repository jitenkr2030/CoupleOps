import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const createEntrySchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  description: z.string().optional(),
  category: z.string().min(1),
  date: z.string().datetime(),
  childId: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const childId = searchParams.get('childId')

    const whereClause: any = {
      userId: session.user.id
    }

    if (type) {
      whereClause.type = type
    }

    if (category) {
      whereClause.category = category
    }

    if (childId) {
      whereClause.childId = childId
    }

    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) {
        whereClause.date.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate)
      }
    }

    const entries = await db.financialEntry.findMany({
      where: whereClause,
      include: {
        child: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Calculate summary statistics
    const summary = await db.financialEntry.groupBy({
      by: ['type'],
      where: whereClause,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    const income = summary.find(s => s.type === 'income')?._sum.amount || 0
    const expenses = summary.find(s => s.type === 'expense')?._sum.amount || 0
    const balance = income - expenses

    return NextResponse.json({
      entries,
      summary: {
        income,
        expenses,
        balance,
        totalEntries: entries.length
      }
    })
  } catch (error) {
    console.error("Get financial entries error:", error)
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
    const { type, amount, description, category, date, childId } = createEntrySchema.parse(body)

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

    const entry = await db.financialEntry.create({
      data: {
        type,
        amount,
        description,
        category,
        date: new Date(date),
        userId: session.user.id,
        childId
      },
      include: {
        child: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create financial entry error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}