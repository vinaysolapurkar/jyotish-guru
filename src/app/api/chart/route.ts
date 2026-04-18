import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateBirthChart } from "@/lib/astrology";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { birthDate, birthTime, birthPlace, latitude, longitude } =
      await req.json();

    if (!birthDate || !birthTime || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Birth date, time, and location are required" },
        { status: 400 }
      );
    }

    // Update user's birth details
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        birthDate,
        birthTime,
        birthPlace: birthPlace || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    // Calculate birth chart
    const chartData = calculateBirthChart(
      birthDate,
      birthTime,
      parseFloat(latitude),
      parseFloat(longitude)
    );

    // Save chart
    await prisma.birthChart.create({
      data: {
        userId: user.id,
        chartData: JSON.stringify(chartData),
      },
    });

    return NextResponse.json({ chart: chartData });
  } catch (error) {
    console.error("Chart API error:", error);
    return NextResponse.json(
      { error: "Failed to generate birth chart. Please check your inputs." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.birthDate || !user.birthTime || !user.latitude || !user.longitude) {
      return NextResponse.json(
        { error: "No birth details found. Please generate your chart first." },
        { status: 404 }
      );
    }

    const chartData = calculateBirthChart(
      user.birthDate,
      user.birthTime,
      user.latitude,
      user.longitude
    );

    return NextResponse.json({ chart: chartData });
  } catch (error) {
    console.error("Chart GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve birth chart." },
      { status: 500 }
    );
  }
}
