import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const month = searchParams.get("month"); // "YYYY-MM" or "all"
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const whereClause: Record<string, unknown> = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (month && month !== "all") {
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10) - 1; // 0-indexed

      const startOfMonth = new Date(year, monthNum, 1);
      const endOfMonth = new Date(year, monthNum + 1, 0, 23, 59, 59, 999);

      whereClause.orderedAt = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarEmoji: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarEmoji: true,
              },
            },
          },
        },
      },
      orderBy: {
        orderedAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: "Failed to load orders." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { platform, amount, note, orderedAt } = body;

    const validPlatforms = ["ZOMATO", "SWIGGY", "LOCAL", "OTHER"];
    if (!platform || !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform. Must be ZOMATO, SWIGGY, LOCAL, or OTHER." },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a valid positive number." },
        { status: 400 }
      );
    }

    const orderDate = orderedAt ? new Date(orderedAt) : new Date();

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        platform,
        amount: Math.round(numAmount * 100) / 100,
        note: note ? String(note).trim() : null,
        orderedAt: orderDate,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarEmoji: true,
          },
        },
        reactions: true,
      },
    });

    return NextResponse.json({ order, message: "Order logged on the board!" }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to record order." },
      { status: 500 }
    );
  }
}
