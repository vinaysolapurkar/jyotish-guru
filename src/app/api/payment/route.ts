import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId, amount, currency = "INR", plan = "personal", interval = "monthly" } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate monthly expiry
    const expiresAt = new Date();
    if (interval === "monthly") expiresAt.setMonth(expiresAt.getMonth() + 1);
    else if (interval === "annual") expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else expiresAt.setFullYear(expiresAt.getFullYear() + 10);

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amount || 99,
        currency,
        plan,
        interval,
        paypalTransactionId: transactionId,
        status: "completed",
        expiresAt,
      },
    });

    // Upgrade user tier
    await prisma.user.update({
      where: { id: user.id },
      data: { tier: plan || "personal" },
    });

    return NextResponse.json({
      message: "Payment successful! Your account has been upgraded.",
      tier: plan || "personal",
    });
  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { error: "Payment processing failed. Please contact support." },
      { status: 500 }
    );
  }
}
