import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  console.log("🔍 [DEBUG] Tentative d'envoi d'email...");
  console.log("   Email destinataire:", email);
  console.log("   Clé API présente:", !!process.env.RESEND_API_KEY);
  console.log("   Email FROM:", EMAIL_FROM);
  console.log("   URL de vérification:", verificationUrl);

  try {
    console.log("📧 Envoi en cours...");
    
    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Vérifiez votre compte TravelWorld",
      html: `
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Vérifiez votre email</h1>
            <p>Cliquez sur le lien ci-dessous pour activer votre compte :</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </body>
        </html>
      `,
    });

    console.log(" Email envoyé avec succès !");
    console.log("   ID:", data.id);
    
    return { success: true };
  } catch (error: any) {
    console.error("❌ ERREUR lors de l'envoi d'email:");
    console.error("   Message:", error.message);
    console.error("   Détails complets:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  console.log("📧 [DEBUG] Envoi email de bienvenue...");
  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Bienvenue sur TravelWorld ! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Bienvenue ${name} !</h1>
            <p>Votre compte est maintenant actif.</p>
          </body>
        </html>
      `,
    });

    console.log("✅ Email de bienvenue envoyé !");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erreur email bienvenue:", error.message);
    return { success: false, error };
  }
}

export async function sendStepNotification(
  email: string,
  name: string,
  country: string,
  stepTitle: string
) {
  console.log("📧 [DEBUG] Envoi notification d'étape...");
  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Nouvelle étape disponible - ${country}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Nouvelle étape !</h1>
            <p>Bonjour ${name}, vous pouvez maintenant passer à la prochaine étape :</p>
            <h3>${stepTitle}</h3>
          </body>
        </html>
      `,
    });

    console.log("✅ Notification envoyée !");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erreur notification:", error.message);
    return { success: false, error };
  }
}