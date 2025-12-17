import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email requis" },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Toujours retourner success (sécurité: ne pas révéler si l'email existe)
    if (!user) {
      return NextResponse.json({
        message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation",
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: resetToken,
        verificationTokenExpiry: resetTokenExpiry,
      },
    });

    // Envoyer l'email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    
    // Fonction d'envoi d'email (similaire à sendVerificationEmail)
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Réinitialisation de votre mot de passe TravelWorld",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .content {
                  background: white;
                  padding: 30px;
                  border: 1px solid #e5e7eb;
                  border-top: none;
                  border-radius: 0 0 10px 10px;
                }
                .button {
                  display: inline-block;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 15px 30px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                  margin: 20px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔒 Réinitialisation de mot de passe</h1>
                </div>
                <div class="content">
                  <p>Bonjour,</p>
                  <p>Vous avez demandé à réinitialiser votre mot de passe TravelWorld. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                  <p style="text-align: center;">
                    <a href="${resetUrl}" class="button">
                      Réinitialiser mon mot de passe
                    </a>
                  </p>
                  <p>Ou copiez ce lien dans votre navigateur :</p>
                  <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
                    ${resetUrl}
                  </p>
                  <p><strong>Ce lien expirera dans 1 heure.</strong></p>
                  <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    return NextResponse.json({
      message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}