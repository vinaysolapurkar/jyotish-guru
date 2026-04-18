import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const relations = await prisma.relation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ relations, tier: user.tier });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.relation.count({ where: { userId: user.id } });
  const isFree = user.tier === "free";
  if (isFree && existing >= 1) {
    return NextResponse.json(
      {
        error: "UPGRADE_REQUIRED",
        message: "Free accounts can add one person. Upgrade to Rs. 99/month to add more.",
      },
      { status: 403 }
    );
  }

  const { name, relation, birthDate, birthTime, birthPlace, latitude, longitude } = await req.json();

  if (!name || !relation || !birthDate || !birthTime || !birthPlace || !latitude || !longitude) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const created = await prisma.relation.create({
    data: {
      userId: user.id,
      name: String(name).slice(0, 100),
      relation: String(relation).slice(0, 30),
      birthDate,
      birthTime,
      birthPlace: String(birthPlace).slice(0, 200),
      latitude: Number(latitude),
      longitude: Number(longitude),
    },
  });
  return NextResponse.json({ relation: created });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.relation.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
