import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        birthDate: true,
        birthTime: true,
        birthPlace: true,
        latitude: true,
        longitude: true,
        messageCount: true,
        tier: true,
        displayMode: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Count today's messages for the daily free quota
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const todayMessageCount = await prisma.message.count({
      where: { userId: user.id, role: "user", createdAt: { gte: since } },
    });

    return NextResponse.json({ user: { ...user, todayMessageCount } });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { displayMode } = await req.json();

    if (displayMode && !["simple", "technical"].includes(displayMode)) {
      return NextResponse.json({ error: "Invalid display mode" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { displayMode },
      select: { displayMode: true },
    });

    return NextResponse.json({ displayMode: user.displayMode });
  } catch {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
