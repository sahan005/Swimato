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
    const monthParam = searchParams.get("month"); // "YYYY-MM" or "all"

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const selectedMonth = monthParam || currentMonthKey;

    let dateFilter: Record<string, unknown> = {};
    if (selectedMonth !== "all") {
      const [yStr, mStr] = selectedMonth.split("-");
      const year = parseInt(yStr, 10);
      const monthIndex = parseInt(mStr, 10) - 1;

      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

      dateFilter = {
        orderedAt: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    // Fetch all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarEmoji: true,
        createdAt: true,
      },
    });

    // Fetch all orders in time range
    const orders = await prisma.order.findMany({
      where: dateFilter,
      select: {
        id: true,
        userId: true,
        platform: true,
        amount: true,
        orderedAt: true,
      },
    });

    // Fetch all orders all-time for available month list and streak calculation
    const allOrdersAllTime = await prisma.order.findMany({
      select: {
        userId: true,
        orderedAt: true,
      },
      orderBy: {
        orderedAt: "desc",
      },
    });

    // Extract distinct available months from orders
    const availableMonthsSet = new Set<string>();
    availableMonthsSet.add(currentMonthKey);
    for (const o of allOrdersAllTime) {
      const d = new Date(o.orderedAt);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      availableMonthsSet.add(mKey);
    }
    const availableMonths = Array.from(availableMonthsSet).sort().reverse();

    // Calculate streaks per user
    const streaksByUser: Record<string, number> = {};
    for (const user of allUsers) {
      const userOrders = allOrdersAllTime.filter((o) => o.userId === user.id);
      if (userOrders.length === 0) {
        streaksByUser[user.id] = 0;
        continue;
      }

      // Unique sorted days in descending order
      const days = Array.from(
        new Set(
          userOrders.map((o) => {
            const d = new Date(o.orderedAt);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          })
        )
      ).sort().reverse();

      let streak = 0;
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

      // User must have an order today or yesterday to have an active streak
      if (days[0] === todayStr || days[0] === yesterdayStr) {
        streak = 1;
        let expectedDate = new Date(days[0]);
        for (let i = 1; i < days.length; i++) {
          expectedDate.setDate(expectedDate.getDate() - 1);
          const expectedStr = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, "0")}-${String(expectedDate.getDate()).padStart(2, "0")}`;
          if (days[i] === expectedStr) {
            streak++;
          } else {
            break;
          }
        }
      }
      streaksByUser[user.id] = streak;
    }

    // Compute aggregated metrics for each user in selected month
    const leaderboardData = allUsers.map((user) => {
      const userOrders = orders.filter((o) => o.userId === user.id);
      const orderCount = userOrders.length;
      const totalSpent = userOrders.reduce((sum, o) => sum + o.amount, 0);
      const averageOrderValue = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0;

      const platforms: Record<string, { count: number; amount: number }> = {
        ZOMATO: { count: 0, amount: 0 },
        SWIGGY: { count: 0, amount: 0 },
        LOCAL: { count: 0, amount: 0 },
        OTHER: { count: 0, amount: 0 },
      };

      for (const ord of userOrders) {
        const plat = ord.platform as keyof typeof platforms;
        if (platforms[plat]) {
          platforms[plat].count += 1;
          platforms[plat].amount += ord.amount;
        }
      }

      let favPlatform = "NONE";
      let maxPlatCount = 0;
      for (const [pName, pData] of Object.entries(platforms)) {
        if (pData.count > maxPlatCount) {
          maxPlatCount = pData.count;
          favPlatform = pName;
        }
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarEmoji: user.avatarEmoji,
        },
        orderCount,
        totalSpent: Math.round(totalSpent * 100) / 100,
        averageOrderValue,
        platforms,
        favoritePlatform: favPlatform,
        streakDays: streaksByUser[user.id] || 0,
      };
    });

    // Determine rankings by count
    const rankedByCount = [...leaderboardData].sort((a, b) => {
      if (b.orderCount !== a.orderCount) return b.orderCount - a.orderCount;
      return b.totalSpent - a.totalSpent;
    });

    // Determine rankings by spend
    const rankedBySpend = [...leaderboardData].sort((a, b) => {
      if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
      return b.orderCount - a.orderCount;
    });

    // Find winners
    const foodieOfTheMonth = rankedByCount.find((u) => u.orderCount > 0) || null;
    const bigSpender = rankedBySpend.find((u) => u.totalSpent > 0) || null;

    // Overall group statistics for the period
    const groupTotalOrders = orders.length;
    const groupTotalSpend = Math.round(orders.reduce((sum, o) => sum + o.amount, 0) * 100) / 100;

    return NextResponse.json({
      selectedMonth,
      currentMonthKey,
      availableMonths,
      rankedByCount,
      rankedBySpend,
      foodieOfTheMonth,
      bigSpender,
      groupTotalOrders,
      groupTotalSpend,
    });
  } catch (error) {
    console.error("Leaderboard calculation error:", error);
    return NextResponse.json(
      { error: "Failed to generate leaderboard." },
      { status: 500 }
    );
  }
}
