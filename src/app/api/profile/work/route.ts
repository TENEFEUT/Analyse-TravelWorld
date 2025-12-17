import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET - Récupérer toutes les expériences
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    
    let profile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
      include: {
        workExperience: {
          orderBy: { startDate: 'desc' }
        }
      }
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId: decoded.userId },
        include: { workExperience: true }
      });
    }

    return NextResponse.json({ workExperience: profile.workExperience });
  } catch (error) {
    console.error("Work GET error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Ajouter une expérience
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

    const workExperience = await prisma.workExperience.create({
      data: {
        profileId: profile.id,
        jobTitle: data.jobTitle,
        company: data.company,
        country: data.country,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isCurrently: data.isCurrently || false,
        description: data.description,
      }
    });

    return NextResponse.json({ 
      message: "Expérience ajoutée avec succès",
      workExperience 
    });
  } catch (error) {
    console.error("Work POST error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer une expérience
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

    await prisma.workExperience.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Expérience supprimée avec succès" });
  } catch (error) {
    console.error("Work DELETE error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}