import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const existing = await prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own orders." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { platform, amount, note, orderedAt } = body;

    const dataToUpdate: Record<string, unknown> = {};

    if (platform) {
      const validPlatforms = ["ZOMATO", "SWIGGY", "LOCAL", "OTHER"];
      if (!validPlatforms.includes(platform)) {
        return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
      }
      dataToUpdate.platform = platform;
    }

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json(
          { error: "Amount must be a valid positive number." },
          { status: 400 }
        );
      }
      dataToUpdate.amount = Math.round(numAmount * 100) / 100;
    }

    if (note !== undefined) {
      dataToUpdate.note = note ? String(note).trim() : null;
    }

    if (orderedAt) {
      dataToUpdate.orderedAt = new Date(orderedAt);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
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

    return NextResponse.json({ order: updated, message: "Order updated successfully." });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const existing = await prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own orders." },
        { status: 403 }
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Order deleted successfully." });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: "Failed to delete order." },
      { status: 500 }
    );
  }
}
