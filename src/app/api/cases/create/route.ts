import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const payload = verifyToken(token) as { userId: string };
  const { country, description } = await req.json();

  const newCase = await prisma.immigrationCase.create({
    data: {
      userId: payload.userId,
      country,
      description,
    },
  });

  return NextResponse.json(newCase);
}
