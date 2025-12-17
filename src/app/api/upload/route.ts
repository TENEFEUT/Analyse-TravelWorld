import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    const formData = await req.formData();
    
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;

    if (!file) {
      return NextResponse.json({ message: "Aucun fichier fourni" }, { status: 400 });
    }

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Le fichier est trop volumineux (max 10MB)" },
        { status: 400 }
      );
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Le dossier existe déjà
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${originalName}`;
    const filePath = path.join(uploadsDir, fileName);

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Enregistrer dans la base de données
    const document = await prisma.document.create({
      data: {
        userId: decoded.userId,
        type: type as any,
        name: file.name,
        description: description || null,
        fileUrl: `/uploads/${fileName}`,
        fileName: fileName,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({
      message: "Fichier uploadé avec succès",
      document,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}

// GET - Récupérer tous les documents de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };

    const documents = await prisma.document.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un document
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

    const decoded = verifyToken(token) as { userId: string };

    // Vérifier que le document appartient à l'utilisateur
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document || document.userId !== decoded.userId) {
      return NextResponse.json(
        { message: "Document introuvable" },
        { status: 404 }
      );
    }

    // Supprimer le document de la base de données
    await prisma.document.delete({
      where: { id },
    });

    // Optionnel: Supprimer le fichier physique
    // const fs = require('fs').promises;
    // await fs.unlink(path.join(process.cwd(), 'public', document.fileUrl));

    return NextResponse.json({ message: "Document supprimé avec succès" });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}