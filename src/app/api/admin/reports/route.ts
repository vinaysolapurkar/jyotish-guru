import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = ["vinaysolapurkar@gmail.com"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalUsers, paidUsers, freeUsers, totalMessages, messagesToday, messagesLast7d, usersLast7d, revenueMonthly, recentMessages, topUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { tier: { not: "free" } } }),
    prisma.user.count({ where: { tier: "free" } }),
    prisma.message.count(),
    prisma.message.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.message.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "completed", createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { email: true, name: true, tier: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { messageCount: "desc" },
      take: 20,
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        messageCount: true,
        createdAt: true,
        birthPlace: true,
        telegramId: true,
        _count: { select: { messages: true, relations: true } },
      },
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalUsers,
      paidUsers,
      freeUsers,
      totalMessages,
      messagesToday,
      messagesLast7d,
      usersLast7d,
      revenueLast7d: revenueMonthly._sum.amount || 0,
    },
    recentMessages,
    topUsers,
  });
}
