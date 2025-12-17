import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// PUT - Mettre à jour une étape
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    const caseId = params.id;
    const { searchParams } = new URL(req.url);
    const stepId = searchParams.get("stepId");

    if (!stepId) {
      return NextResponse.json(
        { message: "stepId requis" },
        { status: 400 }
      );
    }

    const data = await req.json();

    // Vérifier que le dossier appartient à l'utilisateur
    const immigrationCase = await prisma.immigrationCase.findFirst({
      where: {
        id: caseId,
        userId: decoded.userId,
      },
    });

    if (!immigrationCase) {
      return NextResponse.json(
        { message: "Dossier introuvable" },
        { status: 404 }
      );
    }

    // Mettre à jour l'étape
    const updatedStep = await prisma.caseStep.update({
      where: { id: stepId },
      data: {
        status: data.status,
        proofUrl: data.proofUrl,
        proofNotes: data.proofNotes,
        completedAt: data.status === "COMPLETED" ? new Date() : null,
      },
    });

    return NextResponse.json({
      message: "Étape mise à jour avec succès",
      step: updatedStep,
    });
  } catch (error) {
    console.error("Step PUT error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}