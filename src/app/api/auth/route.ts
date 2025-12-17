import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email-brevo";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, type } = await req.json();

    // Validation des champs
    if (!email || !password || !type) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Email invalide" },
        { status: 400 }
      );
    }

    // INSCRIPTION
    if (type === "signup") {
      // Validation du mot de passe
      if (password.length < 6) {
        return NextResponse.json(
          { message: "Le mot de passe doit contenir au moins 6 caractères" },
          { status: 400 }
        );
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Cet email est déjà utilisé" },
          { status: 409 }
        );
      }

      // Hasher le mot de passe
      const hash = await bcrypt.hash(password, 10);

      // Générer un token de vérification
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      // Créer le nom complet
      const fullName = firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName || null);

      console.log("📝 [SIGNUP] Création de l'utilisateur...");
      console.log("   Email:", email);
      console.log("   Name:", fullName);
      console.log("   Token:", verificationToken.substring(0, 20) + "...");
      console.log("   Token expiry:", verificationTokenExpiry);

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email,
          password: hash,
          name: fullName,
          firstName: firstName || null,
          lastName: lastName || null,
          emailVerified: false,
          verificationToken,
          verificationTokenExpiry,
        },
      });

      console.log("✅ [SIGNUP] Utilisateur créé avec succès !");
      console.log("   User ID:", user.id);

      // Envoyer l'email de vérification
      console.log("📧 [SIGNUP] Envoi de l'email de vérification...");
      const emailResult = await sendVerificationEmail(email,firstName || lastName || "Utilisateur", verificationToken);
      
      if (emailResult.success) {
        console.log("✅ [SIGNUP] Email de vérification envoyé avec succès !");
      } else {
        console.error("❌ [SIGNUP] Échec de l'envoi de l'email :", emailResult.error);
      }

      return NextResponse.json({
        message: "Compte créé ! Veuillez vérifier votre email pour activer votre compte.",
        requiresVerification: true,
        email: user.email,
      });
    }

    // CONNEXION
    if (type === "login") {
      // Trouver l'utilisateur
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { message: "Email ou mot de passe incorrect" },
          { status: 401 }
        );
      }

      // Vérifier le mot de passe
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return NextResponse.json(
          { message: "Email ou mot de passe incorrect" },
          { status: 401 }
        );
      }

      // Vérifier si l'email est vérifié
      if (!user.emailVerified) {
        return NextResponse.json(
          {
            message: "Veuillez vérifier votre email avant de vous connecter",
            requiresVerification: true,
            email: user.email,
          },
          { status: 403 }
        );
      }

      // Générer le token
      const token = signToken({ userId: user.id, email: user.email });

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    }

    return NextResponse.json(
      { message: "Type de requête invalide" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ [AUTH] Erreur:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}