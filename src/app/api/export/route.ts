import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "all"; // "me" or "all"

    const whereClause: Record<string, unknown> = {};
    if (scope === "me") {
      whereClause.userId = session.user.id;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        orderedAt: "desc",
      },
    });

    const headers = ["Order ID", "Date", "User", "Platform", "Amount (INR)", "Note"];
    const rows = orders.map((o) => {
      const dateStr = new Date(o.orderedAt).toISOString().split("T")[0];
      const cleanNote = (o.note || "").replace(/"/g, '""');
      return `"${o.id}","${dateStr}","${o.user.displayName} (@${o.user.username})","${o.platform}",${o.amount},"${cleanNote}"`;
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orderwars-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV Export error:", error);
    return new NextResponse("Failed to generate CSV export", { status: 500 });
  }
}
