import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET - Récupérer toutes les langues
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    
    let profile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
      include: { languages: true }
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId: decoded.userId },
        include: { languages: true }
      });
    }

    return NextResponse.json({ languages: profile.languages });
  } catch (error) {
    console.error("Languages GET error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Ajouter une langue
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    const data = await req.json();

    let profile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId }
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId: decoded.userId }
      });
    }

    const language = await prisma.languageSkill.create({
      data: {
        profileId: profile.id,
        language: data.language,
        level: data.level,
        hasCertificate: data.hasCertificate || false,
        certificateName: data.certificateName,
        score: data.score,
      }
    });

    return NextResponse.json({ 
      message: "Langue ajoutée avec succès",
      language 
    });
  } catch (error) {
    console.error("Languages POST error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer une langue
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

    await prisma.languageSkill.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Langue supprimée avec succès" });
  } catch (error) {
    console.error("Languages DELETE error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}