import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await props.params;
    const body = await req.json();
    const { emoji } = body;

    const allowedEmojis = ["🔥", "🤤", "💸", "🍕", "💀", "❤️"];
    if (!emoji || !allowedEmojis.includes(emoji)) {
      return NextResponse.json({ error: "Invalid emoji reaction" }, { status: 400 });
    }

    const existingReaction = await prisma.reaction.findUnique({
      where: {
        orderId_userId_emoji: {
          orderId,
          userId: session.user.id,
          emoji,
        },
      },
    });

    if (existingReaction) {
      // Toggle off if already exists
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
      return NextResponse.json({ toggled: "removed", emoji });
    } else {
      // Add reaction
      const reaction = await prisma.reaction.create({
        data: {
          orderId,
          userId: session.user.id,
          emoji,
        },
      });
      return NextResponse.json({ toggled: "added", reaction });
    }
  } catch (error) {
    console.error("Reaction toggle error:", error);
    return NextResponse.json(
      { error: "Failed to update reaction" },
      { status: 500 }
    );
  }
}
