import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, displayName, avatarEmoji } = body;

    if (!username || !password || !displayName) {
      return NextResponse.json(
        { error: "Username, password, and display name are required." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username is already taken by another foodie." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        passwordHash,
        displayName: String(displayName).trim(),
        avatarEmoji: avatarEmoji || "🍕",
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully!",
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarEmoji: user.avatarEmoji,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
