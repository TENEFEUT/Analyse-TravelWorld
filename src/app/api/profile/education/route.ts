import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET - Récupérer toutes les formations
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    
    // Vérifier si le profil existe
    let profile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
      include: {
        education: {
          orderBy: { startDate: 'desc' }
        }
      }
    });

    // Créer le profil s'il n'existe pas
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId: decoded.userId },
        include: {
          education: true
        }
      });
    }

    return NextResponse.json({ education: profile.education });
  } catch (error) {
    console.error("Education GET error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Ajouter une formation
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    const data = await req.json();

    // Vérifier/créer le profil
    let profile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId }
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId: decoded.userId }
      });
    }

    // Créer la formation
    const education = await prisma.education.create({
      data: {
        profileId: profile.id,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        institution: data.institution,
        country: data.country,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isCurrently: data.isCurrently || false,
      }
    });

    return NextResponse.json({ 
      message: "Formation ajoutée avec succès",
      education 
    });
  } catch (error) {
    console.error("Education POST error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer une formation
export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID requis" }, { status: 400 });
    }

    await prisma.education.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Formation supprimée avec succès" });
  } catch (error) {
    console.error("Education DELETE error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}