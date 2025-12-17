import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET - Récupérer le profil complet
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: {
          include: {
            education: {
              include: { documents: true },
              orderBy: { startDate: 'desc' }
            },
            workExperience: {
              orderBy: { startDate: 'desc' }
            },
            languages: true,
          },
        },
        documents: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
    }

    // Ne pas renvoyer le mot de passe
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Mettre à jour le profil
export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    const data = await req.json();

    // Mise à jour des informations de base
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        birthPlace: data.birthPlace,
        nationality: data.nationality,
        currentCountry: data.currentCountry,
        phone: data.phone,
      },
    });

    return NextResponse.json({ 
      message: "Profil mis à jour avec succès",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}