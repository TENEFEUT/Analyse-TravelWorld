import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { signToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Token manquant" },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur avec ce token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gte: new Date(), // Token non expiré
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token invalide ou expiré" },
        { status: 400 }
      );
    }

    // Vérifier l'email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    // Envoyer l'email de bienvenue
    await sendWelcomeEmail(user.email, user.name || "");

    // Générer un token d'authentification
    const authToken = signToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      message: "Email vérifié avec succès !",
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}